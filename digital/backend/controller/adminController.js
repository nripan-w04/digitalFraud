import User from "../model/userModel.js";
import Transaction from "../model/transactionModel.js";
import Blacklist from "../model/blacklistModel.js";
import Wallet from "../model/walletModel.js";

export const blockDevice = async (req, res) => {
    try {
        const { userId, reason } = req.body;
        if (!userId) return res.status(400).json({ message: "User ID required for forensic termination" });
 
        // 1. Block the specific User account (Primary forensic action)
        await User.findByIdAndUpdate(userId, { isBlocked: true });
        
        // 2. Update all transactions from this user to reflect the block status
        await Transaction.updateMany(
            { userId },
            { 
                isBlocked: true,
                status: 'Blocked',
                fraudReason: reason || "Account Terminated by Analyst" 
            }
        );
 
        if (global.io) {
            global.io.emit('node_terminated', { userId });
        }
 
        res.status(200).json({ message: `Protocol Executed: Forensic termination of User Account finalized. Shared hardware terminal remains operational.` });
    } catch (error) {
        res.status(500).json({ message: "Termination failed", error: error.message });
    }
};

export const revertTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const tx = await Transaction.findById(id);
        if (!tx) return res.status(404).json({ message: "Transaction not found" });

        if (tx.isReverted) {
            return res.status(400).json({ message: "This transaction has already been processed by the Asset Recovery Protocol." });
        }

        // Logic for reversal:
        if (tx.type === "Transfer") {
            // Find the paired transaction (the other half of the transfer)
            const pairedTx = await Transaction.findOne({
                userId: tx.beneficiaryId,
                beneficiaryId: tx.userId,
                amount: -tx.amount,
                type: "Transfer",
                createdAt: {
                    $gte: new Date(tx.createdAt.getTime() - 5000),
                    $lte: new Date(tx.createdAt.getTime() + 5000)
                }
            });

            if (pairedTx && pairedTx.isReverted) {
                // Mark current as reverted too if not already, to keep UI in sync
                tx.isReverted = true;
                tx.status = "Reverted";
                await tx.save();
                return res.status(400).json({ message: "The paired record for this transfer is already reverted. System integrity maintained." });
            }

            const amount = Math.abs(tx.amount);
            const partyA = await Wallet.findOne({ userId: tx.userId });
            const partyB = await Wallet.findOne({ userId: tx.beneficiaryId });

            if (!partyA || !partyB) {
                return res.status(404).json({ message: "One or more neural nodes (wallets) associated with this trace are inaccessible." });
            }

            // Restore balances based on the current record's role
            if (tx.amount < 0) {
                // current tx is sender: A is sender(+), B is receiver(-)
                partyA.balance += amount;
                partyB.balance -= amount;
            } else {
                // current tx is receiver: A is receiver(-), B is sender(+)
                partyA.balance -= amount;
                partyB.balance += amount;
            }

            await partyA.save();
            await partyB.save();

            // Mark both as reverted
            tx.isReverted = true;
            tx.status = "Reverted";
            tx.fraudReason = "Administrative Reversal / Asset Recovery Protocol Executed";
            await tx.save();

            if (pairedTx) {
                pairedTx.isReverted = true;
                pairedTx.status = "Reverted";
                pairedTx.fraudReason = "Administrative Reversal / Paired Recovery Signal";
                await pairedTx.save();
            }

        } else if (tx.type === "Deposit") {
            const wallet = await Wallet.findOne({ userId: tx.userId });
            if (wallet) {
                wallet.balance -= tx.amount;
                await wallet.save();
            }
            tx.isReverted = true;
            tx.status = "Reverted";
            tx.fraudReason = "Administrative Reversal / Deposit Rollback";
            await tx.save();
        }

        res.status(200).json({ message: "Asset Recovery Protocol executed. Neural ledger updated and balances rolled back." });
    } catch (error) {
        console.error("Reversal Error:", error);
        res.status(500).json({ message: "Reversal failed", error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role, isApproved } = req.body;
        const validRoles = ["Admin", "Analyst", "Viewer"];

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "Admin") {
            return res.status(403).json({ message: "Administrator permissions cannot be modified via this interface." });
        }

        if (role && validRoles.includes(role)) {
            user.role = role;
        }

        if (isApproved !== undefined) {
            user.isApproved = isApproved;
        }

        await user.save();
        res.status(200).json({ message: "User credentials updated", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating role", error: error.message });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        const { search, cursor, limit = 10 } = req.query;
        let query = {};

        if (search) {
            // Check if search is a valid ObjectId (for direct ID search)
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

            // Search for users first to get their IDs
            const matchingUsers = await User.find({
                $or: [
                    { username: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }).select("_id");

            const userIds = matchingUsers.map(u => u._id);

            query.$or = [
                { description: { $regex: search, $options: "i" } },
                { status: { $regex: search, $options: "i" } },
                { type: { $regex: search, $options: "i" } },
                { fraudReason: { $regex: search, $options: "i" } },
                { userId: { $in: userIds } }
            ];

            if (isObjectId) {
                query.$or.push({ _id: search });
            }
        }

        if (cursor) {
            query._id = { $lt: cursor };
        }

        const transactions = await Transaction.find(query)
            .populate("userId", "username email")
            .populate("beneficiaryId", "username email")
            .sort({ _id: -1 })
            .limit(parseInt(limit));

        const nextCursor = transactions.length > 0 ? transactions[transactions.length - 1]._id : null;

        res.status(200).json({
            transactions,
            nextCursor,
            hasMore: transactions.length === parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions", error: error.message });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTransactions = await Transaction.countDocuments();
        const fraudDetected = await Transaction.countDocuments({ status: { $in: ['Fraud', 'Suspicious'] } });

        // Mocking System Health as it's typically derived from server metrics
        const systemHealth = "99.9%";

        res.status(200).json({
            totalUsers,
            totalTransactions,
            fraudDetected,
            systemHealth
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching analytics", error: error.message });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: "User ID required for restoration" });

        await User.findByIdAndUpdate(userId, { isBlocked: false });
        
        // 2. Restore all transactions to their active state
        await Transaction.updateMany(
            { userId, status: 'Blocked' },
            { 
                isBlocked: false,
                status: 'Completed'
            }
        );
            global.io.emit('user_unblocked', { userId });
        res.status(200).json({ message: "Forensic Restoration finalized: User identity cleared for network access." });

        }

     catch (error) {
        res.status(500).json({ message: "Unblocking failed", error: error.message });
    }
}
