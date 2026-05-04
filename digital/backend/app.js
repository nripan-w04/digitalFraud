import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import userRouter from './routes/userRouter.js';
import adminRouter from './routes/adminRouter.js';
import transactionRouter from './routes/transactionRouter.js';
import payuRouter from './routes/payuRouter.js';
import disputeRouter from './routes/disputeRouter.js';
import errorHandler from './middleware/errorHandler.js';

import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

global.io = io;

io.on('connection', (socket) => {
    console.log('User connected to intelligence stream:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected from intelligence stream');
    });
});

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
app.use("/digital/disputes", disputeRouter);

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Neural Server started on port ${PORT}`);
});

export default app;
