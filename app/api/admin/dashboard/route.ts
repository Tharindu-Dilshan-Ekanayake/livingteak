import { getAdminDashboardData } from "@/lib/admin-dashboard";

function parseNumericParam(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dashboard = await getAdminDashboardData({
    year: parseNumericParam(searchParams.get("year")),
    month: parseNumericParam(searchParams.get("month")),
    day: parseNumericParam(searchParams.get("day")),
  });
  return Response.json(dashboard);
}
