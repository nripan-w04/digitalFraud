import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, Activity, AlertTriangle, DollarSign
} from 'lucide-react';

const AdminOverview = () => {
    const [analytics, setAnalytics] = useState({
        totalTransactions: 0,
        totalUsers: 0,
        fraudDetected: 0,
        systemHealth: "100%"
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/digital/admin/analytics');
                setAnalytics(res.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setError(err.response?.data?.message || err.message || "Failed to load dashboard data. Please check your backend connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="space-y-12">
            {error && (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-5 text-rose-400">
                    <AlertTriangle size={28} />
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-widest">Synchronization Error</h4>
                        <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatCard title="System Volume" value={`$${analytics.totalTransactions.toLocaleString()}`} change="+12.5%" icon={<DollarSign size={20} />} trend="up" />
                <StatCard title="Threats Neutralized" value={analytics.fraudDetected} change="-4.2%" icon={<AlertTriangle size={20} />} trend="down" />
                <StatCard title="Network Nodes" value={analytics.totalUsers} change="+1.8%" icon={<Users size={20} />} trend="up" />
                <StatCard title="AI Integrity" value={analytics.systemHealth} change="STABLE" icon={<Activity size={20} />} trend="up" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 glass-panel p-12 rounded-[3rem] border-white/5 h-[500px] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="text-center relative z-10">
                        <Activity className="text-accent/20 w-20 h-20 mx-auto mb-6 animate-pulse" />
                        <p className="text-white/30 font-display font-black uppercase tracking-[0.4em] text-[10px]">Neural Telemetry Pipeline Offline</p>
                    </div>
                </div>
                <div className="glass-panel p-12 rounded-[3rem] border-white/5 h-[500px] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                   <div className="text-center relative z-10">
                        <Users className="text-accent/20 w-20 h-20 mx-auto mb-6" />
                        <p className="text-white/30 font-display font-black uppercase tracking-[0.4em] text-[10px]">Node Activity Log Empty</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon, trend }) => (
    <div className="glass-panel p-10 rounded-[2.5rem] border-white/5 group hover:border-accent/30 transition-all duration-700 hover:bg-white/[0.02]">
        <div className="flex justify-between items-start mb-8">
            <div className="text-accent p-4 bg-accent/10 rounded-2xl group-hover:scale-110 transition-transform duration-700">{icon}</div>
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{change}</span>
        </div>
        <div>
            <h3 className="text-4xl font-display font-black mb-2 text-white tracking-tighter uppercase">{value}</h3>
            <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-black">{title}</p>
        </div>
    </div>
);

export default AdminOverview;
