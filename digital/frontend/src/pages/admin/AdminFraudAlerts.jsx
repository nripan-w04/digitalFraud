import React from 'react';
import { ShieldCheck } from 'lucide-react';

const AdminFraudAlerts = () => {
    return (
        <div className="glass-panel p-16 lg:p-32 flex flex-col items-center justify-center min-h-[600px] text-center rounded-[4rem] border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10">
                <div className="w-28 h-28 bg-emerald-500/10 flex items-center justify-center mb-12 mx-auto rounded-[2rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-700">
                    <ShieldCheck size={56} className="text-emerald-500" />
                </div>
                <h2 className="text-5xl lg:text-6xl font-display font-black mb-8 text-white tracking-tighter uppercase leading-none">
                    System Integrity <br /><span className="text-emerald-500">Optimal</span>
                </h2>
                <p className="text-white/30 max-w-lg mx-auto text-[10px] font-black uppercase tracking-[0.4em] leading-loose">
                    Our neural security networks report zero high-magnitude anomalies. 
                    FraudGuard is actively monitoring all global transaction sub-sectors in real-time.
                </p>
                <div className="mt-12 inline-flex items-center gap-4 text-[9px] text-accent font-black uppercase tracking-[0.4em] bg-accent/10 px-8 py-3.5 rounded-full border border-accent/20">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    LIVE_PROTOCOL_SYNCHRONIZATION_ACTIVE
                </div>
            </div>
        </div>
    );
};

export default AdminFraudAlerts;
