import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database/DB.js';
import routeAdmin from './routes/apiAdmin.js';
import routeUser from './routes/apiUsers.js';

dotenv.config();
connectDB();

const app = express();

// CORS setup for your frontend
app.use(cors({
  origin: 'https://ih-agency.vercel.app', // your frontend
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// Remove this line, it crashes the app:
// app.options('*', cors());

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/admin', routeAdmin);
app.use('/', routeUser);
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => console.log("Backend running on port " + PORT));

export default app;
