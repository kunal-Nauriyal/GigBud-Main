import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },  // city or college
  type: { type: String, enum: ['city', 'college'], required: true },
});

export default mongoose.model('Location', locationSchema);
