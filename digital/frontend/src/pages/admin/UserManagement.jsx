import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/digital/admin/users');
                setUsersList(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.response?.data?.message || err.message || "Failed to load users list.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/digital/admin/users/${userId}/role`, { role: newRole });
            // Update local state
            setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success("Role updated successfully!");
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update role.");
        }
    };

    if (loading) {
        return <p className="text-text-secondary">Loading users...</p>;
    }

    if (error) {
        return (
            <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger">
                {error}
            </div>
        );
    }

    return (
        <section className="glass-panel p-12 rounded-[3.5rem] border-white/5 overflow-hidden relative group">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
                <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Intelligence Node Directory</h3>
                <div className="text-[10px] text-accent font-black uppercase tracking-[0.3em] bg-accent/10 px-8 py-3 rounded-full border border-accent/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                    ACTIVE_NODES: {usersList.length}
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar relative z-10">
                <table className="w-full border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-white/[0.03]">
                            <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5 rounded-tl-[2rem]">Identity</th>
                            <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">Communications</th>
                            <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">Protocol</th>
                            <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">Clearance</th>
                            <th className="text-left p-6 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5 rounded-tr-[2rem]">Activation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {usersList.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-32 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-10">
                                        <Users size={80} className="mb-8" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">No intelligence nodes detected</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            usersList.map(u => (
                                <tr key={u._id} className="hover:bg-white/[0.04] transition-all duration-500 group/row">
                                    <td className="p-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-accent font-black text-xs uppercase group-hover/row:scale-110 transition-transform duration-500">
                                                {u.username.substring(0, 2)}
                                            </div>
                                            <span className="font-black text-white text-base uppercase tracking-tight">{u.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-[11px] text-white/40 font-black uppercase tracking-widest">{u.email}</td>
                                    <td className="p-6">
                                        <div className="relative inline-block w-full max-w-[140px]">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 text-accent text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl outline-none focus:border-accent transition-all cursor-pointer appearance-none"
                                            >
                                                <option value="Viewer">Viewer</option>
                                                <option value="Analyst">Analyst</option>
                                                <option value="Admin">Admin</option>
                                                <option value="User">User</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-accent/50 w-2 h-2 border-r-2 border-b-2 border-current rotate-45" />
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-5 py-2 text-[8px] font-black uppercase tracking-[0.3em] rounded-full border ${u.kycStatus === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                                            }`}>
                                            {u.kycStatus || 'PROCESSING'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default UserManagement;
