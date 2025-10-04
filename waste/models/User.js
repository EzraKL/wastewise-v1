// models/User.js (CLEANED AND CORRECTED)

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    companyName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    }, 
    // This is the fully corrected role definition with 'Both' included
    role: { 
        type: String, 
        enum: ['Seller', 'Buyer', 'Both', 'Admin'], // <-- NOW VALID
        default: 'Seller' 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    kraPin: { 
        type: String, 
        required: true, 
        unique: true 
    },
}, { 
    timestamps: true 
});

export default mongoose.models.User || mongoose.model('User', UserSchema);