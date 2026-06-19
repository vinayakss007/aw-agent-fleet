import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";
import { User } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const users = await db.getAll<User>("users");

    // Check if email already exists
    if (users.find((u) => u.email === email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const userCount = users.length;
    const newUser: User = {
      id: uuidv4(),
      email,
      name,
      password_hash,
      role: userCount === 0 ? "admin" : "customer",
      plan: userCount === 0 ? "enterprise" : "none",
      created_at: new Date().toISOString(),
    };

    await db.create("users", newUser);

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        plan: newUser.plan,
      },
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
