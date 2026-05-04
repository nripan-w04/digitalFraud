import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Forensic Sync: Verify account status in real-time
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "Identity not found in the global ledger." });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "ACCOUNT_TERMINATED: Your administrative clearance has been revoked." });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "Admin") {
        next();
    } else {
        res.status(403).json({ message: "Access Denied. Admin resources only." });
    }
};

export const isAnalyst = (req, res, next) => {
    if (req.user && (req.user.role === "Analyst" || req.user.role === "Admin")) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied. Analyst resources only." });
    }
};
