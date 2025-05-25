import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    // Common fields for both task types
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskType: {
      type: String,
      enum: ['normal', 'timebuyer'],
      required: true,
    },
    attachment: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'applied', 'accepted', 'in-progress', 'ongoing', 'completed'], // ✅ fixed
      default: 'pending',
    },

    // Location field (GeoJSON + work mode)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      mode: {
        type: String,
        enum: ['Online', 'In-Person'],
        required: true
      },
      address: String
    },

    // Normal Task specific fields
    title: {
      type: String,
      required: function () {
        return this.taskType === 'normal';
      },
    },
    description: {
      type: String,
      required: function () {
        return this.taskType === 'normal';
      },
    },
    deadline: {
      type: Date,
      required: function () {
        return this.taskType === 'normal';
      },
    },
    budget: {
      type: Number,
      required: function () {
        return this.taskType === 'normal';
      },
    },

    // Time Buyer Task specific fields
    timeRequirement: {
      type: String,
      required: function () {
        return this.taskType === 'timebuyer';
      },
    },
    jobType: {
      type: String,
      required: function () {
        return this.taskType === 'timebuyer';
      },
    },
    skills: [
      {
        type: String,
      },
    ],
    workMode: {
      type: String,
      enum: ['Online', 'In-Person'],
      default: 'Online',
      required: function () {
        return this.taskType === 'timebuyer';
      },
    },
    budgetPerHour: {
      type: Number,
      required: function () {
        return this.taskType === 'timebuyer';
      },
    },
    additionalNotes: {
      type: String,
    },

    // Applicants array for task applications
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        proposedPrice: Number,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Assignment tracking
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // SavedBy array to track users who saved the task
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Add 2dsphere index for location queries
TaskSchema.index({ 'location.coordinates': '2dsphere' });

// Export model
const Task = mongoose.model('Task', TaskSchema);
export default Task;
