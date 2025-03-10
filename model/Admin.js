import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  password:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
