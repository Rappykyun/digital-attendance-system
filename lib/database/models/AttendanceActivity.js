import mongoose from "mongoose";

const attendanceActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  department: { 
    type: String,
    required: false,
    default: "All"
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  status: { 
    type: String, 
    enum: ["upcoming", "active", "completed"],
    default: "upcoming"
  },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timeIn: { type: Date },
    name: { type: String },
    department: { type: String },
    section: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
}, {
  strict: true,
  timestamps: true
});

// Update status based on time
attendanceActivitySchema.pre('save', function(next) {
  const now = new Date();
  if (now < this.startTime) {
    this.status = "upcoming";
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = "active";
  } else {
    this.status = "completed";
  }
  next();
});

// Add indexes for better query performance
attendanceActivitySchema.index({ startTime: -1 });
attendanceActivitySchema.index({ status: 1 });

// Clear the model if it exists to prevent the OverwriteModelError
if (mongoose.models.AttendanceActivity) {
  delete mongoose.models.AttendanceActivity;
}

// Create and export the model
export const AttendanceActivity = mongoose.model("AttendanceActivity", attendanceActivitySchema); 