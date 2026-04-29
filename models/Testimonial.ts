import { Schema, model, models } from "mongoose";

const TestimonialSchema = new Schema(
  {
    clientName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const existingModel = models.Testimonial;

if (existingModel && !existingModel.schema.path("active")) {
  existingModel.schema.add({
    active: { type: Boolean, default: true },
  });
}

const Testimonial = existingModel || model("Testimonial", TestimonialSchema);

export default Testimonial;
