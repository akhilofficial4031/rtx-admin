import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { createToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // In development mode, you can use a mock user for testing
    if (
      process.env.NODE_ENV !== "production" &&
      email === "test@example.com" &&
      password === "password"
    ) {
      console.warn("Using mock user for development");
      const mockUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        role: "admin",
      };

      const token = createToken({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      return NextResponse.json({
        success: true,
        token,
        user: mockUser,
      });
    }

    // Hash the password for comparison with stored hash
    // const hashedPassword = hashPassword(password);

    try {
      // Query the database to find the user with the provided email
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const user = userResults[0];

      // User not found or password doesn't match
      if (!user || user.password !== password) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Create a JWT token
      const token = createToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Return the user information and token
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error, please try again later" },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
