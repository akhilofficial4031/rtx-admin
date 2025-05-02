import { NextRequest, NextResponse } from "next/server";

/**
 * This is a directory endpoint for available dropdown APIs.
 * It serves as documentation and discovery for available dropdown endpoints.
 */
export async function GET(req: NextRequest) {
  const baseUrl = new URL(req.url).origin;

  // Return a directory of available dropdown endpoints
  return NextResponse.json({
    message: "Dropdown APIs directory",
    available_endpoints: [
      {
        path: `${baseUrl}/api/dropdowns/users`,
        description: "Get users data for dropdown menus",
      },
      {
        path: `${baseUrl}/api/dropdowns/projects`,
        description: "Get projects data for dropdown menus",
      },
      // Future dropdown endpoints can be added here
    ],
  });
}
