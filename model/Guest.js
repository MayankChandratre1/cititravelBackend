import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pnr: {
        type: String,
        
    },
    bookingKey: String,
    hotel: {
        hotelCode: String,
        checkIn: String,
        checkOut: String,
        roomType: String,
        rateCode: String
    },
    guest: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    },
    payment: {
        amount: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Guest', guestSchema);
