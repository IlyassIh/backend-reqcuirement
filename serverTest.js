import express from 'express';
import routeAdmin from './routes/apiAdmin.js';
import dotenv from 'dotenv';
import connectDB from './database/DB.js';
import routeUser from './routes/apiUsers.js';

dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.use('/admin', routeAdmin);
app.use('/', routeUser);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log("connected to port " + PORT));
}

export default app;
