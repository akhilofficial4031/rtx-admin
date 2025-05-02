import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { eq } from "drizzle-orm";
import { projects } from "@/lib/db/schema/projects";

// Mock projects data for fallback
const MOCK_PROJECTS = [
  {
    projectId: "proj1",
    projectName: "Website Redesign",
    description: "Redesign of the company website with modern UI/UX principles",
    startingDate: "2023-09-01T00:00:00Z",
    pocName: "John Smith",
    pocEmail: "john@example.com",
    pocPhone: "555-123-4567",
    createdAt: "2023-08-15T10:30:00Z",
    updatedAt: "2023-08-15T10:30:00Z",
  },
  {
    projectId: "proj2",
    projectName: "Mobile App Development",
    description: "Development of iOS and Android mobile applications",
    startingDate: "2023-10-15T00:00:00Z",
    pocName: "Sarah Jones",
    pocEmail: "sarah@example.com",
    pocPhone: "555-987-6543",
    createdAt: "2023-09-01T14:15:00Z",
    updatedAt: "2023-09-01T14:15:00Z",
  },
  {
    projectId: "proj3",
    projectName: "E-commerce Platform",
    description: "Development of a scalable e-commerce solution",
    startingDate: "2023-08-01T00:00:00Z",
    pocName: "Mike Johnson",
    pocEmail: "mike@example.com",
    pocPhone: "555-567-8901",
    createdAt: "2023-07-15T09:45:00Z",
    updatedAt: "2023-07-15T09:45:00Z",
  },
  {
    projectId: "proj4",
    projectName: "Internal Dashboard",
    description: "Employee dashboard for tracking projects and performance",
    startingDate: "2023-11-01T00:00:00Z",
    pocName: "Emily Wilson",
    pocEmail: "emily@example.com",
    pocPhone: "555-234-5678",
    createdAt: "2023-10-10T11:20:00Z",
    updatedAt: "2023-10-10T11:20:00Z",
  },
  {
    projectId: "proj5",
    projectName: "API Integration",
    description: "Integration with third-party APIs for payment processing",
    startingDate: "2023-09-15T00:00:00Z",
    pocName: "David Brown",
    pocEmail: "david@example.com",
    pocPhone: "555-345-6789",
    createdAt: "2023-09-05T16:10:00Z",
    updatedAt: "2023-09-05T16:10:00Z",
  },
];

export async function GET(req: NextRequest) {
  try {
    // Check if DB connection is enabled (for testing)
    const url = new URL(req.url);
    const useDb = url.searchParams.get("useDb") !== "false";

    if (!useDb) {
      console.log("Database access skipped for projects API, using mock data");
      return NextResponse.json({ projects: MOCK_PROJECTS });
    }

    return await withDb(req, async (req, db) => {
      try {
        // Get all projects
        const allProjects = await db.select().from(projects);
        console.log(`Found ${allProjects.length} projects from database`);

        return NextResponse.json({ projects: allProjects });
      } catch (error) {
        console.error("Error fetching projects from database:", error);

        // Fallback to mock data
        console.log("Falling back to mock projects data");
        return NextResponse.json({ projects: MOCK_PROJECTS });
      }
    });
  } catch (outerError) {
    console.error("Outer error in projects API:", outerError);

    // Fallback to mock data
    return NextResponse.json({ projects: MOCK_PROJECTS });
  }
}

export async function POST(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const projectData = await req.json();

    try {
      const result = await db.insert(projects).values(projectData);
      return NextResponse.json(
        { success: true, data: result },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 400 }
      );
    }
  });
}

export async function PUT(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const { projectId, ...projectData } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    try {
      await db
        .update(projects)
        .set(projectData)
        .where(eq(projects.projectId, projectId));

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error updating project:", error);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 400 }
      );
    }
  });
}

export async function DELETE(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    try {
      await db.delete(projects).where(eq(projects.projectId, projectId));
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      return NextResponse.json(
        { error: "Failed to delete project" },
        { status: 400 }
      );
    }
  });
}
