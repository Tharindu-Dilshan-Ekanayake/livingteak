import { Schema, model, models } from 'mongoose'

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
)

const Product = models.Product || model('Product', ProductSchema)

export default Product
