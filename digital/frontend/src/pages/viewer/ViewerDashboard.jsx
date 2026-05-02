import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
    Wallet, CreditCard, Activity, ArrowUpRight, ArrowDownRight,
    Clock, ShieldCheck, Phone, AlertCircle, User,
    FileText, PieChart, Download, Calendar, Eye, ChevronRight, TrendingUp, Plus, DollarSign, Loader2
} from 'lucide-react';

const ViewerDashboard = () => {
    const [profileData, setProfileData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [transferEmail, setTransferEmail] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');

    const formatCurrency = (amount) => {
        const val = Math.abs(amount);
        let formatted = '';
        if (val >= 10000000) formatted = (val / 10000000).toFixed(2) + 'Cr';
        else if (val >= 100000) formatted = (val / 100000).toFixed(2) + 'L';
        else if (val >= 1000) formatted = (val / 1000).toFixed(1) + 'K';
        else formatted = val.toFixed(2);
        return amount < 0 ? `-${formatted}` : formatted;
    };

    const [reports] = useState([
        { title: 'Monthly Fraud Summary', type: 'PDF', date: 'Mar 2026', size: '2.4 MB' },
        { title: 'System Performance Log', type: 'CSV', date: 'Mar 15, 2026', size: '840 KB' },
        { title: 'Regional Risk Analysis', type: 'PDF', date: 'Feb 2026', size: '5.1 MB' },
    ]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [profileRes, txRes] = await Promise.all([
                    api.get('/digital/profile'),
                    api.get('/digital/transactions')
                ]);

                setProfileData(profileRes.data);
                setTransactions(txRes.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();

        // Handle PayU Redirect Parameters
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const txnid = urlParams.get('txnid');
        const riskScore = urlParams.get('risk');
        const errorMessage = urlParams.get('message');

        if (paymentStatus === 'success') {
            toast.success(`Transfer verified and finalized. ID: ${txnid}`, { id: 'payment-status' });
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchUserData();
        } else if (paymentStatus === 'failed') {
            toast.error(errorMessage ? `Transfer failed: ${errorMessage}` : 'Unable to process transfer. Please verify account status.', { id: 'payment-status' });
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (paymentStatus === 'error') {
            toast.error(errorMessage ? `System exception: ${errorMessage}` : 'An unexpected error occurred during processing.', { id: 'payment-status' });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleDeposit = async () => {
        if (!depositAmount || Number(depositAmount) <= 0) return;

        setIsTransferring(true);
        const txnid = 'DEP' + Date.now();
        const productinfo = `Wallet Deposit`;
        const firstname = user.username;
        const email = user.email;

        try {
            const res = await api.post('/digital/payu/hash', {
                txnid,
                amount: depositAmount,
                productinfo,
                firstname,
                email,
                receiverEmail: email // Self deposit
            });

            const { hash, key, udf1, udf2, txnid: serverTxnId, amount: serverAmount } = res.data;

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://test.payu.in/_payment';

            const fields = {
                key, txnid: serverTxnId, amount: serverAmount, productinfo, firstname, email,
                udf1, udf2,
                phone: user.phone || '9999999999',
                surl: 'http://localhost:5000/digital/payu/response',
                furl: 'http://localhost:5000/digital/payu/response',
                hash,
                service_provider: 'payu_paisa'
            };

            for (const name in fields) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = fields[name];
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('Deposit via PayU failed:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Initialization failed';
            toast.error(`Request rejected: ${errorMsg}`, { id: 'transfer-init' });
            setIsTransferring(false);
            setIsDepositModalOpen(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferAmount || Number(transferAmount) <= 0 || !transferEmail) return;

        setIsTransferring(true);
        const txnid = 'TXN' + Date.now();
        const productinfo = `Transfer to ${transferEmail}`;
        const firstname = user.username;
        const email = user.email;

        try {
            const res = await api.post('/digital/payu/hash', {
                txnid,
                amount: transferAmount,
                productinfo,
                firstname,
                email,
                receiverEmail: transferEmail
            });

            const { hash, key, udf1, udf2, txnid: serverTxnId, amount: serverAmount } = res.data;

            // Create a form dynamically and submit to PayU Test URL
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://test.payu.in/_payment';

            const fields = {
                key, txnid: serverTxnId, amount: serverAmount, productinfo, firstname, email,
                udf1, udf2,
                phone: user.phone || '9999999999',
                surl: 'http://localhost:5000/digital/payu/response',
                furl: 'http://localhost:5000/digital/payu/response',
                hash,
                service_provider: 'payu_paisa'
            };

            for (const name in fields) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = fields[name];
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('Transfer via PayU failed:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Initialization failed';
            toast.error(`Request rejected: ${errorMsg}`, { id: 'transfer-init' });
            setIsTransferring(false);
            setIsConfirmModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-5">
                <div className="glass-effect p-8 text-center max-w-md">
                    <AlertCircle className="text-danger w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
                    <p className="text-text-secondary">{error}</p>
                </div>
            </div>
        );
    }

    const { user, wallet } = profileData || {};

    return (
        <div className="py-20 px-[5%] max-w-7xl mx-auto min-h-screen bg-black text-foreground font-sans">
            <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-display font-black mb-6 text-white tracking-tighter uppercase leading-[0.9]">
                        Security <br /><span className="text-accent">Command</span> Console
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">
                        <div className="flex items-center gap-3 px-5 py-2 bg-accent/10 border border-accent/20 text-accent rounded-full">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                            Status: ENCRYPTED
                        </div>
                        <div className="flex items-center gap-3">
                            <User size={14} className="text-white/20" />
                            Master Node: {user?.username}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-5 px-8 py-4 bg-white/5 border border-white/5 rounded-full text-white/40 font-black text-[10px] uppercase tracking-[0.3em] w-full md:w-auto justify-center">
                    <Calendar size={18} className="text-accent" />
                    Synchronization: <span className="text-white">Real-time</span>
                </div>
            </header>

            <div className="grid grid-cols-[1fr_2fr] gap-12 max-lg:grid-cols-1 mb-20">
                {/* Left Column: Profile & Wallet */}
                <div className="flex flex-col gap-12">
                    {/* Wallet Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-linear-to-br from-accent/20 to-transparent border border-accent/20 rounded-[4rem] p-12 backdrop-blur-3xl relative overflow-hidden group"
                    >
                        <div className="absolute -top-20 -right-20 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                            <Wallet size={300} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4 text-accent font-display font-black">
                                    <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20">
                                        <Wallet size={24} />
                                    </div>
                                    <span className="tracking-[0.3em] uppercase text-[10px]">Digital Vault</span>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    VALIDATED
                                </div>
                            </div>
                            <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.4em] mb-4">Total Liquidity</div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 mb-12">
                                <h2 className="text-6xl lg:text-7xl font-display w-60 font-black text-white tracking-tighter uppercase">
                                    {wallet ? `${wallet.currency === 'USD' ? '$' : ''}${formatCurrency(wallet.balance)}` : '$0.00'}
                                </h2>
                                <button 
                                    onClick={() => setIsDepositModalOpen(true)}
                                    className="btn-sky !py-4 !px-8 text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-accent/20"
                                >
                                    <Plus size={18} /> ADD_FUNDS
                                </button>
                            </div>
                            
                            <div className="pt-10 border-t border-white/5">
                                <h4 className="text-[9px] font-black text-accent uppercase tracking-[0.4em] mb-8">Intelligence Transfer</h4>
                                <form onSubmit={(e) => { e.preventDefault(); setIsConfirmModalOpen(true); }} className="flex flex-col gap-5">
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                        <input
                                            type="email"
                                            placeholder="RECIPIENT_MASTER_ID"
                                            value={transferEmail}
                                            onChange={(e) => setTransferEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-accent/30 transition-all placeholder:opacity-20"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="relative flex-1">
                                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={16} />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={transferAmount}
                                                onChange={(e) => setTransferAmount(e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-accent/30 transition-all placeholder:opacity-20"
                                                required
                                                min="1"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isTransferring}
                                            className="btn-sky !p-5 !rounded-2xl disabled:opacity-50 flex items-center justify-center aspect-square"
                                        >
                                            {isTransferring ? <Loader2 className="animate-spin" size={20} /> : <ArrowUpRight size={24} />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* Profile Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-12 rounded-[4rem] border-white/5 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <h3 className="text-2xl font-display font-black mb-10 flex items-center gap-4 text-white uppercase tracking-tighter relative z-10">
                            <User size={24} className="text-accent" /> Profile Identity
                        </h3>

                        <div className="flex flex-col gap-8 relative z-10">
                            <ProfileField label="Identity Handle" value={user?.username} />
                            <ProfileField label="Master Email" value={user?.email} />
                            <ProfileField label="Secure Line" value={user?.phone || 'NOT_LINKED'} />

                            <div className="pt-8 mt-2 border-t border-white/5">
                                <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mb-4">Intelligence Clearance</div>
                                <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] ${user?.kycStatus === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        user?.kycStatus === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                    {user?.kycStatus === 'Verified' ? <ShieldCheck size={14} /> : <Clock size={14} />}
                                    {user?.kycStatus || 'PROCESSING'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Transactions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-12 rounded-[4rem] border-white/5 flex flex-col h-full relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <h3 className="text-2xl font-display font-black flex items-center gap-4 text-white uppercase tracking-tighter">
                            <Activity size={24} className="text-accent" /> Intelligence Trace
                        </h3>
                        <button className="text-[9px] text-accent font-black uppercase tracking-[0.3em] hover:text-white transition-colors">
                            VIEW_FULL_LOGS
                        </button>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/10 py-32 relative z-10">
                            <CreditCard size={80} className="mb-8 opacity-20" />
                            <p className="font-black uppercase tracking-[0.4em] text-[10px]">No traces detected</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                            {transactions.map((tx) => (
                                <div key={tx._id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-all duration-500 group/item hover:bg-white/[0.04]">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover/item:scale-110 ${tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                tx.type === 'Withdrawal' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-accent/10 text-accent border-accent/20'
                                            }`}>
                                            {tx.type === 'Deposit' ? <ArrowDownRight size={24} /> :
                                                tx.type === 'Withdrawal' ? <ArrowUpRight size={24} /> :
                                                    <Activity size={24} />}
                                        </div>
                                        <div>
                                            <div className="font-black text-white mb-2 uppercase tracking-tight text-lg">{tx.type}</div>
                                            <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em]">
                                                {new Date(tx.createdAt).toLocaleDateString()} <span className="mx-2 text-accent/50">|</span> {new Date(tx.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xl font-display font-black mb-2 tracking-tighter ${tx.type === 'Deposit' ? 'text-emerald-500' : 'text-white'}`}>
                                            {tx.type === 'Deposit' ? '+' : tx.type === 'Withdrawal' ? '-' : ''}
                                            ${formatCurrency(tx.amount)}
                                        </div>
                                        <div className={`text-[8px] font-black px-3 py-1 rounded-full inline-block uppercase tracking-[0.3em] border ${tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                            {tx.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
                <OverviewStat label="Network Integrity" value="99.98%" meta="STATUS_OPTIMAL" color="text-emerald-500" />
                <OverviewStat label="Protected Assets" value="$4.2M" meta="MASTER_SECURED" color="text-white" />
                <OverviewStat label="Neural Scans" value="2,841" meta="TPS_REAL_TIME" color="text-white" />
                <OverviewStat label="Latency" value="12ms" meta="NODE_RESPONSE" color="text-accent" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
                <section>
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Intelligence Reports</h3>
                        <button className="text-[9px] font-black text-accent uppercase tracking-[0.3em] hover:text-white transition-colors">ARCHIVES</button>
                    </div>
                    <div className="flex flex-col gap-6">
                        {reports.map((report, i) => (
                            <div key={i} className="glass-panel flex items-center gap-8 p-8 rounded-3xl transition-all hover:translate-x-3 border-white/5 hover:border-accent/30 group bg-white/[0.01]">
                                <div className="p-4 bg-accent/10 rounded-2xl text-accent border border-accent/20 group-hover:scale-110 transition-transform duration-500">
                                    <FileText size={28} />
                                </div>
                                <div className="grow">
                                    <h4 className="font-black text-white mb-2 uppercase tracking-tight text-lg">{report.title}</h4>
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{report.date} <span className="mx-2">|</span> {report.size}</span>
                                </div>
                                <button className="p-4 bg-white/5 text-white/30 rounded-2xl hover:bg-accent hover:text-black transition-all border border-white/5">
                                    <Download size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Market Intel</h3>
                    </div>
                    <div className="glass-panel rounded-[4rem] border-white/5 overflow-hidden flex flex-col h-full bg-white/[0.01]">
                        <InsightRow
                            icon={<TrendingUp className="text-emerald-500" size={24} />}
                            title="Threat Speed Index"
                            desc="Intelligence detection improved by 12% via Neural Core v4.2."
                        />
                        <InsightRow
                            icon={<PieChart className="text-accent" size={24} />}
                            title="Regional Defense"
                            desc="APAC nodes reporting 5% lower breach attempts this cycle."
                        />
                        <div className="p-10 mt-auto">
                            <button className="btn-secondary w-full !py-5 rounded-3xl flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] text-[10px]">
                                <Eye size={20} /> DETAILED_ANALYTICS
                            </button>
                        </div>
                    </div>
                </section>
            </div>
            
            {/* Confirmation Modal for Transfer */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleTransfer}
                title="Confirm Transfer"
                message={`Authorize the transfer of $${transferAmount} to ${transferEmail}? This intelligence trace is irreversible.`}
                confirmText="Authorize Transfer"
                type="primary"
            />

            {/* Deposit Modal */}
            <ConfirmationModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
                onConfirm={handleDeposit}
                title="Vault Deposit"
                message={
                    <div className="flex flex-col gap-8 mt-6">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Input the liquidity amount to be funneled into your secure digital vault via the PayU Gateway.</p>
                        <div className="relative">
                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={24} />
                            <input 
                                type="number" 
                                placeholder="AMOUNT" 
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-16 pr-8 py-5 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-accent/30 transition-all placeholder:opacity-20"
                                min="1"
                            />
                        </div>
                    </div>
                }
                confirmText="Initialize Flow"
                type="primary"
            />
        </div>
    );
};

const ProfileField = ({ label, value }) => (
    <div>
        <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mb-2">{label}</div>
        <div className="font-black text-white text-base uppercase tracking-tight">{value}</div>
    </div>
);

const OverviewStat = ({ label, value, meta, color }) => (
    <div className="glass-panel p-10 rounded-[3rem] border-white/5 text-center hover:border-accent/30 transition-all duration-700 hover:bg-white/[0.02] group">
        <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.4em] mb-6">{label}</div>
        <div className={`text-4xl font-display font-black mb-3 tracking-tighter uppercase ${color}`}>{value}</div>
        <div className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 group-hover:text-accent transition-colors">{meta}</div>
    </div>
);

const InsightRow = ({ icon, title, desc }) => (
    <div className="flex items-center justify-between p-10 border-b border-white/5 cursor-pointer transition-all hover:bg-white/[0.04] group">
        <div className="flex gap-6 items-start">
            <div className="mt-1 p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500">{icon}</div>
            <div>
                <h5 className="font-black text-white mb-2 uppercase tracking-tight text-lg">{title}</h5>
                <p className="text-[10px] text-white/30 leading-relaxed font-bold uppercase tracking-wider">{desc}</p>
            </div>
        </div>
        <ChevronRight size={24} className="text-white/20 group-hover:text-accent group-hover:translate-x-2 transition-all" />
    </div>
);

export default ViewerDashboard;
