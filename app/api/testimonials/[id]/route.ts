import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Testimonial from "@/models/Testimonial";

type RouteParams = { params: Promise<{ id: string }> };

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

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid testimonial id" }, { status: 400 });
  }

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

  await connectMongoose();

  const testimonial = await Testimonial.findByIdAndUpdate(id, parsed.value, {
    new: true,
    runValidators: true,
  }).lean();

  if (!testimonial) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }

  return NextResponse.json(testimonial);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid testimonial id" }, { status: 400 });
  }

  await connectMongoose();

  const testimonial = await Testimonial.findByIdAndDelete(id).lean();
  if (!testimonial) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
