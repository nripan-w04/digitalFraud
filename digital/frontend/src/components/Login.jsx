import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Loader2, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/digital/login', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));


            if (data.user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
            console.error('Login failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute border border-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className=" w-full border border-4 border-white/20  max-w-[550px] p-10 md:p-16 rounded-xl relative z-10  shadow-2xl"
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex p-5 bg-accent/10 rounded-xl mb-8 border border-accent/20">
                        <LogIn className="text-accent" size={32} />
                    </div>
                    <h2 className="text-4xl font-display font-medium mb-3 tracking-tighter uppercase">Sign In</h2>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Security Protocol Authorization</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                    >
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                            <Mail size={14} className="text-accent/60" /> Email Address
                        </label>
                        <input
                            type="email"
                            className="input-field !rounded-md"
                            placeholder="name@company.com"
                            required
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3"
                    >
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                            <Lock size={14} className="text-accent/60" /> Password
                        </label>
                        <input
                            type="password"
                            className="input-field !rounded-md"
                            placeholder="Enter your password"
                            required
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-end"
                    >
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        type="submit"
                        className="btn-sky w-full !py-5 text-sm font-bold mt-4 shadow-2xl shadow-accent/20 !rounded-md"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/20"
                >
                    Don't have an account?
                    <Link to="/register" className="text-accent hover:text-white transition-colors ml-2">Create Account</Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;