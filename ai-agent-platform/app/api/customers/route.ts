import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { Customer } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// GET /api/customers
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admin can list all customers
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const customers = await db.getAll<Customer>("customers");
  return NextResponse.json({ customers });
}

// POST /api/customers
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { business_name, email, phone, business_type, plan } = body;

    if (!business_name || !email) {
      return NextResponse.json({ error: "Business name and email required" }, { status: 400 });
    }

    const customer: Customer = {
      id: uuidv4(),
      user_id: user.userId,
      business_name,
      email,
      phone: phone || "",
      business_type: business_type || "other",
      plan: plan || "starter",
      status: "active",
      agents_count: 0,
      messages_count: 0,
      revenue: plan === "professional" ? 5000 : plan === "enterprise" ? 8000 : 2000,
      created_at: new Date().toISOString(),
    };

    await db.create("customers", customer);
    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
