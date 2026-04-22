import mongoose, { Schema, model, models } from "mongoose";

export interface IContact {
  name: string;
  email: string;
  phone?: string;
  message: string;
  readStatus: boolean;

  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  message: { type: String, required: true },
  readStatus: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Contact = models.Contact || model<IContact>("Contact", ContactSchema);
