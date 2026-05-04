import express from 'express';
import { register, login, seedAdmin, getUserProfile, updateUserProfile } from '../controller/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/seed-admin", seedAdmin);

// Protected routes
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

export default router;
