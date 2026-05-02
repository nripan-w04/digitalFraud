import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, ArrowRight, Loader2, Phone, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'Viewer'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/digital/register', formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
            console.error('Registration failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="border-4 border-white/20  w-full max-w-[550px] p-10 md:p-16 rounded-md relative z-10 border-white/5 shadow-2xl"
            >
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex p-5 bg-accent/10 rounded-xl mb-8 border border-accent/20">
                        <Shield className="text-accent" size={32} />
                    </div>
                    <h2 className="text-4xl font-display font-black mb-3 tracking-tighter uppercase">Create Account</h2>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Join the FraudGuard network</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-3"
                        >
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80  flex items-center gap-2">
                                <User size={12} /> Full Name
                            </label>
                            <input
                                type="text"
                                className="input-field !rounded-md"
                                placeholder="John Doe"
                                required
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-3"
                        >
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80  flex items-center gap-2">
                                <Mail size={12} /> Email Address
                            </label>
                            <input
                                type="email"
                                className="input-field !rounded-md"
                                placeholder="name@company.com"
                                required
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-3"
                        >
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80 flex items-center gap-2">
                                <Phone size={12} /> Phone Number
                            </label>
                            <input
                                type="tel"
                                className="input-field !rounded-md"
                                placeholder="+1 (555) 000-0000"
                                required
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-3"
                        >
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80  flex items-center gap-2">
                                <Briefcase size={12} /> Account Type
                            </label>
                            <select
                                className="input-field appearance-none cursor-pointer !rounded-md"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="Viewer" className="bg-card">Viewer</option>
                                <option value="User" className="bg-card">Business User</option>
                                <option value="Analyst" className="bg-card">Security Analyst</option>
                            </select>
                        </motion.div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-3"
                    >
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80   flex items-center gap-2">
                            <Lock size={12} /> Password
                        </label>
                        <input
                            type="password"
                            className="input-field !rounded-md"
                            placeholder="Create a password"
                            required
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        type="submit"
                        className="btn-sky w-full !py-5 text-sm font-bold mt-4 shadow-2xl shadow-accent/20 !rounded-md"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Create Account <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-12 text-center text-[9px] font-black uppercase tracking-[0.4em] text-white/20"
                >
                    Already have an account?
                    <Link to="/login" className="text-accent hover:text-white transition-colors ml-2">Sign In</Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;