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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
    
    // Generate tracking token
    this.trackingToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  next();
});

const Order = models.Order || mongoose.model('Order', orderSchema);

export default Order;