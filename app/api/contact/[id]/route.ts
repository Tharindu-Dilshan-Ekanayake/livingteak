import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { Contact } from "@/models/Contact";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid contact id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Body must be a JSON object" },
      { status: 400 }
    );
  }

  const { readStatus } = body as { readStatus?: unknown };
  if (typeof readStatus !== "boolean") {
    return NextResponse.json(
      { error: "readStatus must be a boolean" },
      { status: 400 }
    );
  }

  await connectMongoose();

  const contact = await Contact.findByIdAndUpdate(
    id,
    { $set: { readStatus } },
    { new: true, runValidators: true }
  ).lean();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid contact id" }, { status: 400 });
  }

  await connectMongoose();

  const contact = await Contact.findByIdAndDelete(id).lean();
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
