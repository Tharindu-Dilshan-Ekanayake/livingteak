import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Testimonial from "@/models/Testimonial";

function parseTestimonial(body: unknown) {
  if (!body || typeof body !== "object") {
    return { error: "Body must be a JSON object" };
  }

  const { clientName, rating, feedback, active } = body as {
    clientName?: unknown;
    rating?: unknown;
    feedback?: unknown;
    active?: unknown;
  };

  const parsedClientName = typeof clientName === "string" ? clientName.trim() : "";
  const parsedFeedback = typeof feedback === "string" ? feedback.trim() : "";
  const parsedRating =
    typeof rating === "number" ? rating : typeof rating === "string" ? Number(rating) : NaN;
  const parsedActive = typeof active === "boolean" ? active : true;

  if (!parsedClientName) {
    return { error: "Client name is required" };
  }
  if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return { error: "Rating must be between 1 and 5" };
  }
  if (!parsedFeedback) {
    return { error: "Client feedback is required" };
  }

  return {
    value: {
      clientName: parsedClientName,
      rating: Math.round(parsedRating),
      feedback: parsedFeedback,
      active: parsedActive,
    },
  };
}

export async function GET(request: Request) {
  await connectMongoose();

  const { searchParams } = new URL(request.url);
  const activeParam = searchParams.get("active");
  const filter: Record<string, unknown> = {};

  if (activeParam?.toLowerCase() === "true") filter.active = true;
  if (activeParam?.toLowerCase() === "false") filter.active = false;

  const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(testimonials);
}

export async function POST(request: Request) {
  await connectMongoose();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseTestimonial(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const testimonial = await Testimonial.create(parsed.value);
  return NextResponse.json(testimonial, { status: 201 });
}
