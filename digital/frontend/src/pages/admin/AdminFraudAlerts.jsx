import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Download, Mail, RefreshCw, ShieldAlert, Clock, MapPin, Eye, X, DollarSign, Globe } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import UIContext from '../../context/UIContext';
import { useContext } from 'react';

const AdminFraudAlerts = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const { showPrompt, showConfirm } = useContext(UIContext);

    const fetchSuspicious = async () => {
        setLoading(true);
        try {
            const res = await api.get('/digital/admin/suspicious-transactions');
            setTransactions(res.data || []);
        } catch (err) {
            toast.error("Failed to sync neural anomalies.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuspicious();
    }, []);

    const handleDownload = async () => {
        setExporting(true);
        try {
            const response = await api.post('/digital/admin/export-suspicious', {}, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Forensic_Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Forensic report exported successfully.");
        } catch (err) {
            toast.error("Export protocol failed.");
        } finally {
            setExporting(false);
        }
    };

    const handleEmail = async () => {
        const email = await showPrompt({
            title: "Forensic Transmission",
            message: "Enter destination email for secure transmission:",
            placeholder: "agent@cyber-forensics.gov",
            confirmText: "TRANSMIT"
        });
        if (!email) return;

        setSendingEmail(true);
        try {
            await api.post('/digital/admin/export-suspicious', { email });
            toast.success(`Report transmitted to ${email}`);
        } catch (err) {
            toast.error("Neural transmission failure.");
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Header Section */}
            <section className="glass-panel p-10 lg:p-16 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-3 text-[10px] text-cyan-500 font-black uppercase tracking-[0.4em] mb-6 bg-cyan-500/10 px-6 py-2 rounded-full border border-cyan-500/20">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            SUSPICIOUS_ACTIVITY_MONITOR
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-display font-medium text-white tracking-tighter uppercase leading-none mb-6">
                            Fraud <span className="text-cyan-500">Alerts</span>
                        </h2>
                        <p className="text-white/40 max-w-lg text-xs font-bold uppercase tracking-widest leading-loose">
                            High risk transactions detected in the system. 
                            Please review the list below and take action if needed.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 w-full md:w-auto">
                        <button 
                            onClick={handleDownload}
                            disabled={exporting || transactions.length === 0}
                            className="bg-cyan-500 hover:bg-cyan-600 text-black py-5 px-10 rounded-2xl text-[10px] font-bold font-[sans] uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-30 transition-all shadow-xl shadow-cyan-500/20"
                        >
                            {exporting ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                            DOWNLOAD_PDF
                        </button>
                        <button 
                            onClick={handleEmail}
                            disabled={sendingEmail || transactions.length === 0}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl text-white transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                        >
                            {sendingEmail ? <RefreshCw className="animate-spin" size={20} /> : <Mail size={20} />}
                            <span className="text-[10px] font-bold uppercase tracking-widest sm:hidden lg:inline-block">TRANSMIT_VIA_MAIL</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Suspicious Transactions List */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="glass-panel p-24 text-center rounded-[3rem] border-white/5">
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">Synchronizing neural anomalies...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="glass-panel p-24 text-center rounded-[3rem] border-white/5 opacity-50">
                        <ShieldAlert size={64} className="mx-auto mb-8 text-emerald-500 opacity-20" />
                        <h3 className="text-xl font-display font-medium text-white uppercase tracking-tight mb-4">No Issues Found</h3>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">All transactions appear to be safe.</p>
                    </div>
                ) : (
                    transactions.map((tx, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={tx._id}
                            className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:border-cyan-500/20 transition-all duration-500"
                        >
                            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shrink-0 group-hover:scale-110 transition-transform duration-500">
                                <AlertTriangle size={32} className="text-amber-500" />
                            </div>
                            
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] block mb-2">TRANSACTION_ID</span>
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">{tx._id.slice(-12).toUpperCase()}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] block mb-2">RISK_LEVEL</span>
                                    <span className="text-lg font-display font-medium text-amber-500">{tx.riskScore}%</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] block mb-2">LOCATION</span>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={12} className="text-amber-500" />
                                        <span className="text-sm font-bold text-white uppercase tracking-tight">{tx.location?.city || 'Unknown'}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] block mb-2">DATE_TIME</span>
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-white/40" />
                                        <span className="text-sm font-bold text-white/60 uppercase tracking-tight">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 border-l border-white/5 pl-8 h-full">
                                <div className="text-right">
                                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] block mb-2">VOLUME</span>
                                    <span className="text-xl font-display font-medium text-white">${Math.abs(tx.amount).toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedTransaction(tx)}
                                    className="p-4 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-xl transition-all border border-white/5"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Investigation Panel Overlay */}
            <AnimatePresence>
                {selectedTransaction && (
                    <InvestigationPanel
                        tx={selectedTransaction}
                        onClose={() => setSelectedTransaction(null)}
                        onActionSuccess={() => {
                            fetchSuspicious();
                            setSelectedTransaction(null);
                        }}
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
            className="w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            <div className="flex justify-between items-start mb-12">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-500/80 mb-3">Audit_Target</h4>
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
                    <DetailItem label="Beneficiary" value={tx.beneficiaryId?.username || tx.description?.split('Sent to ')[1] || 'Unknown'} />
                    <DetailItem label="Type" value={tx.type} />
                </div>
                <div className="space-y-6">
                    <DetailItem label="Risk_Level" value={`${tx.riskScore}%`} color="text-amber-500" />
                    <DetailItem label="Device_ID" value={tx.deviceId || 'Neural_ID_Pending'} />
                    <DetailItem label="Status" value={tx.status} />
                </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <DollarSign size={20} className="text-cyan-500" />
                        <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Transaction_Volume</h5>
                    </div>
                    <span className="text-3xl font-display font-medium tracking-tighter text-white">
                        ${Math.abs(tx.amount).toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Globe size={20} className="text-cyan-500" />
                    <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Geo_Location</h5>
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
                        const confirmed = await showConfirm({
                            title: "Neutralize Threat",
                            message: `Are you sure you want to block node ${tx.deviceId}? This action will terminate all associated sessions.`,
                            confirmText: "BLOCK_NODE",
                            cancelText: "ABORT"
                        });
                        if (!confirmed) return;

                        try {
                            const res = await api.post('/digital/admin/block-node', { deviceId: tx.deviceId });
                            toast.success(res.data.message);
                            onActionSuccess();
                        } catch (e) {
                            toast.error("Action failed");
                        }
                    }}
                    disabled={tx.status === 'Blocked'}
                    className={`flex-1 py-6 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] transition-all border ${
                        tx.status === 'Blocked' 
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 cursor-not-allowed' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-amber-500/20 hover:text-amber-500 hover:border-amber-500/30'
                    }`}
                >
                    {tx.status === 'Blocked' ? 'BLOCKED' : 'BLOCK_NODE'}
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 py-6 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] transition-all border bg-cyan-500 text-black hover:bg-cyan-600"
                >
                    CLOSE_AUDIT
                </button>
            </div>
        </motion.div>
    </motion.div>
);

const DetailItem = ({ label, value, color = 'text-white' }) => (
    <div>
        <span className="text-[9px] text-white/60 font-black uppercase tracking-widest block mb-1">{label}</span>
        <span className={`text-base font-bold uppercase tracking-tight ${color}`}>{value}</span>
    </div>
);

export default AdminFraudAlerts;
