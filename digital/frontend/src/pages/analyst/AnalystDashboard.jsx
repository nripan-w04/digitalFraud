import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Database, Activity, RefreshCw, Loader2,
    Terminal, Cpu, Globe, Crosshair, ChevronRight, Eye, DollarSign
} from 'lucide-react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const AnalystDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLive, setIsLive] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalTransactions: 0,
        fraudDetected: 0,
        systemHealth: "99.9%"
    });
    const [activeTab, setActiveTab] = useState("Stream_Console");
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const fetchTransactions = useCallback(async (currentCursor = null, isRefresh = false) => {
        try {
            if (!currentCursor) setLoading(true);
            const response = await API.get(`/digital/admin/transactions`, {
                params: {
                    search: searchTerm,
                    cursor: currentCursor,
                    limit: 10
                }
            });

            if (isRefresh || !currentCursor) {
                setTransactions(response.data.transactions);
            } else {
                setTransactions(prev => {
                    const newIds = new Set(response.data.transactions.map(t => t._id));
                    const filteredPrev = prev.filter(t => !newIds.has(t._id));
                    return [...filteredPrev, ...response.data.transactions];
                });
            }

            setCursor(response.data.nextCursor);
            setHasMore(response.data.hasMore);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const fetchAnalytics = async () => {
        try {
            const response = await API.get('/digital/admin/analytics');
            setAnalytics(response.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTransactions(null, true);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchTransactions]);

    useEffect(() => {
        let interval;
        if (isLive && !searchTerm) {
            interval = setInterval(() => {
                fetchTransactions(null, true);
                fetchAnalytics();
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [isLive, searchTerm, fetchTransactions]);

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('new_suspicious_transaction', (data) => {
            toast.error(`HIGH RISK DETECTED: $${data.amount} from ${data.user}`, {
                duration: 6000,
                position: 'top-right',
                style: {
                    background: '#000',
                    color: '#f43f5e',
                    border: '1px solid #f43f5e',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }
            });
            fetchTransactions(null, true);
            fetchAnalytics();
        });

        socket.on('node_terminated', (data) => {
            setTransactions(prev => prev.map(tx => {
                const currentUserId = tx.userId?._id || tx.userId;
                return currentUserId === data.userId ? { ...tx, status: 'Blocked', isBlocked: true } : tx;
            }));
            toast.success(`SYSTEM_ALERT: User account terminated. Shared terminal remains active.`, {
                icon: '🚫',
                style: { background: '#1a1a1a', color: '#fff', border: '1px solid #f43f5e' }
            });
        });

        return () => socket.disconnect();
    }, [fetchTransactions]);

    const loadMore = () => {
        if (cursor && !loading) {
            fetchTransactions(cursor);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const handleActionSuccess = (txId, field) => {
        const updateObj = (prev) => {
            if (field === 'Blocked') return { ...prev, isBlocked: true, status: 'Blocked' };
            if (field === 'Unblocked') return { ...prev, isBlocked: false, status: 'Completed' };
            if (field === 'Reverted') return { ...prev, isReverted: true, status: 'Reverted' };
            return prev;
        };

        setTransactions(prev => prev.map(tx => tx._id === txId ? updateObj(tx) : tx));
        if (selectedTransaction && selectedTransaction._id === txId) {
            setSelectedTransaction(prev => updateObj(prev));
        }
    };

    return (
        <div className="flex min-h-screen   bg-black text-foreground font-sans overflow-hidden">
            {/* Left Operational Sidebar */}
            <aside className="w-80 border-r border-white/10 bg-white/[0.08] hidden xl:flex flex-col p-8 pt-13 gap-12">
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-white/70 px-4">System_Status</h4>
                    <nav className="space-y-2">
                        <SidebarItem
                            icon={<Terminal size={18} />}
                            label="Stream_Console"
                            active={activeTab === "Stream_Console"}
                            onClick={() => setActiveTab("Stream_Console")}
                        />
                        <SidebarItem
                            icon={<Globe size={18} />}
                            label="Geo_Tracing"
                            active={activeTab === "Geo_Tracing"}
                            onClick={() => setActiveTab("Geo_Tracing")}
                        />
                        <SidebarItem
                            icon={<Cpu size={18} />}
                            label="Neural_Nodes"
                            active={activeTab === "Neural_Nodes"}
                            onClick={() => setActiveTab("Neural_Nodes")}
                        />
                        <SidebarItem
                            icon={<Crosshair size={18} />}
                            label="Threat_Hunter"
                            active={activeTab === "Threat_Hunter"}
                            onClick={() => setActiveTab("Threat_Hunter")}
                        />
                    </nav>
                </div>

                <div className="mt-auto space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border-white/5 bg-accent/5">
                        <div className="flex  items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">AI Integrity</span>
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '94%' }}
                                className="h-full bg-accent shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                            />
                        </div>
                        <p className="text-[10px] text-white/70 mt-3 font-bold uppercase tracking-widest leading-relaxed">
                            Synaptic mapping at peak efficiency. No degradation detected.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1  overflow-y-auto custom-scrollbar pt-22 px-[5%] pb-20">
                <header className="mb-20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20">
                                <Activity size={24} className="text-accent" />
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-display font-medium tracking-tighter text-white uppercase leading-none">
                                Neural <span className="text-accent">Analytic</span> Cluster
                            </h1>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
                            <div className={`flex items-center gap-3 px-5 py-2 border rounded-full transition-all duration-500 ${isLive ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/10 border-white/10 text-white/60'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-accent animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]' : 'bg-white/40'}`} />
                                {isLive ? 'LIVE_STREAM: ACTIVE' : 'STREAM: PAUSED'}
                            </div>
                            <div className="flex items-center gap-3">
                                <Cpu size={14} className="text-white/60" />
                                NODES: <span className="text-white">12.4k</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                        <div className="flex items-center gap-4 px-8 py-5 bg-white/10 border border-white/20 rounded-full flex-1 sm:w-96 group focus-within:border-accent/50 transition-all shadow-2xl">
                            <Search size={20} className="text-white/60 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH_TRACE_IDENTITY..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none text-white outline-none w-full text-sm font-bold uppercase tracking-widest placeholder:opacity-60"
                            />
                        </div>
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`!py-5 !px-10 text-xs uppercase font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all duration-500 rounded-full border ${isLive ? 'bg-accent/10 border-accent/30 text-accent shadow-accent/20' : 'bg-white/10 border-white/20 text-white/80'
                                }`}
                        >
                            {isLive ? <Crosshair size={15} className="animate-spin-slow" /> : <RefreshCw size={18} />}
                            {isLive ? 'SCANNING' : 'IDLE'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
                    <OperationalMetric label="ANOMALIES" value={analytics.fraudDetected} />
                    <OperationalMetric label="TRAFFIC" value={analytics.totalTransactions} />
                    <OperationalMetric label="STABILITY" value={analytics.systemHealth} />
                    <OperationalMetric label="LATENCY" value="8ms" />
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-8 px-4">
                        <h3 className="text-2xl font-display font-medium text-white tracking-tighter uppercase flex items-center gap-4">
                            Operational Intelligence Stream
                            <span className="text-xs font-bold px-3 py-1 bg-white/10 rounded-lg border border-white/20 text-white/60 uppercase tracking-widest">
                                Buffer_Size: 10
                            </span>
                        </h3>
                        <div className="flex items-center gap-4">
                            {loading && <Loader2 className="animate-spin text-accent" size={20} />}
                            <button className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white flex items-center gap-3 transition-all">
                                <Filter size={14} /> FILTERS
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {transactions
                                .filter(tx => {
                                    if (activeTab === "Threat_Hunter") return tx.status === 'Suspicious' || tx.riskScore > 75;
                                    if (activeTab === "Geo_Tracing") return tx.location && (tx.location.city || tx.location.lat);
                                    return true;
                                })
                                .filter((tx, i, self) => {
                                    if (activeTab === "Neural_Nodes") {
                                        return i === self.findIndex(t => t.deviceId === tx.deviceId);
                                    }
                                    return true;
                                })
                                .map((tx, index) => (
                                    <motion.div
                                        key={tx._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.4, delay: index * 0.03 }}
                                        className={`group relative border rounded-2xl p-6 transition-all duration-500 overflow-hidden ${tx.status === 'Blocked' || tx.status === 'Reverted'
                                            ? 'bg-rose-500/5 border-rose-500/20 grayscale'
                                            : 'bg-white/[0.06] border-white/10 hover:border-accent/20'
                                            }`}
                                    >
                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                                            <div className="flex items-center gap-8">
                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    <div className={`text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg border w-fit ${tx.status === 'Blocked' || tx.status === 'Reverted'
                                                        ? 'bg-white/20 text-white/60 border-white/20'
                                                        : 'bg-accent/10 text-accent border-accent/20'
                                                        }`}>
                                                        {tx.status}
                                                    </div>
                                                    <span className="text-xs text-white/60 font-bold tracking-widest">{formatDate(tx.createdAt)}</span>
                                                    <div className={`mt-1 text-xs font-bold tracking-[0.2em] uppercase ${tx.status === 'Blocked' || tx.status === 'Reverted' ? 'text-white/60' : 'text-accent'}`}>
                                                        Confidence: {tx.riskScore}%
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <h5 className="text-white font-display font-medium text-xl tracking-tight flex items-center gap-4 uppercase">
                                                        {activeTab === "Neural_Nodes" ? `NODE_${tx.deviceId?.substr(-8)}` : (tx.userId?.username || 'ANONYMOUS')}
                                                        <ChevronRight size={16} className="text-white/40" />
                                                    </h5>
                                                    <span className="text-xs text-accent/80 font-bold uppercase tracking-[0.2em]">
                                                        {activeTab === "Geo_Tracing" ? `${tx.location?.city || 'Unknown Loc'} [${tx.location?.lat?.toFixed(2)}, ${tx.location?.lon?.toFixed(2)}]` :
                                                            activeTab === "Neural_Nodes" ? `IDENTITY: ${tx.userId?.email || 'UNLINKED'}` : tx.type}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex items-center gap-12 px-8">
                                                <div className="hidden sm:flex flex-col gap-3 flex-1 max-w-[200px]">
                                                    <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                                                        <span>{activeTab === "Neural_Nodes" ? 'Node_Vulnerability' : 'Risk_Magnitude'}</span>
                                                        <span className={tx.status === 'Blocked' || tx.status === 'Reverted' ? 'text-white/60' : 'text-accent'}>{tx.riskScore}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${tx.riskScore}%` }}
                                                            className={`h-full rounded-full ${tx.status === 'Blocked' || tx.status === 'Reverted' ? 'bg-white/20' : 'bg-accent shadow-[0_0_12px_rgba(14,165,233,0.3)]'}`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
                                                        {activeTab === "Neural_Nodes" ? 'Total_Thruput' : 'Magnitude'}
                                                    </span>
                                                    <span className={`text-2xl font-display font-medium tracking-tighter text-white`}>
                                                        ${Math.abs(tx.amount).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                                <button
                                                    onClick={() => setSelectedTransaction(tx)}
                                                    className="flex-1 lg:flex-none py-3 px-6 bg-white/10 hover:bg-accent/20 text-white/60 hover:text-accent rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-accent/30 transition-all flex items-center justify-center gap-3 group/btn"
                                                >
                                                    <Eye size={16} /> {activeTab === "Neural_Nodes" ? 'NODE_DETAILS' : 'INSPECT'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Scanning background line */}
                                        <motion.div
                                            animate={{ left: ['-100%', '100%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className={`absolute top-0 bottom-0 w-32 bg-linear-to-r from-transparent via-accent/5 to-transparent skew-x-12 pointer-events-none ${tx.status === 'Blocked' ? 'hidden' : ''}`}
                                        />
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                    {hasMore && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="px-12 py-5 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white hover:border-accent transition-all flex items-center gap-4"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                                {loading ? 'FETCHING' : 'LOAD_REMAINDER'}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Investigation Panel Overlay - Moved outside main for full viewport access */}
            <AnimatePresence>
                {selectedTransaction && (
                    <InvestigationPanel
                        tx={selectedTransaction}
                        onClose={() => setSelectedTransaction(null)}
                        onActionSuccess={handleActionSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-accent/10 text-accent border border-accent/20' : 'text-white/60 hover:bg-white/10 hover:text-white/80'
            }`}>
        <div className={`${active ? 'text-accent' : 'text-white/60 group-hover:text-white/80'} transition-colors`}>
            {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
);

const OperationalMetric = ({ label, value }) => {
    return (
        <div className="p-8 rounded-[2rem] border border-white/20 bg-white/[0.08] relative overflow-hidden group hover:border-accent/30 transition-all">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/60 mb-3 block">{label}</span>
                <h3 className="text-4xl font-display font-bold tracking-tighter uppercase text-white group-hover:text-accent transition-colors">{value}</h3>
            </div>
        </div>
    );
};

const InvestigationPanel = ({ tx, onClose, onActionSuccess }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-card border border-white/10 rounded-[3rem] p-12 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-accent to-transparent" />

            <div className="flex justify-between items-start mb-12">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-accent/80 mb-3">Investigation_Target</h4>
                    <h2 className="text-4xl font-display font-medium text-white uppercase tracking-tighter">
                        Trace_ID: {tx._id.substr(-8).toUpperCase()}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-4 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-all"
                >
                    <RefreshCw size={24} className="rotate-45" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                    <DetailItem label="Origin_Account" value={tx.userId?.username || 'ANONYMOUS'} />
                    <DetailItem label="Beneficiary_Account" value={tx.beneficiaryId?.username || tx.description.split('Sent to ')[1] || 'Unknown'} />
                    <DetailItem label="Transmission_Type" value={tx.type} />
                </div>
                <div className="space-y-6">
                    <DetailItem label="Industry_Protocol" value="ISO 20022 Compliance" color="text-accent" />
                    <DetailItem label="Risk_Score" value={`${tx.riskScore}%`} color="text-white" />
                    <DetailItem label="Node_Identity" value={tx.deviceId || 'Neural_ID_Pending'} />
                </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <DollarSign size={20} className="text-accent" />
                        <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Financial_Magnitude</h5>
                    </div>
                    <span className="text-3xl font-display font-medium tracking-tighter text-white">
                        ${Math.abs(tx.amount).toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Globe size={20} className="text-accent" />
                    <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Geo_Spatial_Telemetry</h5>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-4">
                    <div>
                        <span className="text-xs text-white/60 font-bold uppercase tracking-widest block mb-1">City</span>
                        <span className="text-base font-bold text-white uppercase tracking-tight">{tx.location?.city || 'Unknown'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-white/60 font-bold uppercase tracking-widest block mb-1">Coordinates</span>
                        <span className="text-base font-bold text-white uppercase tracking-tight">
                            {tx.location?.lat?.toFixed(4)}, {tx.location?.lon?.toFixed(4)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={async () => {
                        try {
                            if (tx.isBlocked) {
                                // RE-ADD / UNBLOCK logic
                                const res = await API.post('/digital/admin/unblock-user', {
                                    userId: tx.userId._id || tx.userId
                                });
                                toast.success(res.data.message);
                                onActionSuccess(tx._id, 'Unblocked');
                            } else {
                                // BLOCK logic
                                const res = await API.post('/digital/admin/block-node', {
                                    deviceId: tx.deviceId,
                                    userId: tx.userId._id || tx.userId
                                });
                                toast.success(res.data.message);
                                onActionSuccess(tx._id, 'Blocked');
                            }
                        } catch (e) {
                            toast.error("Operation failed");
                        }
                    }}
                    className={`flex-1 py-6 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] transition-all border ${tx.isBlocked
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/40'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-rose-500/20 hover:text-rose-500 hover:border-rose-500/30'
                        }`}
                >
                    {tx.isBlocked ? 'RE-ADD USER' : 'BLOCK_NODE'}
                </button>
                <button
                    onClick={async () => {
                        if (tx.isReverted) return;
                        if (window.confirm("WARNING: Initiating Asset Recovery Protocol. This will reverse balances. Proceed?")) {
                            try {
                                const res = await API.post(`/digital/admin/transactions/${tx._id}/revert`);
                                toast.success(res.data.message);
                                onActionSuccess(tx._id, 'Reverted');
                            } catch (e) {
                                toast.error("Reversal failed");
                            }
                        }
                    }}
                    disabled={tx.isReverted}
                    className={`flex-1 py-6 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] transition-all border ${tx.isReverted
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 cursor-not-allowed'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-500 hover:border-emerald-500/30'
                        }`}
                >
                    {tx.isReverted ? 'REVERTED' : 'REVERT_ASSETS'}
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 py-6 bg-accent/10 border border-accent/20 text-accent rounded-2xl text-xs font-bold uppercase tracking-[0.3em] hover:bg-accent hover:text-black transition-all"
                >
                    CLOSE_CASE
                </button>
            </div>
        </motion.div>
    </motion.div>
);

const DetailItem = ({ label, value, color = 'text-white' }) => (
    <div>
        <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest block mb-1">{label}</span>
        <span className={`text-base font-bold uppercase tracking-tight ${color}`}>{value}</span>
    </div>
);

export default AnalystDashboard;
