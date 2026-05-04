import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    reason: { type: String, default: "Suspicious activity detected by analyst" },
    blockedAt: { type: Date, default: Date.now }
});

const Blacklist = mongoose.model("Blacklist", blacklistSchema);
export default Blacklist;
