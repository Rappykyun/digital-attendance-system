import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["student", "admin"], required: true },
  image: { type: String },
  faceData: [{ type: String }],
  registeredAt: { type: Date, default: Date.now },
  lastAttendance: { type: Date },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);