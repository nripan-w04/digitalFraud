import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['Deposit', 'Withdrawal', 'Transfer', 'Payment'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Suspicious', 'Blocked', 'Reverted'], default: 'Pending' },
    isReverted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    riskScore: { type: Number, default: 0 },
    fraudReason: { type: String },
    deviceId: { type: String },
    ipAddress: { type: String },
    location: {
        lat: { type: Number },
        lon: { type: Number },
        city: { type: String }
    },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
