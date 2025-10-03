// models/Listing.js
import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true, trim: true },
  materialType: { type: String, required: true }, // e.g., 'PET Plastic', 'Scrap Metal'
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, enum: ['Tons', 'Kgs', 'Units'], default: 'Tons' },
  pricePerUnit: { type: Number, required: true, min: 0 },
  // Location data for search, not for direct contact
  locationName: { type: String, required: true }, 
  status: { type: String, enum: ['Active', 'Pending', 'Sold'], default: 'Active' },
}, { timestamps: true });

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);