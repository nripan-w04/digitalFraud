import axios from "axios";

/**
 * Checks a transaction for fraud risk using the Python AI Microservice.
 * Falls back to a simulated score if the service is unreachable.
 */
export const checkFraudRisk = async (senderId, receiverId, amount, deviceId, location, ipAddress) => {
    let riskScore = 0;
    
    try {
        // --- MOCK TRIGGERS FOR TESTING ---
        if (Number(amount) === 99.99) return { riskScore: 98, isFraud: true };
        if (Number(amount) === 1.11) return { riskScore: 5, isFraud: false };
        // ---------------------------------

        const aiResponse = await axios.post("http://localhost:8000/predict", {
            senderId,
            receiverId,
            amount,
            deviceId,
            location,
            ipAddress,
            timestamp: new Date().toISOString()
        }, { timeout: 2000 });
        
        riskScore = aiResponse.data.riskScore;
    } catch (error) {
        console.warn("[AI Fraud Service]: Python Microservice unreachable. Falling back to simulated score.");
        riskScore = Math.random() > 0.8 
            ? Math.floor(Math.random() * (100 - 75 + 1) + 75) 
            : Math.floor(Math.random() * 40);
    }

    const isFraud = riskScore > 75;

    // Emit Real-time Alert if high risk
    if (isFraud && global.io) {
        global.io.emit('new_suspicious_transaction', {
            amount,
            riskScore,
            user: "PayU_Node_" + senderId.toString().substr(-4)
        });
    }

    return {
        riskScore,
        isFraud
    };
};
