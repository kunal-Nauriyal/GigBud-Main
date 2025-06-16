import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Prevent OverwriteModelError in development or repeated imports
const Blacklist = mongoose.models.Blacklist || mongoose.model('Blacklist', blacklistSchema);
export default Blacklist;
