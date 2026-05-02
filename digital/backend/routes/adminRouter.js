import express from "express";
import { getAllUsers, updateUserRole, getAnalytics, getAllTransactions } from "../controller/adminController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply middleware to all admin routes
router.use(verifyToken);
router.use(isAdmin);

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/analytics", getAnalytics);
router.get("/transactions", getAllTransactions);

export default router;
