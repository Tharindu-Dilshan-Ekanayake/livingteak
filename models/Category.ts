import { Schema, model, models } from 'mongoose'

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
)

const existingModel = models.Category

if (existingModel && !existingModel.schema.path('name')) {
  existingModel.schema.add({
    name: { type: String, required: true, trim: true, unique: true },
  })
}

const Category = existingModel || model('Category', CategorySchema)

export default Category
