// seedLocations.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from './models/Location.js';

dotenv.config();

const cities = [
  "Delhi",
  "Mumbai",
  "Kolkata",
  "Chennai",
  "Lucknow",
  "Bangalore",
];

const colleges = [
  "IIT Delhi",
  "IIT Kanpur",
  "IIT Bombay",
  "BITS Pilani",
  "IIIT Hyderabad",
];

async function seedLocations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Location.deleteMany();

    const cityDocs = cities.map(name => ({ name, type: 'city' }));
    const collegeDocs = colleges.map(name => ({ name, type: 'college' }));

    await Location.insertMany([...cityDocs, ...collegeDocs]);

    console.log('Seeding complete.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedLocations();
