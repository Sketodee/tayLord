import mongoose, { Schema, models } from 'mongoose';

const clientSchema = new Schema({
  designerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: String,
  phone: String,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Client = models.Client || mongoose.model('Client', clientSchema);

export default Client;