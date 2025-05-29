import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.isGoogleUser; // Only required for non-Google users
    }
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values (for non-Google users)
  },
  avatar: {
    type: String // For storing profile picture URL
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(val) {
          return val.length === 2 && !isNaN(val[0]) && !isNaN(val[1]);
        },
        message: 'Coordinates should be an array of two numbers [longitude, latitude]'
      },
      default: [0, 0]
    }
  }
}, { timestamps: true });

// Enable geospatial indexing
UserSchema.index({ location: '2dsphere' });

// Index for googleId to ensure query efficiency
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', UserSchema);
export default User;