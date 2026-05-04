import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    User, Mail, Phone, Shield, 
    Lock, Edit3, Save, Loader2, 
    ShieldCheck, Wallet, Activity, ArrowLeft
} from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        password: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await API.get('/digital/profile');
            setProfile(response.data.user);
            setWallet(response.data.wallet);
            setFormData({
                username: response.data.user.username,
                phone: response.data.user.phone || '',
                password: ''
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load neural identity");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const dataToUpdate = { ...formData };
            if (!dataToUpdate.password) delete dataToUpdate.password;

            const response = await API.put('/digital/profile', dataToUpdate);
            setProfile(response.data.user);
            setEditMode(false);
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Update sequence failed");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-accent" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black py-32 px-[5%] max-w-7xl mx-auto">
            <header className="mb-20">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-white/40 hover:text-accent transition-colors mb-12 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> TERMINATE_ACCESS_LAYER
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div>
                        <h1 className="text-6xl lg:text-8xl font-display font-black text-white tracking-tighter uppercase leading-[0.85] mb-6">
                            Identity <br /><span className="text-accent">Protocol</span>
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                            <ShieldCheck size={18} className="text-accent" />
                            Security Clearance: <span className="text-white">{profile?.role}</span>
                        </div>
                    </div>
                    {!editMode ? (
                        <button 
                            onClick={() => setEditMode(true)}
                            className="btn-sky !py-5 !px-12 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4"
                        >
                            <Edit3 size={18} /> RECONFIGURE_IDENTITY
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setEditMode(false)}
                                className="px-10 py-5 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all"
                            >
                                ABORT
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Stats & Security */}
                <div className="space-y-12">
                    {profile?.role !== 'Analyst' && (
                        <div className="glass-panel p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative z-10">
                                <div className="p-6 bg-accent/10 rounded-3xl text-accent border border-accent/20 w-fit mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <Wallet size={32} />
                                </div>
                                <span className="text-xs text-white/30 font-bold uppercase tracking-[0.3em] mb-4 block">Asset Liquidity</span>
                                <h2 className="text-5xl font-display font-medium text-white tracking-tighter uppercase mb-2">
                                    ${wallet?.balance?.toLocaleString() || '0.00'}
                                </h2>
                                <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent/60">Status: {wallet?.status || 'Active'}</div>
                            </div>
                        </div>
                    )}

                    <div className="glass-panel p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative z-10">
                            <div className="p-6 bg-accent/10 rounded-3xl text-accent border border-accent/20 w-fit mb-8">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-2xl font-display font-medium text-white tracking-tighter uppercase mb-4">Neural Integrity</h3>
                            <p className="text-xs text-white/40 leading-relaxed uppercase font-bold tracking-[0.1em]">
                                Multi-factor authentication is active on this node. Your behavioral biometric pattern is being continuously analyzed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Information Form */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-12 md:p-16 rounded-[4rem] border-white/5 relative">
                        <form onSubmit={handleUpdate} className="space-y-12 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-3">
                                        <User size={14} className="text-accent/60" /> Username
                                    </label>
                                    <input 
                                        type="text" 
                                        disabled={!editMode}
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-white outline-none focus:border-accent/30 disabled:opacity-50 transition-all font-bold uppercase tracking-widest text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-3">
                                        <Mail size={14} className="text-accent/60" /> Email Node
                                    </label>
                                    <input 
                                        type="email" 
                                        disabled={true}
                                        value={profile?.email}
                                        className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-white/30 outline-none disabled:cursor-not-allowed font-bold uppercase tracking-widest text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-3">
                                        <Phone size={14} className="text-accent/60" /> Comms Link
                                    </label>
                                    <input 
                                        type="text" 
                                        disabled={!editMode}
                                        placeholder="UNSET"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-white outline-none focus:border-accent/30 disabled:opacity-50 transition-all font-bold uppercase tracking-widest text-sm placeholder:text-white/10"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-3">
                                        <Lock size={14} className="text-accent/60" /> Encryption Key
                                    </label>
                                    <input 
                                        type="password" 
                                        disabled={!editMode}
                                        placeholder={editMode ? "••••••••" : "PROTECTED"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-white outline-none focus:border-accent/30 disabled:opacity-50 transition-all font-bold uppercase tracking-widest text-sm placeholder:text-white/10"
                                    />
                                </div>
                            </div>

                            {editMode && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    type="submit"
                                    disabled={updating}
                                    className="w-full btn-sky !py-6 text-sm font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 mt-8"
                                >
                                    {updating ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> COMMIT_RECONFIGURATION</>}
                                </motion.button>
                            )}
                        </form>

                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <Activity size={300} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
