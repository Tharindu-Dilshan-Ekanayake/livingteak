import { Schema, model, models } from 'mongoose'

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const existingModel = models.Product

if (existingModel && !existingModel.schema.path('images')) {
  existingModel.schema.add({
    images: { type: [String], default: [] },
  })
}

if (existingModel && !existingModel.schema.path('active')) {
  existingModel.schema.add({
    active: { type: Boolean, default: true },
  })
}

const Product = existingModel || model('Product', ProductSchema)

export default Product
