import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pnr: {
        type: String,
    },
    vehicle: {
        pickUpDate: String,
        pickUpTime: String,
        returnDate: String,
        returnTime: String
    },
    driver: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        reference: String
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

export default mongoose.model('Rental', rentalSchema);
