import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Open', 'Under Investigation', 'Resolved', 'Rejected'], default: 'Open' },
    evidencePaths: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Dispute = mongoose.model("Dispute", disputeSchema);
export default Dispute;
