import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { Agent, Conversation } from "@/lib/types";
import { chat } from "@/lib/ai";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { message, agentId, conversationHistory } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Find the agent
    const agent = agentId ? await db.getById<Agent>("agents", agentId) : null;
    const systemPrompt = agent?.system_prompt || "You are a helpful AI assistant.";
    const provider = agent?.model?.provider || "groq";
    const model = agent?.model?.model || "llama-3.3-70b-versatile";
    const apiKey = agent?.model?.api_key;

    // Call the AI provider
    const result = await chat({
      message,
      systemPrompt,
      provider,
      model,
      apiKey,
      conversationHistory,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        data: {
          response: `⚠️ Agent offline: ${result.error}. Please check your API key configuration.`,
          agentId: agentId || "default",
          note: "Configure your API key in Settings > API Keys",
        },
      });
    }

    // Save conversation if agent is known
    if (agent) {
      const conversation: Conversation = {
        id: uuidv4(),
        agent_id: agent.id,
        customer_id: agent.customer_id,
        user_message: message,
        agent_response: result.response,
        channel: agent.channel,
        created_at: new Date().toISOString(),
      };
      await db.create("conversations", conversation);

      // Update agent message count
      await db.update<Agent>("agents", agent.id, {
        messages_count: (agent.messages_count || 0) + 1,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        model: result.model,
        agentId: agentId || "default",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process message" },
      { status: 500 }
    );
  }
}
