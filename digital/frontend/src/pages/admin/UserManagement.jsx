import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, Eye, CheckCircle, XCircle, Shield, Mail, Calendar, User, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/digital/admin/users');
            setUsersList(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.message || err.message || "Failed to load users list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (userId, newRole, isApproved, actionName) => {
        try {
            await api.put(`/digital/admin/users/${userId}/role`, { role: newRole, isApproved });
            toast.success(`User ${actionName} successfully`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const filteredUsers = usersList.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && usersList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <RefreshCw className="text-accent animate-spin" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Syncing Intelligence Nodes...</p>
            </div>
        );
    }

    return (
        <div className="flex  flex-col gap-8">
            <section className="glass-panel  p-10 rounded-[2.5rem] border-white/5 relative group">
                <div className="absolute  inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                    <div>
                        <h3 className="text-3xl font-display font-medium text-white tracking-tight uppercase">Intelligence Node Directory</h3>
                        <p className="text-xs text-white/60 uppercase tracking-widest mt-1 font-bold">Manage and authorize forensic personnel</p>
                    </div>
                    <div className="relative  w-full md:w-80">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="SEARCH_NODES..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-accent/30 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-white/[0.06]">
                                <th className="text-left p-6 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10 rounded-tl-2xl">Identity</th>
                                <th className="text-left p-6 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10">Role</th>
                                <th className="text-left p-6 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10">KYC Status</th>
                                <th className="text-left p-6 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10">Node Activity</th>
                                <th className="text-right p-6 text-white/60 text-xs font-bold uppercase tracking-widest border-b border-white/10 rounded-tr-2xl">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-10">
                                            <Users size={64} className="mb-6 text-white" />
                                            <p className="text-[10px] font-medium uppercase tracking-widest">No matching nodes found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-white/[0.03] transition-all duration-300 group/row">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-accent font-bold text-sm uppercase group-hover/row:scale-110 transition-transform duration-500">
                                                    {u.username.substring(0, 2)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-base uppercase tracking-tight">{u.username}</span>
                                                    <span className="text-xs text-white/50 font-bold uppercase tracking-widest">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md border ${u.role === 'Admin' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    u.role === 'Analyst' ? 'bg-accent/10 text-accent border-accent/20' :
                                                        'bg-white/10 text-white/60 border-white/20'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full border ${u.kycStatus === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {u.kycStatus || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-white/60 text-xs font-bold uppercase tracking-widest">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setSelectedUser(u)}
                                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {u.role === 'Analyst' && !u.isApproved && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleAction(u._id, 'Analyst', true, 'Approved')}
                                                            className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white text-xs font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20 transition-all flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={14} /> APPROVE
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(u._id, 'Viewer', true, 'Rejected')}
                                                            className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-bold uppercase tracking-widest rounded-lg border border-rose-500/20 transition-all flex items-center gap-2"
                                                        >
                                                            <XCircle size={14} /> REJECT
                                                        </button>
                                                    </div>
                                                )}

                                                {u.role === 'Analyst' && u.isApproved && (
                                                    <button
                                                        onClick={() => handleAction(u._id, 'Viewer', true, 'Revoked')}
                                                        className="px-5 py-2.5 bg-white/10 hover:bg-rose-500 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest rounded-lg border border-white/20 transition-all"
                                                    >
                                                        REVOKE_ACCESS
                                                    </button>
                                                )}

                                                {u.role !== 'Analyst' && u.role !== 'Admin' && (
                                                    <span className="text-xs text-white/10 uppercase tracking-widest italic">Standard User</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUser && (
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
                            className="w-full max-w-lg bg-card border mt-20 border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl"
                        >
                            <div className="flex justify-between   items-start mb-8">
                                <div className="flex items-center  gap-5">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xl font-bold">
                                        {selectedUser.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Node_Profile</h4>
                                        <h2 className="text-3xl font-display font-medium text-white uppercase tracking-tight">{selectedUser.username}</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-4 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                                >
                                    <RefreshCw size={24} className="rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-8 mb-12">
                                <DetailItem icon={<Mail size={18} />} label="Communications" value={selectedUser.email} />
                                <DetailItem icon={<Shield size={18} />} label="Security Clearance" value={selectedUser.role} />
                                <DetailItem icon={<Calendar size={18} />} label="Activation Date" value={new Date(selectedUser.createdAt).toLocaleString()} />
                                <DetailItem icon={<User size={18} />} label="Identity Status" value={selectedUser.kycStatus || 'UNVERIFIED'} color={selectedUser.kycStatus === 'Verified' ? 'text-emerald-500' : 'text-amber-500'} />
                            </div>

                            <div className="p-8 bg-white/[0.08] border border-white/10 rounded-3xl mb-10">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">System metadata</h5>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-white/40 block font-bold uppercase mb-2">Node ID</span>
                                        <span className="text-white/80 font-mono tracking-tighter uppercase break-all">{selectedUser._id}</span>
                                    </div>
                                    <div>
                                        <span className="text-white/40 block font-bold uppercase mb-2">Network Role</span>
                                        <span className="text-accent uppercase tracking-widest font-bold">{selectedUser.role}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.3em] transition-all border border-white/10"
                            >
                                CLOSE_INSPECTION
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DetailItem = ({ icon, label, value, color = 'text-white/80' }) => (
    <div className="flex items-center gap-5">
        <div className="text-accent/70">{icon}</div>
        <div>
            <span className="text-[8px] text-white/50 uppercase tracking-[0.2em] block mb-0.5">{label}</span>
            <span className={`text-sm font-bold tracking-tight uppercase ${color}`}>{value}</span>
        </div>
    </div>
);

export default UserManagement;
