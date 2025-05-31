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
  age: {
    type: Number,
    min: 1,
    max: 120
  },
  profession: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
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
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Enable geospatial indexing
UserSchema.index({ location: '2dsphere' });

// Index for googleId to ensure query efficiency
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// Index for email for faster lookups
UserSchema.index({ email: 1 });

// Virtual for checking if OTP is expired
UserSchema.virtual('isOtpExpired').get(function() {
  if (!this.otp || !this.otpExpires) return true;
  return new Date() > this.otpExpires;
});

// Method to set OTP
UserSchema.methods.setOtp = function(code, expiresInMinutes = 5) {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + expiresInMinutes);
  
  this.otp = code;
  this.otpExpires = expires;
  return this.save();
};

// Method to verify OTP
UserSchema.methods.verifyOtp = function(code) {
  if (!this.otp || this.isOtpExpired) return false;
  return this.otp === code;
};

// Method to clear OTP
UserSchema.methods.clearOtp = function() {
  this.otp = null;
  this.otpExpires = null;
  return this.save();
};

const User = mongoose.model('User', UserSchema);
export default User;