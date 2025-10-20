import mongoose, { Schema, models } from 'mongoose';

const orderItemSchema = new Schema({
  clothingType: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  measurementId: {
    type: Schema.Types.ObjectId,
    ref: 'Measurement',
  },
  fabric: String,
  color: String,
  notes: String,
  // NEW: Pricing fields for each item
  unitPrice: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
});

const statusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: String,
});

const orderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  designerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  items: [orderItemSchema],
  status: {
    type: String,
    enum: [
      'pending',
      'measurements_taken',
      'fabric_sourced',
      'cutting',
      'in_progress',
      'fitting',
      'alterations',
      'completed',
      'delivered',
      'cancelled'
    ],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  completedDate: Date,
  statusHistory: [statusHistorySchema],
  images: [String],
  notes: String,
  trackingToken: {
    type: String,
    unique: true,
    required: true,
  },
  // NEW: Pricing and tax fields
  currency: {
    type: String,
    default: 'NGN', // Nigerian Naira
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  vatRate: {
    type: Number,
    default: 7.5, // 7.5% VAT in Nigeria
  },
  vatAmount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate totals before saving
orderSchema.pre('validate', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.totalPrice = item.unitPrice * item.quantity;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calculate VAT
  this.vatAmount = (this.subtotal * this.vatRate) / 100;

  // Calculate total
  this.totalAmount = this.subtotal + this.vatAmount - this.discount;

  next();
});

// Generate order ID and tracking token before validation
orderSchema.pre('validate', async function(next) {
  if (this.isNew && !this.orderId) {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderId = `ORD-${year}-${timestamp}-${random}`;
  }
  
  if (this.isNew && !this.trackingToken) {
    this.trackingToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  next();
});

const Order = models.Order || mongoose.model('Order', orderSchema);

export default Order;