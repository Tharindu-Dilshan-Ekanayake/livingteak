import { Schema, model, models } from 'mongoose'

const OrderItemSchema = new Schema(
	{
		productId: { type: String, required: true },
		name: { type: String, required: true, trim: true },
		price: { type: Number, required: true, min: 0 },
		quantity: { type: Number, required: true, min: 1 },
	},
	{ _id: false }
)

const OrderSchema = new Schema(
	{
		customer: {
			name: { type: String, required: true, trim: true },
			mobile: { type: String, required: true, trim: true },
			email: { type: String, trim: true },
			addressLine1: { type: String, required: true, trim: true },
			addressLine2: { type: String, trim: true },
			city: { type: String, required: true, trim: true },
		},
		items: {
			type: [OrderItemSchema],
			required: true,
			validate: {
				validator: (value: unknown) => Array.isArray(value) && value.length > 0,
				message: 'Order must contain at least one item',
			},
		},
		subtotal: { type: Number, required: true, min: 0 },
		orderStatus: {
			type: String,
			enum: ['pending', 'processing', 'delivering', 'completed'],
			default: 'pending',
		},
		paymentStatus: { type: Boolean, default: false },
	},
	{ timestamps: true }
)

OrderSchema.pre('validate', function () {
	if (this.orderStatus === 'completed') {
		this.paymentStatus = true
	}
})

if (models.Order) {
	delete models.Order
}

const Order = model('Order', OrderSchema)

export default Order
