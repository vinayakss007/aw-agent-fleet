import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getUserFromRequest } from "./auth";

export function authGuard(request: NextRequest): NextResponse | { userId: string; email: string; role: string } {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as any;
  }
  return user;
}

export function errorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, ...data }, { status });
}
