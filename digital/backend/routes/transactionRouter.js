import express from "express";
import { initiateTransaction, getUserTransactions } from "../controller/transactionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken); // Protect all transaction routes

router.post("/", initiateTransaction);
router.get("/", getUserTransactions);

export default router;
