import Transaction from "../model/transactionModel.js";
import Wallet from "../model/walletModel.js";
import User from "../model/userModel.js";
import axios from "axios";

export const initiateTransaction = async (req, res, next) => {
    try {
        const { receiverEmail, amount } = req.body;
        const senderId = req.user.id;

        if (!receiverEmail || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid transaction details" });
        }

        // 1. Get Sender Wallet
        const senderWallet = await Wallet.findOne({ userId: senderId });
        if (!senderWallet) {
            return res.status(404).json({ message: "Sender wallet not found" });
        }

        if (senderWallet.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // 2. Get Receiver
        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }
        if (receiver._id.toString() === senderId) {
            return res.status(400).json({ message: "Cannot send money to yourself" });
        }

        const receiverWallet = await Wallet.findOne({ userId: receiver._id });
        if (!receiverWallet) {
            return res.status(404).json({ message: "Receiver wallet not found" });
        }

        // 3. AI Fraud Check Hook
        let riskScore = 0;
        let isFraud = false;

        try {
            // Attempt to call the Python AI Microservice
            // NOTE: Replace with actual AI service URL later
            const aiResponse = await axios.post("http://localhost:8000/predict", {
                senderId,
                receiverId: receiver._id,
                amount,
                timestamp: new Date().toISOString()
            });
            riskScore = aiResponse.data.riskScore;
        } catch (error) {
            console.warn("Python AI Microservice unreachable. Falling back to simulated score.");
            // Simulated fallback: 20% chance of being high risk
            riskScore = Math.random() > 0.8 ? Math.floor(Math.random() * (100 - 75 + 1) + 75) : Math.floor(Math.random() * 40);
        }

        if (riskScore > 75) {
            isFraud = true;
        }

        // 4. Create Transaction Record
        const transaction = new Transaction({
            userId: senderId,
            walletId: senderWallet._id,
            amount: -amount, // Negative for sender
            type: "Withdrawal",
            status: isFraud ? "Suspicious" : "Completed",
            riskScore: riskScore,
            description: `Transfer to ${receiverEmail}`
        });

        await transaction.save();

        const receiverTransaction = new Transaction({
            userId: receiver._id,
            walletId: receiverWallet._id,
            amount: amount,
            type: "Deposit",
            status: isFraud ? "Suspicious" : "Completed",
            riskScore: riskScore,
            description: `Transfer from ${req.user.email || 'Sender'}`
        });

        await receiverTransaction.save();

        // 5. Update Wallets if not fraud
        if (!isFraud) {
            senderWallet.balance -= amount;
            await senderWallet.save();

            receiverWallet.balance += Number(amount);
            await receiverWallet.save();
        }

        res.status(201).json({
            message: isFraud ? "Transaction flagged for review" : "Transaction successful",
            transaction,
            riskScore
        });

    } catch (error) {
        next(error); // Passes error to Centralized Error Handler
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
