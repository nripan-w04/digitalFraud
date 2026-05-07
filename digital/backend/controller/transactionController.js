import Transaction from "../model/transactionModel.js";
import Wallet from "../model/walletModel.js";
import User from "../model/userModel.js";
import axios from "axios";
import { checkFraudRisk } from "../utils/fraudService.js";

export const preCheckRisk = async (req, res, next) => {
    try {
        const { recipientEmail, amount, location, deviceId } = req.body;
        const senderId = req.user.id;

        if (!recipientEmail || !amount) {
            return res.status(400).json({ message: "Parameters missing for risk analysis." });
        }

        const receiver = await User.findOne({ email: recipientEmail });
        if (!receiver) {
            return res.status(404).json({ message: "Recipient not found." });
        }

        // --- SIMULATION TRIGGER FOR TESTING ---
        if (Number(amount) === 99.99) {
            return res.status(200).json({
                riskScore: 95,
                level: 'CRITICAL',
                insight: "SIMULATION_MODE: Sender has a simulated history of high-risk activity."
            });
        }
        // Fetch last 10 transactions for sender and receiver
        const senderHistory = await Transaction.find({ userId: senderId }).sort({ createdAt: -1 }).limit(10);
        const receiverHistory = await Transaction.find({ userId: receiver._id }).sort({ createdAt: -1 }).limit(10);

        const highRiskSenderCount = senderHistory.filter(tx => tx.riskScore > 75).length;
        const highRiskReceiverCount = receiverHistory.filter(tx => tx.riskScore > 75).length;

        // Perform AI check (with simulated context for now)
        const riskResult = await checkFraudRisk(senderId, receiver._id, amount, deviceId, location, req.ip);

        // Adjust score based on history
        let finalScore = riskResult.riskScore;
        let insight = "Standard behavioral pattern detected.";

        if (highRiskSenderCount > 2) {
            finalScore = Math.min(100, finalScore + 15);
            insight = "Sender has a recent history of suspicious activity.";
        }
        if (highRiskReceiverCount > 1) {
            finalScore = Math.min(100, finalScore + 10);
            insight = "Recipient node has been flagged in previous anomaly logs.";
        }
        if (amount > 10000) {
            finalScore = Math.min(100, finalScore + 5);
            insight = "High-volume transfer detected. Additional verification may be required.";
        }

        res.status(200).json({
            riskScore: finalScore,
            level: finalScore > 75 ? 'CRITICAL' : finalScore > 40 ? 'ELEVATED' : 'SAFE',
            insight
        });

    } catch (error) {
        next(error);
    }
};

export const getUserTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};
export const initiateTransaction = async (req, res, next) => {
    try {
        const { recipientEmail, amount, description, location, deviceId } = req.body;
        const senderId = req.user.id;

        // 1. Validate Geolocation
        if (!location || !location.lat || !location.lon) {
            return res.status(403).json({
                message: "GEOLOCATION_REQUIRED: Transaction aborted. Hardware origin telemetry is missing."
            });
        }

        // 2. Validate Amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount specified." });
        }

        // 3. Get Sender & Receiver
        const sender = await User.findById(senderId);
        const receiver = await User.findOne({ email: recipientEmail });

        if (!receiver) {
            return res.status(404).json({ message: "Recipient handle not found in the global ledger." });
        }

        if (sender._id.equals(receiver._id)) {
            return res.status(400).json({ message: "Intra-node loopback transfers are not permitted via this terminal." });
        }

        // 4. Check Sender Balance (Liquidity Verification)
        const senderWallet = await Wallet.findOne({ userId: senderId });
        const numericAmount = Number(amount);

        if (!senderWallet || senderWallet.balance < numericAmount) {
            return res.status(402).json({
                message: "INSUFFICIENT_LIQUIDITY: Your vault balance is below the required threshold for this transmission."
            });
        }

        // 5. Execute Risk Assessment
        const riskResult = await checkFraudRisk(senderId, receiver._id, amount, deviceId, location, req.ip);

        // 6. Execute Transfer
        senderWallet.balance -= Number(amount);
        receiverWallet.balance += Number(amount);

        await senderWallet.save();
        await receiverWallet.save();

        // 7. Record Transactions
        const senderTx = new Transaction({
            userId: sender._id,
            walletId: senderWallet._id,
            beneficiaryId: receiver._id,
            amount: -Number(amount),
            type: "Transfer",
            status: riskResult.riskScore > 75 ? "Suspicious" : "Completed",
            riskScore: riskResult.riskScore,
            isBlocked: riskResult.riskScore > 75,
            location,
            deviceId,
            description: description || `Transfer to ${recipientEmail}`
        });

        const receiverTx = new Transaction({
            userId: receiver._id,
            walletId: receiverWallet._id,
            beneficiaryId: sender._id,
            amount: Number(amount),
            type: "Transfer",
            status: riskResult.riskScore > 75 ? "Suspicious" : "Completed",
            riskScore: riskResult.riskScore,
            location,
            deviceId,
            description: `Received from ${sender.email}`
        });

        await senderTx.save();
        await receiverTx.save();

        res.status(201).json({
            message: riskResult.riskScore > 75
                ? "Neural channel flagged for manual review. Funds held."
                : "Neural transfer finalized successfully.",
            transaction: senderTx
        });

    } catch (error) {
        next(error);
    }
};
