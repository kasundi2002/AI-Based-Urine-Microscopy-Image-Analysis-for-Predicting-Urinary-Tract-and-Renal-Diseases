import mongoose from 'mongoose';
import Patient from './models/Patient.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const patients = await Patient.find().sort({ updatedAt: -1 }).limit(3);
    
    fs.writeFileSync('db_patients.json', JSON.stringify(patients, null, 2), 'utf8');
    process.exit(0);
}

check().catch(console.error);
