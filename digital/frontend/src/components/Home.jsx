import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
    Shield, ArrowRight, Zap,
    Cpu, Activity, Database,
    ChevronLeft, ChevronRight,
    Globe, Lock, Terminal
} from 'lucide-react';
import { Link } from 'react-router-dom';

import MagicRings from './MagicRings/MagicRings';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const parallaxRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: parallaxRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    const slides = [
        {
            image: "/images/hero_ai_security_1777694601184.png",
            title: "Securing Global Digital Assets",
            subtitle: "Advanced AI-driven fraud detection for the next era of high-frequency commerce.",
            accent: "from-accent to-accent-secondary",
            hex: "#0ea5e9",
            hexTwo: "#38bdf8"
        },
        {
            image: "/images/global_network_1777694621537.png",
            title: "Distributed Neural Network",
            subtitle: "Zero-latency protection powered by edge computing and real-time intelligence.",
            accent: "from-accent-secondary to-accent-tertiary",
            hex: "#22d3ee",
            hexTwo: "#06b6d4"
        },
        {
            image: "/images/security_dashboard_visual_1777694640731.png",
            title: "Unmatched Command & Control",
            subtitle: "Deep-dive forensics and predictive risk assessments at your fingertips.",
            accent: "from-accent-tertiary to-accent",
            hex: "#818cf8",
            hexTwo: "#6366f1"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="bg-background min-h-screen text-foreground">
            {/* Hero Carousel */}
            <section className="relative h-screen w-full overflow-hidden">
                {/* Fixed MagicRings Background that stays while slides change */}
                <div className="absolute inset-0 z-0">
                    <MagicRings 
                        color={slides[currentSlide].hex}
                        colorTwo={slides[currentSlide].hexTwo}
                        ringCount={8}
                        speed={1.2}
                        attenuation={15}
                        lineThickness={1.5}
                        baseRadius={0.3}
                        radiusStep={0.08}
                        scaleRate={0.05}
                        opacity={0.8}
                        followMouse={true}
                        mouseInfluence={0.15}
                        hoverScale={1.1}
                        parallax={0.04}
                        clickBurst={true}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                        className="absolute inset-0 z-10"
                    >
                        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-radial-at-center from-transparent to-background/40" />

                        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center pt-20">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="max-w-5xl"
                            >
                                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-10">
                                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                    PROTOCOL_ACTIVATION: v4.2.0
                                </div>
                                <h1 className="text-7xl md:text-[6rem] font-['Syne'] font-extrabold leading-[0.85] mb-12 tracking-tighter uppercase">
                                    {slides[currentSlide].title.split(' ').slice(0, -2).join(' ')} <br />
                                    <span className="text-accent">
                                        {slides[currentSlide].title.split(' ').slice(-2).join(' ')}
                                    </span>
                                </h1>
                                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-16 leading-loose max-w-3xl mx-auto">
                                    {slides[currentSlide].subtitle}
                                </p>
                                <div className="flex p-10 flex-col sm:flex-row gap-8 justify-center">
                                    <Link to="/register" className="btn-sky border border-accent/20 rounded-xl !px-16 !py-6 text-sm shadow-2xl shadow-accent/20">
                                        Deploy Protection
                                        <ArrowRight size={18} />
                                    </Link>
                                    <button className="btn-secondary border  !px-16 !py-6 text-sm">
                                        System Overview
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1 transition-all duration-700 rounded-full ${currentSlide === idx ? 'w-24 bg-accent' : 'w-6 bg-white/20 hover:bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Feature Grid - Reordered to be before Parallax */}
            <section className="py-56  max-w-7xl mx-auto px-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center mb-32 relative z-10">
                    <div>
                        <div className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-8">System_Capabilities</div>
                        <h2 className="text-6xl md:text-8xl font-display font-black mb-10 leading-[0.95] uppercase tracking-tighter">
                            Engineered for <br /><span className="text-white/20">Zero Trust</span>
                        </h2>
                        <p className="text-white/40 text-lg mb-14 leading-relaxed font-medium max-w-xl">
                            We don't just detect fraud; we predict and neutralize it. Our distributed intelligence network maps global risk patterns in real-time.
                        </p>
                        <div className="flex flex-col gap-8">
                            <FeatureItem icon={<Globe size={20} />} title="Global Coverage" text="Protecting assets across 190+ jurisdictions simultaneously." />
                            <FeatureItem icon={<Lock size={20} />} title="Encrypted Ledger" text="Distributed threat database updated instantly on every node." />
                            <FeatureItem icon={<Terminal size={20} />} title="Developer API" text="Seamless integration with modern financial stacks." />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <FeatureCard
                            icon={<Cpu className="text-accent" size={36} />}
                            title="Neural Core"
                            desc="Deep learning models specialized in anomaly detection."
                        />
                        <FeatureCard
                            icon={<Activity className="text-accent" size={36} />}
                            title="Live Pulse"
                            desc="Real-time transaction telemetry with sub-8ms latency."
                        />
                        <div className="sm:col-span-2">
                            <div className="glass-panel p-14 rounded-[4rem] border-accent/20 bg-accent/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="relative z-10">
                                    <div className="text-6xl md:text-8xl font-display font-black text-accent mb-4 tracking-tighter uppercase">99.99%</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Network Efficiency Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Parallax Moving Image Section - Enhanced Animation */}
            <section ref={parallaxRef} className="relative   h-[100vh] w-full overflow-hidden bg-black flex items-center justify-center">
                <motion.div
                    style={{ y, scale }}
                    className="absolute inset-0  z-0"
                >
                    <img
                        src="/images/sky_blue_security_parallax_1777701767992.png"
                        alt="Security Network Parallax"
                        className="w-full h-[140%] object-cover opacity-40 brightness-50"
                    />
                </motion.div>

                {/* Advanced Animation Layers */}
                <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background z-10" />
                <div className="absolute inset-0 bg-radial-at-center from-transparent to-black/80 z-10" />

                {/* Scanning Effect */}
                <motion.div
                    animate={{ top: ['-100%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-accent/30 shadow-[0_0_20px_rgba(14,165,233,0.5)] z-20 pointer-events-none"
                />

                <div className="relative z-20 mt-36 max-w-6xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <div className="inline-block p-4 bg-accent/10 rounded-2xl border border-accent/20 mb-10 animate-pulse">
                            <Shield className="text-accent" size={40} />
                        </div>
                        <h2 className="text-6xl md:text-[9rem] font-['Syncopate'] font-bold mb-12 tracking-[-0.05em] uppercase leading-[0.8] text-white">
                            Total <span className="text-accent">Network</span> <br />
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-white/20"
                            >
                                Immune
                            </motion.span> System
                        </h2>
                        <p className="text-sm md:text-base text-white/40 max-w-2xl mx-auto font-black uppercase tracking-[0.5em] leading-loose">
                            Our autonomous security layer reacts to threats in sub-millisecond cycles, ensuring your digital infrastructure remains impenetrable.
                        </p>

                        {/* Decorative Elements */}
                        <div className="mt-20 flex justify-center gap-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-[1px] bg-accent/30" />
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest">Latency_0.02ms</span>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-[1px] bg-accent/30" />
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest">Protection_Global</span>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-[1px] bg-accent/30" />
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest">Protocol_Secure</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-56 px-6">

            </section>
        </div>
    );
};

const FeatureItem = ({ icon, title, text }) => (
    <div className="flex gap-4 items-start">
        <div className="p-3 bg-white/5 rounded-xl text-accent border border-white/5">
            {icon}
        </div>
        <div>
            <div className="text-sm font-bold uppercase tracking-widest text-white mb-1">{title}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="glass-card p-8 group border-white/5"
    >
        <div className="mb-6 p-4 bg-white/5 rounded-2xl inline-block group-hover:bg-accent/10 transition-all duration-500">
            {icon}
        </div>
        <h3 className="text-lg font-display font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium opacity-70">{desc}</p>
    </motion.div>
);

export default Home;