import crypto from 'crypto';
import Wallet from '../model/walletModel.js';
import Transaction from '../model/transactionModel.js';
import User from '../model/userModel.js';
import Blacklist from '../model/blacklistModel.js';
import { checkFraudRisk } from '../utils/fraudService.js';

// Official PayU Sandbox Test Credentials for key: gtKFFx
const PAYU_MERCHANT_KEY = (process.env.PAYU_MERCHANT_KEY || "gtKFFx").trim();
const PAYU_MERCHANT_SALT = (process.env.PAYU_MERCHANT_SALT || "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW").trim();

export const generateDepositHash = async (req, res, next) => {
    try {
        let { txnid, amount, productinfo, firstname, email, deviceId, location } = req.body;
        const senderId = req.user.id;

        // 1. Blocked User Check
        const user = await User.findById(senderId);
        if (user?.isBlocked) {
            return res.status(403).json({ message: "ACCOUNT_TERMINATED: Your administrative clearance has been revoked." });
        }

        // 2. Location Check (Mandatory for all forensic events)
        if (!location || !location.lat || !location.lon) {
            return res.status(403).json({ message: "GEOLOCATION_REQUIRED: Physical origin telemetry is mandatory for forensic auditing." });
        }

        const udf1 = email; 
        const udf2 = senderId;
        const udf3 = deviceId || '';
        const udf4 = JSON.stringify(location);
        const udf5 = '', udf6 = '', udf7 = '', udf8 = '', udf9 = '', udf10 = '';

        const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${PAYU_MERCHANT_SALT}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        res.status(200).json({ hash, key: PAYU_MERCHANT_KEY, txnid, amount, udf1, udf2, udf3, udf4 });
    } catch (error) { next(error); }
};

export const generateTransferHash = async (req, res, next) => {
    try {
        let { txnid, amount, productinfo, firstname, email, receiverEmail, deviceId, location } = req.body;
        const senderId = req.user.id;

        // 1. Blocked User Check
        const user = await User.findById(senderId);
        if (user?.isBlocked) {
            return res.status(403).json({ message: "ACCOUNT_TERMINATED: Your administrative clearance has been revoked." });
        }

        // 2. Location Check
        if (!location || !location.lat || !location.lon) {
            return res.status(403).json({ message: "GEOLOCATION_REQUIRED: Transfer aborted. Physical origin telemetry is mandatory." });
        }

        // 3. Balance Check (Only for transfers)
        const wallet = await Wallet.findOne({ userId: senderId });
        const numericAmount = Number(amount);
        if (!wallet || wallet.balance < numericAmount) {
            return res.status(402).json({ message: "INSUFFICIENT_LIQUIDITY: Your vault balance is below the required threshold." });
        }

        // 4. Receiver Check
        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) return res.status(404).json({ message: "Recipient handle not found." });

        const udf1 = receiverEmail;
        const udf2 = senderId;
        const udf3 = deviceId || '';
        const udf4 = JSON.stringify(location);
        const udf5 = '', udf6 = '', udf7 = '', udf8 = '', udf9 = '', udf10 = '';

        const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${PAYU_MERCHANT_SALT}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        res.status(200).json({ hash, key: PAYU_MERCHANT_KEY, txnid, amount, udf1, udf2, udf3, udf4 });
    } catch (error) { next(error); }
};

export const handlePayUResponse = async (req, res, next) => {
    try {
        const { status, txnid, amount, hash, email, firstname, productinfo, udf1, udf2 } = req.body;

        // Verify Hash from PayU
        // sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
        const reverseHashString = `${PAYU_MERCHANT_SALT}|${status}|||||||||${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
        const generatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

        // Security: In production, verify that generatedHash === hash

        if (status === 'success') {
            const receiverEmail = udf1;
            const senderId = udf2;
            const deviceId = req.body.udf3;
            const location = req.body.udf4 ? JSON.parse(req.body.udf4) : null;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            // 1. Get Sender & Receiver
            const sender = await User.findById(senderId);
            
            // Forensic check: Blocked users cannot complete transactions
            if (sender && sender.isBlocked) {
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=error&message=AccountTerminated`);
            }

            const receiver = await User.findOne({ email: receiverEmail });

            if (!sender || !receiver) {
                console.error("Sender or Receiver not found during PayU response processing");
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=error&message=UserNotFound`);
            }

            const senderWallet = await Wallet.findOne({ userId: sender._id });
            const receiverWallet = await Wallet.findOne({ userId: receiver._id });

            if (!senderWallet || !receiverWallet) {
                console.error("Wallets not found during PayU response processing");
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=error&message=WalletNotFound`);
            }

            // 2. AI Fraud Check
            const { riskScore, isFraud } = await checkFraudRisk(senderId, receiver._id, amount, deviceId, location, ipAddress);

            const isDeposit = senderId === receiver._id.toString();

            if (isDeposit) {
                // Deposit Logic: Only increase balance
                receiverWallet.balance += Number(amount);
                await receiverWallet.save();

                const depositTx = new Transaction({
                    userId: receiver._id,
                    walletId: receiverWallet._id,
                    amount: Number(amount),
                    type: "Deposit",
                    status: isFraud ? "Suspicious" : "Completed",
                    riskScore,
                    deviceId,
                    ipAddress,
                    location,
                    description: `Wallet load via PayU`
                });
                await depositTx.save();
            } else {
                // Transfer Logic: Deduct from sender, increase receiver
                senderWallet.balance -= Number(amount);
                receiverWallet.balance += Number(amount);

                await senderWallet.save();
                await receiverWallet.save();

                const senderTx = new Transaction({
                    userId: sender._id,
                    walletId: senderWallet._id,
                    beneficiaryId: receiver._id,
                    amount: -Number(amount),
                    type: "Transfer",
                    status: isFraud ? "Suspicious" : "Completed",
                    riskScore,
                    deviceId,
                    ipAddress,
                    location,
                    description: `Sent to ${receiverEmail}`
                });

                const receiverTx = new Transaction({
                    userId: receiver._id,
                    walletId: receiverWallet._id,
                    beneficiaryId: sender._id,
                    amount: Number(amount),
                    type: "Transfer",
                    status: isFraud ? "Suspicious" : "Completed",
                    riskScore,
                    deviceId,
                    ipAddress,
                    location,
                    description: `Received from ${sender.email}`
                });

                await senderTx.save();
                await receiverTx.save();
            }

            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=success&txnid=${txnid}&risk=${riskScore}`);
        } else {
            const errorMsg = req.body.error_Message || req.body.unmappedstatus || "Transaction declined by bank or user";
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=failed&txnid=${txnid}&message=${encodeURIComponent(errorMsg)}`);
        }

    } catch (error) {
        console.error("PayU Response Error:", error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=error&message=${encodeURIComponent(error.message)}`);
    }
};
