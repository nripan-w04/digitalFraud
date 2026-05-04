import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    conditionType: { type: String, enum: ['AmountGreater', 'VelocityExceeded', 'CountryBlock', 'NewDevice'], required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    action: { type: String, enum: ['Block', 'Flag', 'OTP_Challenge'], required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Rule = mongoose.model("Rule", ruleSchema);
export default Rule;
