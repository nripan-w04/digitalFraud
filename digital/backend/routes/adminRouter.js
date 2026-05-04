import express from "express";
import { getAllUsers, updateUserRole, getAnalytics, getAllTransactions, blockDevice, unblockUser, revertTransaction } from "../controller/adminController.js";
import { verifyToken, isAdmin, isAnalyst } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// User management restricted to Admin
router.get("/users", isAdmin, getAllUsers);
router.put("/users/:id/role", isAdmin, updateUserRole);

// Analytics and Transactions accessible by Admin and Analyst
router.get("/analytics", isAnalyst, getAnalytics);
router.get("/transactions", isAnalyst, getAllTransactions);
router.post("/block-node", isAnalyst, blockDevice);
router.post("/unblock-user", isAnalyst, unblockUser);
router.post("/transactions/:id/revert", isAnalyst, revertTransaction);

export default router;
