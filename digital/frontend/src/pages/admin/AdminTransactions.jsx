import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, DollarSign, Download, AlertCircle, RefreshCw, Globe, Eye, X } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import UIContext from '../../context/UIContext';
import { useContext } from 'react';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const { showConfirm } = useContext(UIContext);

    const handleActionSuccess = (txId, newStatus) => {
        setTransactions(prev => prev.map(tx => tx._id === txId ? { ...tx, status: newStatus } : tx));
        if (selectedTransaction && selectedTransaction._id === txId) {
            setSelectedTransaction(prev => ({ ...prev, status: newStatus }));
        }
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/digital/admin/transactions');
                setTransactions(res.data.transactions || []);
            } catch (err) {
                console.error("Error fetching transactions:", err);
                setError(err.response?.data?.message || err.message || "Failed to load transactions.");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8">
            <section className="glass-panel  rounded-[3rem] border-white/5 flex flex-col items-center justify-center min-h-[350px] text-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="p-5 bg-accent/10 rounded-2xl mb-6 relative z-10 border border-accent/20 group-hover:scale-110 transition-transform duration-700">
                    <Activity size={48} className="text-accent" />
                </div>
                <h3 className="text-2xl font-display font-medium text-white mb-3 uppercase tracking-tight relative z-10">Neural Analytics Interface</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed relative z-10">Intelligence gathering in progress. Visual transaction telemetry will be plotted here automatically as the network expands.</p>
            </section>

            {error && (
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-400">
                    <AlertCircle size={24} />
                    <p className="text-[10px] font-medium uppercase tracking-widest">{error}</p>
                </div>
            )}

            <section className="glass-panel p-10 rounded-[2.5rem] border-white/5 relative group">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                    <div>
                        <h3 className="text-2xl font-display font-medium text-white tracking-tight uppercase">Transaction Command Center</h3>
                        <p className="text-[10px] text-white/60 uppercase tracking-widest mt-1 font-bold">Real-time financial telemetry & node monitoring</p>
                    </div>
                    <button className="btn-sky !py-3 !px-8 text-[10px] w-full md:w-auto shadow-xl shadow-accent/10 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                        <Download size={16} /> EXPORT_DATA
                    </button>
                </div>

                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-white/[0.06]">
                                <th className="text-left p-5 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10 rounded-tl-2xl">Reference</th>
                                <th className="text-left p-5 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10">Originator</th>
                                <th className="text-left p-5 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10">Volume</th>
                                <th className="text-left p-5 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10">Timestamp</th>
                                <th className="text-left p-5 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10">Security Status</th>
                                <th className="text-left p-5 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10 rounded-tr-2xl text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-10">
                                            <DollarSign size={64} className="mb-6 text-white" />
                                            <p className="text-xs font-medium uppercase tracking-widest">No telemetry data detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(txn => (
                                    <tr key={txn._id} className="hover:bg-white/[0.03] transition-all duration-300 group/row">
                                        <td className="p-5">
                                            <span className="text-accent text-xs font-bold bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20 tracking-wider uppercase">{txn._id.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td className="p-5 font-medium text-white/80 text-sm uppercase tracking-tight">{txn.userId?.username || 'REDACTED_NODE'}</td>
                                         <td className="p-5">
                                            <span className={`text-base font-display font-medium tracking-tight ${txn.amount < 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="p-5 text-white/60 text-xs font-bold uppercase tracking-widest">
                                            {new Date(txn.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border ${txn.status === 'Completed' || txn.status === 'Clean' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' :
                                                txn.status === 'Suspicious' || txn.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]' :
                                                    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.05)]'
                                                }`}>
                                                {txn.status || 'UNSPECIFIED'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => setSelectedTransaction(txn)}
                                                className="text-cyan-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-0.5"
                                            >
                                                INSPECT
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            {/* Investigation Panel Overlay */}
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

const InvestigationPanel = ({ tx, onClose, onActionSuccess }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-black border border-white/10 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl"
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
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                    <DetailItem label="Origin_Account" value={tx.userId?.username || 'ANONYMOUS'} />
                    <DetailItem label="Beneficiary_Account" value={tx.beneficiaryId?.username || tx.description?.split('Sent to ')[1] || 'Unknown'} />
                    <DetailItem label="Transmission_Type" value={tx.type} />
                </div>
                <div className="space-y-6">
                    <DetailItem label="Processed_By" value={tx.processedBy?.username || 'Autonomous_Service'} color="text-accent" />
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
                        if (tx.status === 'Blocked') return;
                        try {
                            const res = await api.post('/digital/admin/block-node', { deviceId: tx.deviceId });
                            toast.success(res.data.message);
                            onActionSuccess(tx._id, 'Blocked');
                        } catch (e) {
                            toast.error("Termination failed");
                        }
                    }}
                    disabled={tx.status === 'Blocked'}
                    className={`flex-1 py-6 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] transition-all border ${
                        tx.status === 'Blocked' 
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 cursor-not-allowed' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-amber-500/20 hover:text-amber-500 hover:border-amber-500/30'
                    }`}
                >
                    {tx.status === 'Blocked' ? 'TERMINATED' : 'BLOCK_NODE'}
                </button>
                <button
                    onClick={async () => {
                        if (tx.status === 'Reverted') return;
                        const confirmed = await showConfirm({
                            title: "Asset Recovery Protocol",
                            message: "WARNING: Initiating Asset Recovery Protocol. This will reverse balances. Proceed?",
                            confirmText: "EXECUTE_REVERSAL",
                            cancelText: "ABORT"
                        });
                        if (confirmed) {
                            try {
                                const res = await api.post(`/digital/admin/transactions/${tx._id}/revert`);
                                toast.success(res.data.message);
                                onActionSuccess(tx._id, 'Reverted');
                            } catch (e) {
                                toast.error("Reversal failed");
                            }
                        }
                    }}
                    disabled={tx.status === 'Reverted'}
                    className={`flex-1 py-6 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] transition-all border ${
                        tx.status === 'Reverted'
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-500 hover:border-emerald-500/30'
                    }`}
                >
                    {tx.status === 'Reverted' ? 'REVERTED' : 'REVERT_ASSETS'}
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

export default AdminTransactions;
