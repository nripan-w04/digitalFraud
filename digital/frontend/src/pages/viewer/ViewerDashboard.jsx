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
    const [deviceId] = useState(() => {
        const savedId = localStorage.getItem('forensic_node_id');
        if (savedId) return savedId;
        const newId = "node_" + Math.random().toString(36).substr(2, 12);
        localStorage.setItem('forensic_node_id', newId);
        return newId;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [transferEmail, setTransferEmail] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [riskInfo, setRiskInfo] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMoreTransactions = async () => {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await api.get(`/digital/transactions?cursor=${nextCursor}&limit=5`);
            setTransactions(prev => [...prev, ...(res.data.transactions || [])]);
            setNextCursor(res.data.nextCursor || null);
        } catch (err) {
            toast.error("Failed to load more traces.");
        } finally {
            setLoadingMore(false);
        }
    };

    const handlePreCheck = async () => {
        if (!transferEmail || !transferAmount) return;
        setAnalyzing(true);
        try {
            const response = await api.post('/digital/transactions/pre-check', {
                recipientEmail: transferEmail,
                amount: parseFloat(transferAmount),
                deviceId: deviceId,
                location: { lat: 0, lon: 0 }
            });
            setRiskInfo(response.data);
            toast.success("Intelligence analysis complete.");
        } catch (err) {
            toast.error("Analysis protocol failed.");
        } finally {
            setAnalyzing(false);
        }
    };

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
                    api.get('/digital/transactions?limit=5')
                ]);

                setProfileData(profileRes.data);
                setTransactions(txRes.data.transactions || []);
                setNextCursor(txRes.data.nextCursor || null);
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

    const getCoordinates = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("GEOLOCATION_UNSUPPORTED: This secure terminal requires hardware location tracking."));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({
                    city: "Real-time Verified",
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
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

    const handleDeposit = async () => {
        if (!depositAmount || Number(depositAmount) <= 0) return;

        let coords;
        try {
            coords = await getCoordinates();
        } catch (locErr) {
            toast.error(locErr.message, {
                icon: '📍',
                style: { background: '#1a1a1a', color: '#f43f5e', border: '1px solid #f43f5e', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }
            });
            setIsTransferring(false);
            return;
        }

        const txnid = 'DEP' + Date.now();
        const productinfo = `Wallet Deposit`;
        const firstname = user.username;
        const email = user.email;

        try {
            const res = await api.post('/digital/payu/deposit/hash', {
                txnid,
                amount: depositAmount,
                productinfo,
                firstname,
                email,
                deviceId: deviceId,
                location: coords
            });

            const { hash, key, udf1, udf2, udf3, udf4, txnid: serverTxnId, amount: serverAmount } = res.data;

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://test.payu.in/_payment';

            const fields = {
                key, txnid: serverTxnId, amount: serverAmount, productinfo, firstname, email,
                udf1, udf2, udf3, udf4,
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
            const errorMsg = error.response?.data?.message || "SYSTEM_ERROR: Neural transmission failed.";
            toast.error(errorMsg, {
                style: { background: '#1a1a1a', color: '#f43f5e', border: '1px solid #f43f5e', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }
            });
            setIsTransferring(false);
            setIsDepositModalOpen(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferAmount || Number(transferAmount) <= 0 || !transferEmail) return;

        let coords;
        try {
            coords = await getCoordinates();
        } catch (locErr) {
            toast.error(locErr.message, {
                icon: '📍',
                style: { background: '#1a1a1a', color: '#f43f5e', border: '1px solid #f43f5e', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }
            });
            setIsTransferring(false);
            // Keep modal open for retry
            return;
        }

        const txnid = 'TXN' + Date.now();
        const productinfo = `Transfer to ${transferEmail}`;
        const firstname = user.username;
        const email = user.email;

        try {
            const res = await api.post('/digital/payu/transfer/hash', {
                txnid,
                amount: transferAmount,
                productinfo,
                firstname,
                email,
                receiverEmail: transferEmail,
                deviceId: deviceId,
                location: coords
            });

            const { hash, key, udf1, udf2, udf3, udf4, txnid: serverTxnId, amount: serverAmount } = res.data;

            // Create a form dynamically and submit to PayU Test URL
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://test.payu.in/_payment';

            const fields = {
                key, txnid: serverTxnId, amount: serverAmount, productinfo, firstname, email,
                udf1, udf2, udf3, udf4,
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
            const errorMsg = error.response?.data?.message || "SYSTEM_ERROR: Neural transmission failed.";
            toast.error(errorMsg, {
                style: { background: '#1a1a1a', color: '#f43f5e', border: '1px solid #f43f5e', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }
            });
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
        <div className="py-20 px-[5%] mx-auto min-h-screen bg-black text-foreground font-sans relative">
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(14, 165, 233, 0.4);
                    border-radius: 10px;
                    border: 2px solid rgba(0, 0, 0, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(14, 165, 233, 0.8);
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(14, 165, 233, 0.4) rgba(255, 255, 255, 0.05);
                }

                @keyframes edge-glow {
                    0%, 100% { opacity: 0.3; filter: blur(20px); }
                    50% { opacity: 0.6; filter: blur(35px); }
                }

                @keyframes border-beam {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .border-beam-active::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    padding: 2px;
                    border-radius: inherit;
                    background: linear-gradient(to right, transparent, #0ea5e9, transparent);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    animation: border-beam 4s linear infinite;
                }

                .plasma-edge {
                    position: relative;
                }
                .plasma-edge::before {
                    content: "";
                    position: absolute;
                    inset: -1px;
                    background: linear-gradient(45deg, transparent, #0ea5e9, transparent, #0ea5e9, transparent);
                    background-size: 400% 400%;
                    animation: plasma-flow 10s ease infinite;
                    border-radius: inherit;
                    z-index: -1;
                    opacity: 0.5;
                }
                @keyframes plasma-flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            ` }} />

            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[150px] animate-[edge-glow_8s_ease-infinite]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[150px] animate-[edge-glow_12s_ease-infinite]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
            >
                <div className="relative mb-20 rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] group w-full border-beam-active">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/security_command_bg_1777978800534.png" 
                            alt="Security Core" 
                            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[10s] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
                    </div>

                    <div className="absolute top-0 left-0 w-full h-[1px] bg-accent/30 animate-[scan_4s_linear_infinite] z-10" />
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-accent/30 rounded-tl-3xl" />
                        <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-accent/30 rounded-tr-3xl" />
                        <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-accent/30 rounded-bl-3xl" />
                        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-accent/30 rounded-br-3xl" />
                    </div>

                    <div className="relative z-20 p-12 lg:p-20 flex flex-col lg:flex-row justify-between items-end gap-12">
                        <div className="max-w-3xl">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 mb-8"
                            >
                                <span className="px-4 py-1.5 bg-accent/20 border border-accent/40 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                                    Intelligence Core Active
                                </span>
                                <div className="h-[1px] w-20 bg-white/20" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Node_ID: {user?.username}</span>
                            </motion.div>

                            <h1 className="text-6xl lg:text-7xl font-display font-black text-white tracking-tighter uppercase leading-[0.85] mb-10">
                                Neural <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-tertiary drop-shadow-[0_0_20px_rgba(14,165,233,0.4)]">Sentry</span>
                                System
                            </h1>

                            <div className="flex flex-wrap items-center gap-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                                        <ShieldCheck className="text-accent" size={32} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Defense Protocol</div>
                                        <div className="text-xl font-bold text-white uppercase tracking-tight">Active_Guard</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-6">
                            <div className="p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group/card">
                                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-5 mb-4 relative z-10">
                                    <Calendar className="text-accent" size={24} />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Temporal Sync</span>
                                        <span className="text-sm font-bold text-white uppercase tracking-widest">System_Online</span>
                                    </div>
                                </div>
                                <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] relative z-10">Last Uplink: {new Date().toLocaleTimeString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20 items-stretch">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-12 rounded-[3.5rem] border-white/20 relative overflow-hidden group flex flex-col h-full shadow-[0_15px_35px_rgba(0,0,0,0.6)] plasma-edge"
                    >
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

                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3.5rem] p-12 relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.5),_inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col h-full plasma-edge"
                    >
                        <div className="absolute -top-20 -right-20 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                            <Wallet size={300} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4 text-accent font-black">
                                    <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20">
                                        <Wallet size={24} />
                                    </div>
                                    <span className="tracking-[0.3em] uppercase text-xs">Digital Vault</span>
                                </div>
                            </div>
                            <div className="text-xs text-white/50 font-bold uppercase tracking-[0.3em] mb-4">Total Liquidity</div>
                            <div className="flex flex-col items-start justify-between gap-8 mb-12">
                                <h2 className="text-6xl font-display font-medium text-white tracking-tighter uppercase">
                                    {wallet ? `${wallet.currency === 'USD' ? '$' : ''}${formatCurrency(wallet.balance)}` : '$0.00'}
                                </h2>
                                <button
                                    onClick={() => setIsDepositModalOpen(true)}
                                    className="btn-sky w-full py-4 px-8 text-xs uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-accent/20"
                                >
                                    <Plus size={18} /> ADD_FUNDS
                                </button>
                            </div>

                            <div className="pt-10 border-t border-white/5 mt-auto">
                                <h4 className="text-xs font-bold text-accent/80 uppercase tracking-[0.3em] mb-8">Intelligence Transfer</h4>
                                <form onSubmit={(e) => { e.preventDefault(); setIsConfirmModalOpen(true); }} className="flex flex-col gap-5">
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                        <input
                                            type="email"
                                            placeholder="RECIPIENT_MASTER_ID"
                                            value={transferEmail}
                                            onChange={(e) => {
                                                setTransferEmail(e.target.value);
                                                setRiskInfo(null);
                                            }}
                                            className="w-full bg-white/10 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-xs font-bold uppercase tracking-widest outline-none focus:border-accent/30 transition-all placeholder:opacity-40"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="relative flex-1">
                                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={18} />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={transferAmount}
                                                onChange={(e) => {
                                                    setTransferAmount(e.target.value);
                                                    setRiskInfo(null);
                                                }}
                                                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-xs font-bold uppercase tracking-widest outline-none focus:border-accent/30 transition-all placeholder:opacity-40"
                                                required
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    {!riskInfo ? (
                                        <button
                                            type="button"
                                            onClick={handlePreCheck}
                                            disabled={analyzing || !transferEmail || !transferAmount}
                                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all disabled:opacity-20"
                                        >
                                            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <><ShieldCheck size={16} className="text-accent" /> ANALYZE_RISK</>}
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isTransferring}
                                            className="btn-sky !py-5 !rounded-2xl disabled:opacity-50 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em]"
                                        >
                                            {isTransferring ? <Loader2 className="animate-spin" size={16} /> : <><ArrowUpRight size={16} /> INITIATE_TRANSFER</>}
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-8 md:p-12 rounded-[3.5rem] border-white/20 flex flex-col h-full relative overflow-hidden group shadow-[0_25px_60px_rgba(0,0,0,0.7)] plasma-edge"
                    >
                        <div className="flex justify-between items-center mb-12 relative z-10">
                            <h3 className="text-2xl font-display font-medium flex items-center gap-4 text-white uppercase tracking-tighter">
                                <Activity size={24} className="text-accent" /> Intelligence Trace
                            </h3>
                        </div>

                        {(transactions || []).length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-white/40 py-32 relative z-10">
                                <CreditCard size={80} className="mb-8 opacity-40" />
                                <p className="font-bold uppercase tracking-[0.2em] text-[10px]">No traces detected</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col w-full gap-6 overflow-y-auto pr-4 custom-scrollbar relative z-10 max-h-[600px]">
                                {(transactions || []).map((tx) => (
                                    <div key={tx._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-all duration-500 group/item hover:bg-white/[0.04] gap-6">
                                        <div className="flex items-center gap-6 min-w-0">
                                            <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-transform duration-500 group-hover/item:scale-110 ${tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                tx.type === 'Withdrawal' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-accent/10 text-accent border-accent/20'
                                                }`}>
                                                {tx.type === 'Deposit' ? <ArrowDownRight size={24} /> :
                                                    tx.type === 'Withdrawal' ? <ArrowUpRight size={24} /> :
                                                        <Activity size={24} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white mb-2 uppercase tracking-tight text-xl truncate">{tx.type}</div>
                                                <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sm:text-right flex-shrink-0">
                                            <div className="text-2xl font-display font-medium mb-2 tracking-tighter text-white">
                                                ${formatCurrency(tx.amount)}
                                            </div>
                                            <div className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/40">
                                                {tx.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {nextCursor && (
                                    <button
                                        onClick={loadMoreTransactions}
                                        disabled={loadingMore}
                                        className="w-full py-6 mt-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-4"
                                    >
                                        {loadingMore ? <Loader2 size={16} className="animate-spin" /> : "LOAD_MORE_TRACES"}
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
                <OverviewStat label="Network Integrity" value="99.98%" meta="STATUS_OPTIMAL" color="text-emerald-500" />
                <OverviewStat label="Protected Assets" value="$4.2M" meta="MASTER_SECURED" color="text-white" />
                <OverviewStat label="Neural Scans" value="2,841" meta="TPS_REAL_TIME" color="text-white" />
                <OverviewStat label="Latency" value="12ms" meta="NODE_RESPONSE" color="text-accent" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                <section className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-display font-medium text-white tracking-tighter uppercase">Intelligence Reports</h3>
                        <button className="text-xs font-bold text-accent/60 uppercase tracking-[0.2em] hover:text-white transition-colors">ARCHIVES</button>
                    </div>
                    <div className="flex flex-col gap-6 flex-1">
                        {reports.map((report, i) => (
                            <div key={i} className="glass-panel flex items-center gap-8 p-8 rounded-3xl transition-all hover:translate-x-3 border-white/5 hover:border-accent/30 group bg-white/[0.01]">
                                <div className="p-4 bg-accent/10 rounded-2xl text-accent border border-accent/20 group-hover:scale-110 transition-transform duration-500">
                                    <FileText size={28} />
                                </div>
                                <div className="grow">
                                    <h4 className="font-bold text-white mb-2 uppercase tracking-tight text-xl">{report.title}</h4>
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">{report.date} <span className="mx-2">|</span> {report.size}</span>
                                </div>
                                <button className="p-4 bg-white/10 text-white/50 rounded-2xl hover:bg-accent hover:text-black transition-all border border-white/10">
                                    <Download size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Market Intel</h3>
                    </div>
                    <div className="glass-panel rounded-[3.5rem] border-white/10 overflow-hidden flex flex-col h-full bg-white/[0.01] shadow-2xl">
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
                            <button className="btn-secondary w-full !py-6 rounded-3xl flex items-center justify-center gap-4 font-bold uppercase tracking-[0.2em] text-xs">
                                <Eye size={20} /> DETAILED_ANALYTICS
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleTransfer}
                title="Confirm Transfer"
                message={`Authorize the transfer of $${transferAmount} to ${transferEmail}? This intelligence trace is irreversible.`}
                confirmText="Authorize Transfer"
                type="primary"
            />

            <ConfirmationModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
                onConfirm={handleDeposit}
                title="Vault Deposit"
                message={
                    <div className="flex flex-col gap-8 mt-6">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">Input the liquidity amount to be funneled into your secure digital vault via the PayU Gateway.</p>
                        <div className="relative">
                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={24} />
                            <input
                                type="number"
                                placeholder="AMOUNT"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-2xl pl-16 pr-8 py-5 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-accent/30 transition-all placeholder:opacity-40"
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
        <div className="text-xs text-white/50 font-bold uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="font-bold text-white text-xl uppercase tracking-tight">{value}</div>
    </div>
);

const OverviewStat = ({ label, value, meta, color }) => (
    <div className="glass-panel p-10 rounded-[3rem] border-white/10 text-center hover:border-accent/30 transition-all duration-700 hover:bg-white/[0.02] group">
        <div className="text-xs text-white/60 font-bold uppercase tracking-[0.2em] mb-6">{label}</div>
        <div className={`text-5xl font-display font-medium mb-3 tracking-tighter uppercase ${color}`}>{value}</div>
        <div className="text-xs font-bold uppercase tracking-[0.4em] text-white/40 group-hover:text-accent/80 transition-colors">{meta}</div>
    </div>
);

const InsightRow = ({ icon, title, desc }) => (
    <div className="flex items-center justify-between p-10 border-b border-white/10 cursor-pointer transition-all hover:bg-white/[0.04] group">
        <div className="flex gap-6 items-start">
            <div className="mt-1 p-3 bg-white/10 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">{icon}</div>
            <div>
                <h5 className="font-bold text-white mb-2 uppercase tracking-tight text-xl">{title}</h5>
                <p className="text-xs text-white/60 leading-relaxed font-bold uppercase tracking-wider">{desc}</p>
            </div>
        </div>
        <ChevronRight size={24} className="text-white/40 group-hover:text-accent group-hover:translate-x-2 transition-all" />
    </div>
);

export default ViewerDashboard;
