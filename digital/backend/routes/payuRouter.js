import express from 'express';
import { generatePayUHash, handlePayUResponse } from '../controller/payuController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/hash', verifyToken, generatePayUHash);
router.post('/response', handlePayUResponse); // PayU hits this directly, no token in headers usually

export default router;
