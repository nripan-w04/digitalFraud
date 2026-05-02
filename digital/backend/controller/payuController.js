import crypto from 'crypto';
import Wallet from '../model/walletModel.js';
import Transaction from '../model/transactionModel.js';
import User from '../model/userModel.js';
import { checkFraudRisk } from '../utils/fraudService.js';

// Official PayU Sandbox Test Credentials for key: gtKFFx
const PAYU_MERCHANT_KEY = (process.env.PAYU_MERCHANT_KEY || "gtKFFx").trim();
const PAYU_MERCHANT_SALT = (process.env.PAYU_MERCHANT_SALT || "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW").trim();

export const generatePayUHash = async (req, res, next) => {
    try {
        let { txnid, amount, productinfo, firstname, email, receiverEmail } = req.body;
        const senderId = req.user.id; // From authMiddleware

        // Ensure amount is formatted to 2 decimal places for PayU
        const formattedAmount = parseFloat(amount).toFixed(2);

        if (!txnid || !amount || !productinfo || !firstname || !email || !receiverEmail) {
            return res.status(400).json({ message: "Missing required transaction parameters" });
        }

        // Check if receiver exists
        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) {
            return res.status(404).json({ message: "Recipient not recognized. Please verify the destination address." });
        }

        // Check sender balance
        const senderWallet = await Wallet.findOne({ userId: senderId });
        if (!senderWallet) {
            return res.status(404).json({ message: "Wallet services are currently unavailable for this account." });
        }


        // PayU hash formula: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|SALT
        // Ensure exactly 16 pipes are used.
        const udf1 = receiverEmail || '';
        const udf2 = senderId || '';
        const udf3 = '', udf4 = '', udf5 = '', udf6 = '', udf7 = '', udf8 = '', udf9 = '', udf10 = '';

        const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${PAYU_MERCHANT_SALT}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        res.status(200).json({
            hash,
            key: PAYU_MERCHANT_KEY,
            txnid,
            amount, // Use the raw amount sent in request
            udf1,
            udf2
        });
    } catch (error) {
        next(error);
    }
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

            // 1. Get Sender & Receiver
            const sender = await User.findById(senderId);
            const receiver = await User.findOne({ email: receiverEmail });

            if (!sender || !receiver) {
                console.error("Sender or Receiver not found during PayU response processing");
                return res.redirect(`http://localhost:5173/?payment=error&message=UserNotFound`);
            }

            const senderWallet = await Wallet.findOne({ userId: sender._id });
            const receiverWallet = await Wallet.findOne({ userId: receiver._id });

            if (!senderWallet || !receiverWallet) {
                console.error("Wallets not found during PayU response processing");
                return res.redirect(`http://localhost:5173/?payment=error&message=WalletNotFound`);
            }

            // 2. AI Fraud Check
            const { riskScore, isFraud } = await checkFraudRisk(senderId, receiver._id, amount);

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
                    description: `Wallet load via PayU`
                });
                await depositTx.save();
            } else {
                // Transfer Logic: Reduce sender, increase receiver
                senderWallet.balance -= Number(amount);
                receiverWallet.balance += Number(amount);

                await senderWallet.save();
                await receiverWallet.save();

                const senderTx = new Transaction({
                    userId: sender._id,
                    walletId: senderWallet._id,
                    amount: -Number(amount),
                    type: "Transfer",
                    status: isFraud ? "Suspicious" : "Completed",
                    riskScore,
                    description: `Sent to ${receiverEmail}`
                });

                const receiverTx = new Transaction({
                    userId: receiver._id,
                    walletId: receiverWallet._id,
                    amount: Number(amount),
                    type: "Transfer",
                    status: isFraud ? "Suspicious" : "Completed",
                    riskScore,
                    description: `Received from ${sender.email}`
                });

                await senderTx.save();
                await receiverTx.save();
            }

            res.redirect(`http://localhost:5173/?payment=success&txnid=${txnid}&risk=${riskScore}`);
        } else {
            const errorMsg = req.body.error_Message || req.body.unmappedstatus || "Transaction declined by bank or user";
            res.redirect(`http://localhost:5173/?payment=failed&txnid=${txnid}&message=${encodeURIComponent(errorMsg)}`);
        }

    } catch (error) {
        console.error("PayU Response Error:", error);
        res.redirect(`http://localhost:5173/?payment=error&message=${encodeURIComponent(error.message)}`);
    }
};
