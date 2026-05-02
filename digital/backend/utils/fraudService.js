import axios from "axios";

/**
 * Checks a transaction for fraud risk using the Python AI Microservice.
 * Falls back to a simulated score if the service is unreachable.
 */
export const checkFraudRisk = async (senderId, receiverId, amount) => {
    let riskScore = 0;
    
    try {
        // Attempt to call the Python AI Microservice
        // NOTE: URL can be moved to environment variables later
        const aiResponse = await axios.post("http://localhost:8000/predict", {
            senderId,
            receiverId,
            amount,
            timestamp: new Date().toISOString()
        }, { timeout: 2000 }); // Short timeout for the microservice
        
        riskScore = aiResponse.data.riskScore;
    } catch (error) {
        console.warn("[AI Fraud Service]: Python Microservice unreachable. Falling back to simulated score.");
        // Simulated fallback: 20% chance of being high risk (>75)
        riskScore = Math.random() > 0.8 
            ? Math.floor(Math.random() * (100 - 75 + 1) + 75) 
            : Math.floor(Math.random() * 40);
    }

    return {
        riskScore,
        isFraud: riskScore > 75
    };
};
