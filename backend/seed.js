import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const users = [
  { username: 'mlt_user', password: 'password', role: 'MLT', name: 'Sarah Tech' },
  { username: 'doc_user', password: 'password', role: 'CLINICIAN', name: 'Dr. Smith' },
  { username: 'pat_user', password: 'password', role: 'PATIENT', name: 'John Doe' }
];

const seedUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Clear existing demo users
        await User.deleteMany({ username: { $in: ['mlt_user', 'doc_user', 'pat_user'] } });
        console.log('Cleared existing demo users.');

        await User.create(users);
        console.log('Demo users created and passwords hashed successfully.');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedUsers();
