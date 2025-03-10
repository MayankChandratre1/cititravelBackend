import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    unique: true,
  },
  expiresIn: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  type: {
    type: String,
    enum: ["verification", "forget-password"],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

const OTP = mongoose.model("Otp", otpSchema);

export default OTP;
