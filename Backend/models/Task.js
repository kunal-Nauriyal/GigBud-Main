import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    // Creator of the task
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
      enum: ['pending', 'applied', 'accepted', 'in-progress', 'ongoing', 'completed'],
      default: 'pending',
    },

    // Geo + mode + optional address
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      mode: {
        type: String,
        enum: ['Online', 'In-Person'],
        required: true,
      },
      address: String,
    },

    // Fields for 'normal' type
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

    // Fields for 'timebuyer' type
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

    // Applicants: including reference + custom info
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        proposedPrice: {
          type: Number,
        },
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

    // Assignment status
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Track users who saved the task
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Indexing for location-based queries
TaskSchema.index({ 'location.coordinates': '2dsphere' });

const Task = mongoose.model('Task', TaskSchema);
export default Task;
