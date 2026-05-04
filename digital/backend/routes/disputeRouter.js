import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import Dispute from '../model/disputeModel.js';
import Transaction from '../model/transactionModel.js';

const router = express.Router();

// Create a dispute
router.post('/', verifyToken, async (req, res) => {
    try {
        const { transactionId, reason, description } = req.body;
        
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        const dispute = new Dispute({
            transactionId,
            userId: req.user.id,
            reason,
            description
        });

        await dispute.save();
        res.status(201).json({ message: "Dispute filed successfully", dispute });
    } catch (error) {
        res.status(500).json({ message: "Error filing dispute", error: error.message });
    }
});

// Get user's disputes
router.get('/', verifyToken, async (req, res) => {
    try {
        const disputes = await Dispute.find({ userId: req.user.id }).populate('transactionId');
        res.status(200).json(disputes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching disputes", error: error.message });
    }
});

export default router;
