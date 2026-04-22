import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { Contact } from "@/models/Contact";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields" },
        { status: 400 }
      );
    }

    // 1. Connect to DB and save the contact message
    await connectMongoose();
    const newContact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    // 2. Send an email notification
    // Uses typical SMTP settings. Use Gmail with an App Password.
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "dlshantharindu8@gmail.com",
        subject: `New Contact Message from ${name}`,
        text: `You have received a new contact message.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nMessage:\n${message}`,
        html: `<p>You have received a new contact message.</p>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Phone:</strong> ${phone || "N/A"}</p>
               <p><strong>Message:</strong></p>
               <p>${message.replace(/\n/g, '<br>')}</p>`,
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.warn("EMAIL_USER or EMAIL_PASS is not set in environment variables. Skipped sending email notification.");
    }

    return NextResponse.json({ success: true, contact: newContact }, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form. Please try again later." },
      { status: 500 }
    );
  }
}
