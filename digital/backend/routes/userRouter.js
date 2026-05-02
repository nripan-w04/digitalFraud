import express from 'express';
import { register, login, seedAdmin, getUserProfile } from '../controller/userController.js';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/seed-admin", seedAdmin);
router.get("/profile", getUserProfile);


export default router;
