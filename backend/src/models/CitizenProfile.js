const mongoose = require('mongoose');

const citizenProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    ageRange: {
      type: String,
      enum: ['18-25', '26-35', '36-50', '51-65', '65+'],
      default: '26-35',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      district: { type: String, trim: true },
    },
    preferredLanguage: {
      type: String,
      default: 'English',
      trim: true,
    },
    contactInfo: {
      alternatePhone: { type: String, trim: true },
      address: { type: String, trim: true },
      emergencyContact: { type: String, trim: true },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const CitizenProfile = mongoose.model('CitizenProfile', citizenProfileSchema);
module.exports = CitizenProfile;
