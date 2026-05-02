import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, ChevronRight, LogOut, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-background/80 backdrop-blur-2xl border-b border-white/5' : 'py-6 bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-2.5 bg-accent/10 rounded-xl group-hover:scale-110 transition-transform duration-500">
                        <Shield className="text-accent w-6 h-6" />
                    </div>
                    <span className="text-xl font-display font-black tracking-tighter text-white uppercase">
                        FRAUD<span className="text-accent">GUARD</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-12">
                    <NavLink to="/" active={location.pathname === '/'}>Platform</NavLink>
                    <NavLink to="#features">Intelligence</NavLink>
                    <NavLink to="#">Global Network</NavLink>
                    <NavLink to="#">Enterprise</NavLink>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    {user ? (
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/5">
                                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                    <User size={14} />
                                </div>
                                <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">{user.username}</span>
                            </div>
                            <button onClick={handleLogout} className="text-muted-foreground hover:text-white transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link to="/login" className="text-[9px] font-black uppercase tracking-[0.3em] hover:text-accent transition-colors">SIGN_IN</Link>
                            <Link to="/register" className="btn-sky !py-2.5 !px-6">Get Started</Link>
                        </div>
                    )}
                </div>

                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-full left-0 w-full bg-card border-b border-white/5 overflow-hidden md:hidden"
                    >
                        <div className="p-8 flex flex-col gap-6">
                            <MobileLink to="/" onClick={() => setIsOpen(false)}>Platform</MobileLink>
                            <MobileLink to="#features" onClick={() => setIsOpen(false)}>Intelligence</MobileLink>
                            <MobileLink to="#" onClick={() => setIsOpen(false)}>Global Network</MobileLink>
                            {user ? (
                                <button onClick={handleLogout} className="btn-secondary w-full">Logout</button>
                            ) : (
                                <div className="flex flex-col gap-4 mt-4">
                                    <Link to="/login" className="text-center text-xs font-bold uppercase tracking-widest py-4 bg-white/5 rounded-xl" onClick={() => setIsOpen(false)}>Sign In</Link>
                                    <Link to="/register" className="btn-sky w-full" onClick={() => setIsOpen(false)}>Get Started</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const NavLink = ({ to, children, active }) => (
    <Link to={to} className={`text-[9px] font-black tracking-[0.4em] uppercase transition-all hover:text-accent relative group ${active ? 'text-accent' : 'text-white/40'
        }`}>
        {children}
        <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-500 group-hover:w-full ${active ? 'w-full' : ''}`} />
    </Link>
);

const MobileLink = ({ to, children, onClick }) => (
    <Link to={to} className="text-2xl font-display font-black text-white uppercase tracking-tighter" onClick={onClick}>
        {children}
    </Link>
);

export default Navbar;
