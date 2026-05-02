import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Users, Activity, AlertTriangle, 
  Settings, LogOut, Search, Bell, DollarSign, Menu, X, User
} from 'lucide-react';

const AdminLayout = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-black text-foreground font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-between px-8 border-b border-white/5">
                <div className="flex items-center gap-3 text-accent font-display font-black text-lg tracking-tighter uppercase">
                    <Shield size={24} />
                    <span>ADMIN</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-accent p-2">
                    {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-80 p-10 flex flex-col bg-black border-r border-white/5
                transition-transform duration-500 lg:translate-x-0 lg:sticky lg:top-0 h-screen overflow-y-auto
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Link to="/admin" className="relative z-10 flex items-center gap-4 text-2xl font-black text-white mb-16 font-display tracking-tighter no-underline hover:brightness-125 transition-all uppercase">
                    <div className="p-2.5 bg-accent/10 rounded-xl">
                        <Shield className="w-7 h-7 text-accent" />
                    </div>
                    <span>FRAUDGUARD</span>
                </Link>
                
                <nav className="flex flex-col gap-3 grow">
                    <NavItem to="/admin" icon={<Activity size={18} />} label="Operational Hub" end onClick={() => setIsSidebarOpen(false)} />
                    <NavItem to="/admin/users" icon={<Users size={18} />} label="Node Directory" onClick={() => setIsSidebarOpen(false)} />
                    <NavItem to="/admin/alerts" icon={<AlertTriangle size={18} />} label="Neural Threats" onClick={() => setIsSidebarOpen(false)} />
                    <NavItem to="/admin/transactions" icon={<DollarSign size={18} />} label="Telemetry" onClick={() => setIsSidebarOpen(false)} />
                </nav>

                <div className="pt-10 border-t border-white/5">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center gap-4 py-5 bg-white/5 text-rose-500 rounded-full border border-rose-500/20 cursor-pointer transition-all hover:bg-rose-500/10 font-bold text-[10px] uppercase tracking-[0.2em]"
                    >
                        <LogOut size={18} /> TERMINATE_SESSION
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Wrapper */}
            <main className="flex-1 p-8 lg:p-16 overflow-y-auto pt-28 lg:pt-16">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div className="relative w-full md:w-[450px]">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="SEARCH_INTELLIGENCE..." 
                            className="w-full bg-white/5 border border-white/5 rounded-full pl-14 pr-6 py-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-accent/30 transition-all placeholder:opacity-20"
                        />
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-10">
                        <div className="relative cursor-pointer text-white/40 hover:text-accent transition-colors">
                            <Bell size={24} />
                            <span className="absolute -top-1 -right-1 bg-accent text-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black font-black">04</span>
                        </div>
                        <div className="flex items-center gap-5 pl-10 border-l border-white/5">
                            <div className="text-right hidden sm:block">
                                <span className="block font-black text-sm font-display text-white uppercase tracking-tighter">{user?.username || 'ROOT_OPERATOR'}</span>
                                <span className="text-[9px] text-accent font-bold uppercase tracking-[0.3em]">System Architect</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                                <User size={24} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="animate-in fade-in zoom-in-95 duration-700">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, to, end, onClick }) => (
    <NavLink 
        to={to} 
        end={end}
        onClick={onClick}
        className={({ isActive }) => `flex items-center gap-5 px-6 py-4.5 rounded-2xl font-bold transition-all no-underline text-[10px] tracking-[0.2em] uppercase ${
            isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'text-white/40 hover:bg-white/5 hover:text-white'
        }`}
    >
        {icon} <span>{label}</span>
    </NavLink>
);

export default AdminLayout;
