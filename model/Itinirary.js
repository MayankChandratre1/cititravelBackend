import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['ADT', 'CHD', 'INF'] // Adult, Child, Infant
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    passportNumber: {
        type: String,
        required: true
    },
    passportExpiry: {
        type: Date,
        required: true
    }
});

const itinirarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    billing: {
        cardNumber: {
            type: String,
            required: true,
            select: false // For security, won't be returned in queries by default
        },
        expiryDate: {
            type: String,
            required: true,
            select: false
        },
        cardHolderName: {
            type: String,
            required: true
        }
    },
    address: {
        email: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    passengers: [passengerSchema],
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    pnr: {
        type: String,
        unique: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: {
        type: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    }
});

// Add timestamps for createdAt and updatedAt
itinirarySchema.set('timestamps', true);

const Itinirary = mongoose.model('Itinirary', itinirarySchema);

export default Itinirary;
