import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';

import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadMiddleware from './middleware/uploadMiddleware.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use in-memory MongoDB if no real URI is provided or if it's localhost (which fails without a local mongod)
    if (!mongoUri || mongoUri.includes('127.0.0.1')) {
      console.log('Starting in-memory MongoDB server for development...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('In-memory MongoDB started at:', mongoUri);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected successfully!');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

connectDB();

// Image Upload Endpoint
app.post('/api/upload', uploadMiddleware.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded');
  }
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Make uploads folder accessible statically
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/server/uploads')));

// Serve the static frontend (existing HTML site)
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
