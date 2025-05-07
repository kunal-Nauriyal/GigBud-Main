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
    required: true
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
      default: [0, 0] // [longitude, latitude] default to origin if not provided
    }
  }
}, { timestamps: true });

// Enable geospatial indexing
UserSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', UserSchema);
export default User;
