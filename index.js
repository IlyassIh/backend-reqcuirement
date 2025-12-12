import express from 'express';
import routeAdmin from './routes/apiAdmin.js';
import dotenv from 'dotenv';
import connectDB from './database/DB.js';
import routeUser from './routes/apiUsers.js';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();

// CORS setup
app.use(cors({
    origin: 'https://ih-agency.vercel.app', // your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());

const PORT = process.env.PORT;

app.use('/admin', routeAdmin);
app.use('/', routeUser);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log("connected to port " + PORT));
}

export default app;
