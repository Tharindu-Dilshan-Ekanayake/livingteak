import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import SiteSetting from "@/models/SiteSetting";

const DEFAULT_SETTINGS = {
  key: "main",
  projectsCompleted: 10,
  happyClients: 20,
  yearsExperience: 2,
};

function parseNonNegativeNumber(value: unknown) {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
}

function parseSettings(body: unknown) {
  if (!body || typeof body !== "object") {
    return { error: "Body must be a JSON object" };
  }

  const { projectsCompleted, happyClients, yearsExperience } = body as {
    projectsCompleted?: unknown;
    happyClients?: unknown;
    yearsExperience?: unknown;
  };

  const parsedProjects = parseNonNegativeNumber(projectsCompleted);
  const parsedClients = parseNonNegativeNumber(happyClients);
  const parsedYears = parseNonNegativeNumber(yearsExperience);

  if (parsedProjects === null) {
    return { error: "Projects completed must be a number greater than or equal to 0" };
  }
  if (parsedClients === null) {
    return { error: "Happy clients must be a number greater than or equal to 0" };
  }
  if (parsedYears === null) {
    return { error: "Years experience must be a number greater than or equal to 0" };
  }

  return {
    value: {
      projectsCompleted: parsedProjects,
      happyClients: parsedClients,
      yearsExperience: parsedYears,
    },
  };
}

export async function GET() {
  await connectMongoose();

  const settings = await SiteSetting.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: DEFAULT_SETTINGS },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseSettings(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await connectMongoose();

  const settings = await SiteSetting.findOneAndUpdate(
    { key: "main" },
    { $set: parsed.value },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return NextResponse.json(settings);
}
