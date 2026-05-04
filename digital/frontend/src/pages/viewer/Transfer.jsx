import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Send, User, DollarSign, Shield, 
    ArrowRight, Loader2, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

const Transfer = () => {
    const [formData, setFormData] = useState({
        receiverEmail: '',
        amount: '',
        type: 'Transfer'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // --- MANDATORY GEOLOCATION CHECK ---
        const getLocation = () => {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("GEOLOCATION_UNSUPPORTED: This secure terminal requires hardware location tracking."));
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                        city: "Real-time Verified"
                    }),
                    (err) => {
                        let msg = "GEOLOCATION_DENIED: Critical security telemetry blocked. Transactions aborted.";
                        if (err.code === 2) msg = "POSITION_UNAVAILABLE: Terminal cannot verify geographic origin.";
                        if (err.code === 3) msg = "TIMEOUT: Security handshake failed. Retry required.";
                        reject(new Error(msg));
                    },
                    { timeout: 10000 }
                );
            });
        };

        try {
            const location = await getLocation();
            const response = await API.post('/digital/transactions/initiate', {
                ...formData,
                amount: parseFloat(formData.amount),
                deviceId: "dev_neural_" + Math.random().toString(36).substr(2, 9),
                location: location
            });
            setResult({ success: true, message: response.data.message, data: response.data.transaction });
        } catch (error) {
            console.error("Transfer failed:", error);
            const errorMsg = error.message || error.response?.data?.message || "Protocol Error";
            
            toast.error(errorMsg, {
                style: {
                    background: '#1a1a1a',
                    color: '#f43f5e',
                    border: '1px solid #f43f5e',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }
            });

            // Only show the failed result screen for server-side failures
            // Geolocation failures should keep the user on the form to retry
            if (error.response) {
                setResult({ success: false, message: errorMsg });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black py-32 px-[5%] max-w-4xl mx-auto">
            <header className="mb-16">
                <h1 className="text-5xl lg:text-7xl font-display font-medium text-white tracking-tighter uppercase leading-[0.85] mb-6">
                    Asset <br /><span className="text-accent">Transfer</span>
                </h1>
                <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/30">
                    Secure neural channel initiation
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-3">
                    <div className="glass-panel p-10 md:p-12 rounded-[3.5rem] border-white/5">
                        {!result ? (
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/30 flex items-center gap-3">
                                        <User size={14} className="text-accent" /> Recipient_Node
                                    </label>
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="address@identity.com"
                                        value={formData.receiverEmail}
                                        onChange={(e) => setFormData({...formData, receiverEmail: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-white outline-none focus:border-accent/30 transition-all font-medium uppercase tracking-widest text-sm placeholder:opacity-20"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/30 flex items-center gap-3">
                                        <DollarSign size={14} className="text-accent" /> Magnitude
                                    </label>
                                    <input 
                                        type="number" 
                                        required
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-white outline-none focus:border-accent/30 transition-all font-medium uppercase tracking-widest text-sm placeholder:opacity-20"
                                    />
                                </div>

                                <button 
                                    disabled={loading}
                                    className="w-full btn-sky !py-6 text-xs font-medium uppercase tracking-[0.4em] flex items-center justify-center gap-4 mt-8"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> INITIATE_TRANSFER</>}
                                </button>
                            </form>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                {result.success ? (
                                    <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-8" />
                                ) : (
                                    <AlertCircle size={64} className="text-rose-500 mx-auto mb-8" />
                                )}
                                <h2 className={`text-3xl font-display font-medium uppercase tracking-tighter mb-4 ${result.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {result.success ? 'TRANSMISSION_COMPLETE' : 'TRANSMISSION_FAILED'}
                                </h2>
                                <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/40 mb-12">
                                    {result.message}
                                </p>
                                <button 
                                    onClick={() => setResult(null)}
                                    className="px-12 py-5 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium uppercase tracking-[0.4em] text-white/60 hover:text-white hover:border-accent transition-all"
                                >
                                    RETURN_TO_TERMINAL
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-accent/5">
                        <div className="flex items-center gap-4 mb-6">
                            <Shield size={24} className="text-accent" />
                            <h3 className="text-sm font-medium uppercase tracking-widest text-white">Security Protocol</h3>
                        </div>
                        <p className="text-[10px] text-white/30 leading-relaxed uppercase font-medium tracking-widest">
                            Your transaction is being protected by Distributed Neural Scoring. High-risk transfers may be held for manual review.
                        </p>
                    </div>

                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <Info size={24} className="text-white/20" />
                            <h3 className="text-sm font-medium uppercase tracking-widest text-white">Network Info</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-[9px] text-white/20 uppercase font-medium">Latency</span>
                                <span className="text-[9px] text-accent uppercase font-medium">8ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[9px] text-white/20 uppercase font-medium">Protocol</span>
                                <span className="text-[9px] text-accent uppercase font-medium">TLS 1.3+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transfer;
