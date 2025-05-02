import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Verify the token
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      // Add user info to the request headers
      const requestWithUser = new NextRequest(req, {
        headers: {
          ...Object.fromEntries(req.headers.entries()),
          "x-user-id": payload.id,
          "x-user-email": payload.email,
          "x-user-role": payload.role,
        },
      });

      // Call the handler with the enhanced request
      return handler(requestWithUser);
    } catch (error) {
      console.error("API Auth error:", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      );
    }
  };
}

// Utility to get user from headers set by withAuth
export function getUserFromRequest(req: NextRequest) {
  return {
    id: req.headers.get("x-user-id") || "",
    email: req.headers.get("x-user-email") || "",
    role: req.headers.get("x-user-role") || "",
  };
}
