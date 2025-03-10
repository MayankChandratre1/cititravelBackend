import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.config.js';
import sabreRouter from './routes/sabre-routes.js';
import authRouter from './routes/auth-routes.js';
import userRouter from './routes/user-router.js';
import adminRouter from './routes/admin-routes.js';
import homeRouter from './routes/landing-page-routes.js';
import paymentRouter from './routes/payment.routes.js';
import auth from './middlewares/auth-middleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.use("/api/admin", adminRouter);
app.use("/api/home", homeRouter);

app.use("/api/v1/sabre", sabreRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user",auth, userRouter)
app.use("/api/v1/pay", paymentRouter)

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT,(err,res)=>{
    console.log("Server Listening on port "+PORT);
    connectDB();
});