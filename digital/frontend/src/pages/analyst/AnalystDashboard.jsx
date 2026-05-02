import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, Filter, ShieldAlert, 
    Zap, Database, BarChart3, MoreHorizontal, UserCheck, Activity
} from 'lucide-react';

const AnalystDashboard = () => {
    const [alerts] = useState([
        { id: 'ALR_881', type: 'Critical', score: 98, user: 'Liam Wilson', flag: 'Geo-mismatch', time: '5m ago' },
        { id: 'ALR_880', type: 'Warning', score: 72, user: 'Sarah Jenkins', flag: 'Velocity Spike', time: '12m ago' },
        { id: 'ALR_879', type: 'Info', score: 45, user: 'Mike Ross', flag: 'Device Swap', time: '25m ago' },
        { id: 'ALR_878', type: 'Critical', score: 92, user: 'Jessica Alba', flag: 'Card Testing', time: '1h ago' },
    ]);

    return (
        <div className="py-20 px-[5%] max-w-7xl mx-auto min-h-screen bg-black text-foreground font-sans">
            <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-display font-black mb-6 text-white tracking-tighter uppercase leading-[0.9]">
                        Neural <br /><span className="text-accent">Intelligence</span> Cluster
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">
                        <div className="flex items-center gap-3 px-5 py-2 bg-accent/10 border border-accent/20 text-accent rounded-full">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                            Core v4.2.0: SYNCHRONIZED
                        </div>
                        <div className="flex items-center gap-3">
                            <Activity size={14} className="text-white/20" />
                            NETWORK LOAD: 14.82%
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/5 rounded-full flex-1 sm:w-96 group focus-within:border-accent/30 transition-all">
                        <Search size={18} className="text-white/20 group-focus-within:text-accent transition-colors" />
                        <input 
                            type="text" 
                            placeholder="SCAN_TRACE_IDENTITY..." 
                            className="bg-transparent border-none text-white outline-none w-full text-[10px] font-bold uppercase tracking-widest placeholder:opacity-20" 
                        />
                    </div>
                    <button className="btn-sky !py-5 !px-10 text-[10px] uppercase font-black tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-accent/20">
                        <Zap size={18} /> DEEP_SCAN
                    </button>
                </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
                <MetricCard icon={<ShieldAlert size={28} />} label="ANOMALIES_DETECTED" value="24" sub="HIGH_MAGNITUDE_FLAGS" type="alert" />
                <MetricCard icon={<Activity size={28} />} label="NEURAL_PROCESSING" value="12.4k" sub="128MS_AVG_LATENCY" type="scan" />
                <MetricCard icon={<BarChart3 size={28} />} label="CONFIDENCE_INDEX" value="99.9%" sub="SYSTEM_THRESHOLD" type="chart" />
            </section>

            <section>
                <div className="flex justify-between items-center mb-12">
                    <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">High Risk Intelligence Stream</h3>
                    <button className="text-[9px] font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3 bg-accent/10 px-6 py-3 rounded-full border border-accent/20 hover:bg-accent/20 transition-all">
                        <Filter size={14} /> FILTER_OUTPUT
                    </button>
                </div>

                <div className="space-y-8">
                    {alerts.map(alert => (
                        <motion.div 
                            key={alert.id}
                            className="glass-panel p-8 md:p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden group hover:border-accent/30 transition-all duration-700 hover:bg-white/[0.02]"
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_2fr_1.5fr_1fr] gap-12 items-center">
                                <div className="flex flex-col gap-3">
                                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full w-fit border ${
                                        alert.type === 'Critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        alert.type === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        'bg-accent/10 text-accent border-accent/20'
                                    }`}>
                                        {alert.type}
                                    </div>
                                    <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">{alert.time}</span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-4 font-display font-black text-xl text-white uppercase tracking-tighter">
                                        <div className="p-3 bg-white/5 rounded-2xl text-accent border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                            <UserCheck size={20} />
                                        </div>
                                        <span>{alert.user}</span>
                                    </div>
                                    <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] mt-1">
                                        TRACE_IDENTITY: <span className="text-accent">{alert.flag}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">Risk Probability</span>
                                        <span className={`text-sm font-black ${alert.score > 80 ? 'text-rose-500' : 'text-amber-500'}`}>{alert.score}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full relative overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${alert.score}%` }}
                                            transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
                                            className={`h-full rounded-full ${alert.score > 80 ? 'bg-rose-500' : 'bg-amber-500'} shadow-[0_0_10px_currentColor]`}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 justify-end">
                                    <button className="text-[10px] font-black text-accent hover:text-white uppercase tracking-[0.3em] transition-colors">INVESTIGATE</button>
                                    <button className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-white transition-colors border border-white/5">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const MetricCard = ({ icon, label, value, sub, type }) => (
    <div className="glass-panel p-10 flex gap-10 items-center rounded-[3rem] border-white/5 relative overflow-hidden group hover:border-accent/20 transition-all duration-700 hover:bg-white/[0.02]">
        <div className={`p-6 rounded-2xl border bg-white/[0.02] group-hover:scale-110 transition-transform duration-700 ${
            type === 'alert' ? 'text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' :
            type === 'scan' ? 'text-accent border-accent/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]' :
            'text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
        }`}>
            {icon}
        </div>
        <div>
            <span className="text-[9px] text-white/30 block mb-3 uppercase font-black tracking-[0.3em]">{label}</span>
            <h2 className="text-4xl font-display font-black leading-tight text-white tracking-tighter uppercase">{value}</h2>
            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">{sub}</div>
        </div>
    </div>
);

export default AnalystDashboard;
