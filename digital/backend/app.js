import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import userRouter from './routes/userRouter.js';
import adminRouter from './routes/adminRouter.js';
import transactionRouter from './routes/transactionRouter.js';
import payuRouter from './routes/payuRouter.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Routes
app.use("/digital", userRouter);
app.use("/digital/admin", adminRouter);
app.use("/digital/transactions", transactionRouter);
app.use("/digital/payu", payuRouter);

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

export default app;
