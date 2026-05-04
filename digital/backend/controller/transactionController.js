import Transaction from "../model/transactionModel.js";
import Wallet from "../model/walletModel.js";
import User from "../model/userModel.js";
import axios from "axios";

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

        const receiverWallet = await Wallet.findOne({ userId: receiver._id });

        // 5. Execute Transfer
        senderWallet.balance -= Number(amount);
        receiverWallet.balance += Number(amount);

        await senderWallet.save();
        await receiverWallet.save();

        // 6. Record Transactions
        const senderTx = new Transaction({
            userId: sender._id,
            walletId: senderWallet._id,
            beneficiaryId: receiver._id,
            amount: -Number(amount),
            type: "Transfer",
            status: "Completed",
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
            status: "Completed",
            location,
            deviceId,
            description: `Received from ${sender.email}`
        });

        await senderTx.save();
        await receiverTx.save();

        res.status(201).json({ 
            message: "Neural transfer finalized successfully.", 
            transaction: senderTx 
        });

    } catch (error) {
        next(error);
    }
};
