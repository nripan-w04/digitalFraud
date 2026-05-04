import express from "express";
import {  getUserTransactions, initiateTransaction } from "../controller/transactionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken); // Protect all transaction routes

router.get("/", getUserTransactions);
router.post("/initiate", initiateTransaction);

export default router;
