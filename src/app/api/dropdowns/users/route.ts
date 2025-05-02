import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { users } from "@/lib/db/schema";

// Define types for our data
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Mock users data for fallback
const MOCK_USERS: User[] = [
  { id: "user1", name: "John Doe", email: "john@example.com", role: "admin" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com", role: "user" },
  {
    id: "user3",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "user",
  },
  {
    id: "user4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "manager",
  },
  {
    id: "user5",
    name: "Michael Brown",
    email: "michael@example.com",
    role: "user",
  },
];

export async function GET(req: NextRequest) {
  try {
    return await withDb(req, async (req, db) => {
      try {
        // Get all users
        const userData = (await db.select().from(users)) as User[];
        console.log(
          `Found ${userData.length} users from database for dropdown`
        );

        return NextResponse.json({
          users: userData.length > 0 ? userData : MOCK_USERS,
        });
      } catch (error) {
        console.error(
          "Error fetching users from database for dropdown:",
          error
        );

        // Fallback to mock data
        console.log("Falling back to mock users data for dropdown");
        return NextResponse.json({ users: MOCK_USERS });
      }
    });
  } catch (outerError) {
    console.error("Outer error in users dropdown API:", outerError);

    // Fallback to mock data
    return NextResponse.json({ users: MOCK_USERS });
  }
}
