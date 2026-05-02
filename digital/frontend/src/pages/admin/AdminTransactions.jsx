import React, { useState, useEffect } from 'react';
import { Activity, DollarSign, Download, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/digital/admin/transactions');
                setTransactions(res.data);
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
        <div className="flex flex-col gap-12">
            <section className="glass-panel p-16 rounded-[4rem] border-white/5 flex flex-col items-center justify-center min-h-[450px] text-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="p-6 bg-accent/10 rounded-3xl mb-8 relative z-10 border border-accent/20 group-hover:scale-110 transition-transform duration-700">
                    <Activity size={60} className="text-accent" />
                </div>
                <h3 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-tighter relative z-10">Neural Analytics Interface</h3>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] max-w-md mx-auto leading-loose relative z-10">Intelligence gathering in progress. Visual transaction telemetry will be plotted here automatically as the network expands.</p>
            </section>

            {error && (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-5 text-rose-400">
                    <AlertCircle size={28} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">{error}</p>
                </div>
            )}

            <section className="glass-panel p-12 rounded-[3.5rem] border-white/5 relative group">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
                    <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Transaction Command Center</h3>
                    <button className="btn-sky !py-4 !px-10 text-[10px] w-full md:w-auto shadow-2xl shadow-accent/20 uppercase font-black tracking-[0.2em]">
                        <Download size={18} /> EXPORT_DATA
                    </button>
                </div>

                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-white/[0.03]">
                                <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5 rounded-tl-[2rem]">Reference</th>
                                <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">Originator</th>
                                <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">Volume</th>
                                <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">Timestamp</th>
                                <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">Security Status</th>
                                <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5 rounded-tr-[2rem]">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-32 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-10">
                                            <DollarSign size={80} className="mb-8" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No telemetry data detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(txn => (
                                    <tr key={txn._id} className="hover:bg-white/[0.04] transition-all duration-500 group/row">
                                        <td className="p-6">
                                            <span className="text-accent text-[9px] font-black bg-accent/10 px-4 py-2 rounded-xl border border-accent/20 tracking-[0.3em] uppercase">{txn._id.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td className="p-6 font-black text-white text-base uppercase tracking-tight">{txn.userId?.username || 'REDACTED_NODE'}</td>
                                        <td className="p-6">
                                            <span className={`text-lg font-display font-black tracking-tighter ${txn.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="p-6 text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">
                                            {new Date(txn.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-5 py-2 text-[8px] font-black uppercase tracking-[0.3em] rounded-full border ${txn.status === 'Completed' || txn.status === 'Clean' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                                    txn.status === 'Suspicious' || txn.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                                                        'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                                                }`}>
                                                {txn.status || 'UNSPECIFIED'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <button className="text-accent text-[9px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors">INSPECT</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminTransactions;
