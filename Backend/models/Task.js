import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['buyer', 'provider', 'user'], // ✅ 'user' added here
      required: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: function () {
          return this.mode === 'on-site';
        },
      },
      coordinates: {
        type: [Number],
        required: function () {
          return this.mode === 'on-site';
        },
      },
    },
    deadline: {
      type: Date,
      required: true,
    },
    timeRequirement: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      enum: ['remote', 'on-site'],
      default: 'remote',
    },
    budgetPerHour: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
    },
    attachment: {
      type: String,
    },
    applicants: [
      {
        name: String,
        proposedPrice: Number,
        rating: Number,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Enable geospatial queries for location
TaskSchema.index({ location: '2dsphere' });

const Task = mongoose.model('Task', TaskSchema);
export default Task;
