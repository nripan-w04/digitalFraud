import React from 'react';
import { Shield, Mail, Globe, Code, Share2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const GithubIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);

const TwitterIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const Footer = () => {
    return (
        <footer className="bg-background border-t border-white/5 pt-32 pb-16 relative overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-10 group">
                            <div className="p-2.5 bg-accent/10 rounded-xl">
                                <Shield className="text-accent w-6 h-6" />
                            </div>
                            <span className="text-xl font-display font-bold tracking-tighter uppercase">
                                FRAUD<span className="text-accent">GUARD</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-xs leading-relaxed mb-10 font-medium uppercase tracking-wider">
                            Next-generation autonomous security layer for global digital infrastructure.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<TwitterIcon size={16} />} />
                            <SocialIcon icon={<GithubIcon size={16} />} />
                            <SocialIcon icon={<LinkedinIcon size={16} />} />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-display font-bold text-xs uppercase tracking-[0.2em] mb-12">Architecture</h4>
                        <ul className="space-y-5">
                            <FooterLink label="Neural Core" />
                            <FooterLink label="Edge Protection" />
                            <FooterLink label="Risk Protocols" />
                            <FooterLink label="Threat Registry" />
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-display font-bold text-xs uppercase tracking-[0.2em] mb-12">Company</h4>
                        <ul className="space-y-5">
                            <FooterLink label="Security Ops" />
                            <FooterLink label="Intelligence" />
                            <FooterLink label="Whitepapers" />
                            <FooterLink label="Audit Logs" />
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-display font-bold text-xs uppercase tracking-[0.2em] mb-12">Connectivity</h4>
                        <p className="text-xs text-white/40 mb-6 font-bold uppercase tracking-[0.2em]">Join the network</p>
                        <div className="flex gap-2">
                            <input 
                                type="email" 
                                placeholder="ACCESS_NODE@ENTERPRISE.IO" 
                                className="bg-white/5 border border-white/5 rounded-full px-6 py-4 text-xs w-full outline-none focus:border-accent/50 transition-all font-bold placeholder:opacity-30" 
                            />
                            <button className="bg-accent p-4 rounded-full hover:bg-sky-400 transition-all text-black">
                                <Mail size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-white/20 font-bold uppercase tracking-[0.2em]">
                    <p>© 2026 FRAUDGUARD SYSTEMS. [V4.2.0-STABLE]</p>
                    <div className="flex gap-10 items-center">
                        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Globe size={14} /> GLOBAL_EN_US</span>
                        <div className="w-[1px] h-4 bg-white/10" />
                        <span className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                            STATUS: <span className="text-accent">SYNCHRONIZED</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ label }) => (
    <li>
        <Link to="#" className="text-xs font-bold text-white/40 hover:text-white transition-all uppercase tracking-[0.2em]">
            {label}
        </Link>
    </li>
);

const SocialIcon = ({ icon }) => (
    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-accent hover:text-black transition-all">
        {icon}
    </a>
);

export default Footer;
