import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    timeIn: { type: Date, required: true },
    timeOut: { type: Date },
    status: {
      type: String,
      enum: ["present", "late", "absent"],
      required: true,
    },
    verificationMethod: {
      type: String,
      enum: ["face", "manual"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
