import mongoose, { Schema, models } from 'mongoose';

const businessProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  tagline: String,
  address: String,
  phone: String,
  email: String,
  website: String,
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
  },
  logoUrl: String,
  primaryColor: {
    type: String,
    default: '#3B82F6',
  },
  secondaryColor: {
    type: String,
    default: '#1E40AF',
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

const BusinessProfile = models.BusinessProfile || mongoose.model('BusinessProfile', businessProfileSchema);

export default BusinessProfile;