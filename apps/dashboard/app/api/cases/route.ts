const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/cases`);
    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch cases" },
        { status: response.status },
      );
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}
