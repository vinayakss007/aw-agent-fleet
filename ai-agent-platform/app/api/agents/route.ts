import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { Agent } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// GET /api/agents — list agents
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customer_id");

  let agents = await db.getAll<Agent>("agents");

  if (customerId) {
    agents = agents.filter((a) => a.customer_id === customerId);
  }

  // Non-admin users only see their own agents
  if (user.role !== "admin") {
    agents = agents.filter((a) => a.customer_id === user.userId);
  }

  return NextResponse.json({ agents });
}

// POST /api/agents — create agent
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, type, channel, model, system_prompt, customer_id } = body;

    if (!name) {
      return NextResponse.json({ error: "Agent name required" }, { status: 400 });
    }

    const agent: Agent = {
      id: uuidv4(),
      customer_id: customer_id || user.userId,
      name,
      type: type || "support",
      channel: channel || "web",
      model: model || { provider: "groq", model: "llama-3.3-70b-versatile" },
      system_prompt: system_prompt || "You are a helpful AI assistant.",
      status: "active",
      messages_count: 0,
      created_at: new Date().toISOString(),
    };

    await db.create("agents", agent);
    return NextResponse.json({ success: true, agent }, { status: 201 });
  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}

// PUT /api/agents — update agent
export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Agent ID required" }, { status: 400 });
    }

    const agent = await db.getById<Agent>("agents", id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const updated = await db.update<Agent>("agents", id, updates);
    return NextResponse.json({ success: true, agent: updated });
  } catch (error) {
    console.error("Update agent error:", error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

// DELETE /api/agents — delete agent
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agent_id");

  if (!agentId) {
    return NextResponse.json({ error: "agent_id required" }, { status: 400 });
  }

  const deleted = await db.remove("agents", agentId);
  if (!deleted) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Agent deleted" });
}
