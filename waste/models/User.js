// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // Store HASHED passwords
  role: { type: String, enum: ['Seller', 'Buyer', 'Admin'], default: 'Seller' },
  isVerified: { type: Boolean, default: false },
  // Added for B2B verification
  kraPin: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);