import mongoose from 'mongoose';
import Report from './models/Report.js';
import dotenv from 'dotenv';
import util from 'util';

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const reports = await Report.find().sort({ createdAt: -1 }).limit(5);

    console.log(`Found ${reports.length} recent reports.`);
    for (const r of reports) {
        console.log(`\n============================`);
        console.log(`Report _id: ${r._id}`);
        console.log(`Patient _id: ${r.patientId}`);
        console.log(`Status: ${r.status}`);
        console.log(`Created At: ${r.createdAt}`);
        console.log(`Has analysis? ${!!r.analysis}`);
        if(r.analysis) {
             console.log(`Analysis Object Keys:`, Object.keys(r.analysis));
        }
    }
    process.exit(0);
}

check().catch(console.error);
