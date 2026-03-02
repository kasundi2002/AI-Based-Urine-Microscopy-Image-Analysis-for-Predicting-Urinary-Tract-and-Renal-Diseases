import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';

// Env and DB
import connectDB from './config/db.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import patientAccessRoutes from './routes/patientAccessRoutes.js';

// Middleware
import errorHandler from './middleware/errorMiddleware.js';

// Load Config
dotenv.config();

// Connect Database
connectDB();

// Resolve dir for static assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parser
app.use(express.json());

// Dev logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// SECURITY MIDDLEWARES -- Best practices
// Set security headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // For images

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again in 15 minutes'
});
app.use('/api', limiter);

// Prevent NoSQL injections
app.use(mongoSanitize());

// Enable CORS
app.use(cors({
    origin: '*', // Allow your frontend URLs in production
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/patient-access', patientAccessRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the AI Diagnostics Platform Backend' });
});

// Custom Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
