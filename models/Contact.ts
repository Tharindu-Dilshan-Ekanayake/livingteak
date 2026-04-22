import mongoose, { Schema, model, models } from "mongoose";

export interface IContact {
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Contact = models.Contact || model<IContact>("Contact", ContactSchema);
