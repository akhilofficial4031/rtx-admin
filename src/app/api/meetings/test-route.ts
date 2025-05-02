import { NextRequest, NextResponse } from "next/server";

// Create a sample endpoint that doesn't require authentication
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.title || !data.meetingDate || !data.coordinatorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Just log the data and return success for testing
    console.log("Meeting data received:", data);

    return NextResponse.json(
      {
        message: "Meeting created successfully",
        meeting: {
          id: "test-" + Date.now(),
          ...data,
          meetingDate: new Date(data.meetingDate).toISOString(),
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
