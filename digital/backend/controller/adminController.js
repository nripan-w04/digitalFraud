import User from "../model/userModel.js";
import Transaction from "../model/transactionModel.js";

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
        const { role } = req.body;
        const validRoles = ["Admin", "Analyst", "Viewer"];
        
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User role updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating role", error: error.message });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("userId", "username email")
            .sort({ createdAt: -1 });
        res.status(200).json(transactions);
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
