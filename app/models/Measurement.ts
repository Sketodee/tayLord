import mongoose, { Schema, models } from 'mongoose';

const measurementSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  clothingType: {
    type: String,
    required: true,
    enum: ['shirt', 'trouser', 'suit', 'blouse', 'skirt', 'dress', 'gown', 'traditional'],
  },
  measurements: {
    type: Map,
    of: Number,
  },
  unit: {
    type: String,
    enum: ['inches', 'cm'],
    default: 'inches',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Measurement = models.Measurement || mongoose.model('Measurement', measurementSchema);

export default Measurement;