import User from "../model/userModel.js";
import Wallet from "../model/walletModel.js";
import Transaction from "../model/transactionModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { username, email, password, role, phone } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            role: role || "Viewer",
            isApproved: role === "Analyst" ? false : true
        });

        await newUser.save();

        // Create wallet for the new user
        const newWallet = new Wallet({
            userId: newUser._id
        });
        await newWallet.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isApproved) {
            return res.status(403).json({ message: "Your account is pending administrative approval. Analysts must be verified by a system administrator." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        const wallet = await Wallet.findOne({ userId: user._id });

        res.status(200).json({
            user,
            wallet: wallet ? { balance: wallet.balance, currency: wallet.currency, status: wallet.status } : null
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
};



export const seedAdmin = async (req, res) => {
    try {
        const adminEmail = "admin@fraudguard.com";
        const adminPassword = "AdminPassword123";
        
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            return res.status(200).json({ message: "Admin already seeded" });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = new User({
            username: "System Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "Admin"
        });

        await admin.save();

        const newWallet = new Wallet({
            userId: admin._id
        });
        await newWallet.save();

        res.status(201).json({ 
            message: "Admin seeded successfully", 
            email: adminEmail, 
            password: adminPassword 
        });
    } catch (error) {
        res.status(500).json({ message: "Error seeding admin", error: error.message });
    }
};
export const updateUserProfile = async (req, res) => {
    try {
        const { username, phone, password } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username) user.username = username;
        if (phone) user.phone = phone;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};
