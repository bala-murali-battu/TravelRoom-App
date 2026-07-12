import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import tripRoutes from './routes/tripRoutes.js';

dotenv.config();

// Launch active pipeline link with local MongoDB system server instance strings
connectDB();

const app = express();

// Global Request Middlewares
app.use(express.json());
app.use(cors()); // Enables cross-origin query traffic streams from Vite port 5173

// Endpoints Binding Maps
app.use('/api/trips', tripRoutes);

app.get('/', (req, res) => res.send('TravelRoom Full-Stack REST Backend Core Live!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend engine listening on local area network port: ${PORT}`));
