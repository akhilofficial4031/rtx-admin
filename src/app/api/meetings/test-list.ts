import { NextRequest, NextResponse } from "next/server";

// Sample mock data for meetings
const MOCK_MEETINGS = [
  {
    id: "meet1",
    title: "Project Kickoff",
    minutes: "Discussed project scope and timeline.",
    meetingDate: "2023-09-15T10:00:00Z",
    createdAt: "2023-09-10T14:30:00Z",
    coordinatorId: "user1",
    coordinatorName: "John Doe",
    projectId: "proj1",
  },
  {
    id: "meet2",
    title: "Weekly Sprint Review",
    minutes: "Reviewed progress on tasks and discussed blockers.",
    meetingDate: "2023-09-22T14:00:00Z",
    createdAt: "2023-09-20T09:15:00Z",
    coordinatorId: "user2",
    coordinatorName: "Jane Smith",
    projectId: "proj2",
  },
  {
    id: "meet3",
    title: "Client Presentation",
    minutes: "Presented project progress to client and gathered feedback.",
    meetingDate: "2023-09-28T11:00:00Z",
    createdAt: "2023-09-25T16:45:00Z",
    coordinatorId: "user3",
    coordinatorName: "Alex Johnson",
    projectId: "proj1",
  },
  {
    id: "meet4",
    title: "Design Review",
    minutes: "Reviewed UI designs and made suggestions for improvements.",
    meetingDate: "2023-10-05T13:30:00Z",
    createdAt: "2023-10-02T10:00:00Z",
    coordinatorId: "user4",
    coordinatorName: "Sarah Williams",
    projectId: "proj3",
  },
  {
    id: "meet5",
    title: "Backend Architecture Discussion",
    minutes: "Discussed database schema and API endpoints.",
    meetingDate: "2023-10-12T09:00:00Z",
    createdAt: "2023-10-10T14:20:00Z",
    coordinatorId: "user5",
    coordinatorName: "Michael Brown",
    projectId: "proj2",
  },
];

// Get meetings with pagination
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get meetings slice based on pagination
    const paginatedMeetings = MOCK_MEETINGS.slice(offset, offset + limit);

    // Calculate total pages
    const totalPages = Math.ceil(MOCK_MEETINGS.length / limit);

    return NextResponse.json({
      meetings: paginatedMeetings,
      pagination: {
        total: MOCK_MEETINGS.length,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching test meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}
