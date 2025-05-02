import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { projects } from "@/lib/db/schema/projects";

// Define type for project data
type Project = {
  projectId: string;
  projectName: string;
  description: string | null;
  startingDate?: Date | null;
  pocName?: string | null;
  pocEmail?: string | null;
  pocPhone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

// Mock projects data for fallback
const MOCK_PROJECTS: Project[] = [
  {
    projectId: "proj1",
    projectName: "Website Redesign",
    description: "Redesign of the company website with modern UI/UX principles",
  },
  {
    projectId: "proj2",
    projectName: "Mobile App Development",
    description: "Development of iOS and Android mobile applications",
  },
  {
    projectId: "proj3",
    projectName: "E-commerce Platform",
    description: "Development of a scalable e-commerce solution",
  },
  {
    projectId: "proj4",
    projectName: "Internal Dashboard",
    description: "Employee dashboard for tracking projects and performance",
  },
  {
    projectId: "proj5",
    projectName: "API Integration",
    description: "Integration with third-party APIs for payment processing",
  },
];

export async function GET(req: NextRequest) {
  try {
    // Check if DB connection is enabled (for testing)
    const url = new URL(req.url);
    const useDb = url.searchParams.get("useDb") !== "false";

    if (!useDb) {
      console.log(
        "Database access skipped for projects dropdown API, using mock data"
      );
      return NextResponse.json({ projects: MOCK_PROJECTS });
    }

    return await withDb(req, async (req, db) => {
      try {
        // Get all projects
        const projectData = (await db.select().from(projects)) as Project[];
        console.log(
          `Found ${projectData.length} projects from database for dropdown`
        );

        return NextResponse.json({
          projects: projectData.length > 0 ? projectData : MOCK_PROJECTS,
        });
      } catch (error) {
        console.error(
          "Error fetching projects from database for dropdown:",
          error
        );

        // Fallback to mock data
        console.log("Falling back to mock projects data for dropdown");
        return NextResponse.json({ projects: MOCK_PROJECTS });
      }
    });
  } catch (outerError) {
    console.error("Outer error in projects dropdown API:", outerError);

    // Fallback to mock data
    return NextResponse.json({ projects: MOCK_PROJECTS });
  }
}
