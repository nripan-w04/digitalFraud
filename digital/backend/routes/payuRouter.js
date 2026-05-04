import express from 'express';
import { generateDepositHash, generateTransferHash, handlePayUResponse } from '../controller/payuController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/deposit/hash', verifyToken, generateDepositHash);
router.post('/transfer/hash', verifyToken, generateTransferHash);
router.post('/response', handlePayUResponse); // PayU hits this directly, no token in headers usually

export default router;
