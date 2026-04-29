import { Schema, model, models } from "mongoose";

const SiteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    projectsCompleted: { type: Number, required: true, min: 0, default: 10 },
    happyClients: { type: Number, required: true, min: 0, default: 20 },
    yearsExperience: { type: Number, required: true, min: 0, default: 2 },
  },
  { timestamps: true }
);

const existingModel = models.SiteSetting;

if (existingModel && !existingModel.schema.path("projectsCompleted")) {
  existingModel.schema.add({
    projectsCompleted: { type: Number, required: true, min: 0, default: 10 },
  });
}

if (existingModel && !existingModel.schema.path("happyClients")) {
  existingModel.schema.add({
    happyClients: { type: Number, required: true, min: 0, default: 20 },
  });
}

if (existingModel && !existingModel.schema.path("yearsExperience")) {
  existingModel.schema.add({
    yearsExperience: { type: Number, required: true, min: 0, default: 2 },
  });
}

const SiteSetting = existingModel || model("SiteSetting", SiteSettingSchema);

export default SiteSetting;
