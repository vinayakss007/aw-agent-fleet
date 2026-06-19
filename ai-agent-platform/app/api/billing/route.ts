import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { User } from "@/lib/types";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

// Plan pricing
const PLANS = {
  starter: { name: "Starter", price: 2000, agents: 1, messages: 1000 },
  professional: { name: "Professional", price: 5000, agents: 3, messages: 10000 },
  enterprise: { name: "Enterprise", price: 8000, agents: -1, messages: -1 },
};

// GET /api/billing — get current plan info
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.getAll<User>("users");
  const fullUser = users.find((u) => u.id === user.userId);

  return NextResponse.json({
    plan: fullUser?.plan || "none",
    plans: PLANS,
  });
}

// POST /api/billing — create Razorpay payment link
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { plan } = await request.json();
    const planConfig = PLANS[plan as keyof typeof PLANS];

    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // If Razorpay credentials are configured, create a real payment link
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

      const response = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: planConfig.price * 100, // in paise
          currency: "INR",
          description: `${planConfig.name} Plan - AbetWorks Agent Fleet`,
          customer: {
            email: user.email,
          },
          notify: {
            email: true,
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/billing?success=true&plan=${plan}`,
          callback_method: "get",
        }),
      });

      const data = await response.json();

      if (data.short_url) {
        return NextResponse.json({
          success: true,
          payment_url: data.short_url,
          plan: planConfig,
        });
      }
    }

    // Fallback: return plan info (for development)
    return NextResponse.json({
      success: true,
      payment_url: null,
      plan: planConfig,
      message: "Razorpay not configured. In production, set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    });
  } catch (error) {
    console.error("Billing error:", error);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
