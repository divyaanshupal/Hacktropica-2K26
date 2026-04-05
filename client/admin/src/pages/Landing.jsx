import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Target, Users, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <Link to="/signin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                        <Users size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Login as Employee</span>
                    </Link>
                </div>
                
                <div className="flex items-center gap-6">
                    <Link to="/admin" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        Login as Project Manager
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
                {/* Background Glow */}
                <div className="absolute top-0 -z-10 w-full h-full pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full" />
                </div>

                <motion.div 
                    className="text-center flex flex-col items-center gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                         Fleet Intelligence at scale
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-white to-zinc-500 max-w-4xl leading-[1.1]">
                        Orchestrate Your Fleet with Precision.
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
                        ProductFlow is the central nervous system for modern engineering teams. 
                        Live telemetry, autonomous task dispatching, and predictive workload management.
                    </p>
                    
                    <div className="flex gap-4 mt-8">
                        <Link to="/admin" className="px-8 py-4 bg-white text-black rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors group">
                            Explore Mission Control <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 w-full"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {[
                        { 
                            icon: Zap, 
                            title: "Instant Dispatch", 
                            description: "AI-driven task routing that matches issues to expertise in milliseconds." 
                        },
                        { 
                            icon: Shield, 
                            title: "Mission History", 
                            description: "Complete lineage of every resolved incident and historical performance metrics." 
                        },
                        { 
                            icon: Layout, 
                            title: "Fleet Control", 
                            description: "Real-time visibility into every agent's live state, capacity, and current focus." 
                        }
                    ].map((feature, i) => (
                        <div key={i} className="group p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Info Block */}
                <div className="mt-40 grid grid-cols-1 md:grid-cols-2 gap-20 items-center w-full shadow-inner bg-zinc-900/20 rounded-[40px] p-12 border border-zinc-900">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-6">Designed for Teams that Move Fast.</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="p-1 h-fit rounded-full bg-blue-500/20 text-blue-500 mt-1">
                                    <Target size={14} />
                                </div>
                                <p className="text-zinc-400 font-medium">Zero latency communication between project goals and engineer execution.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-1 h-fit rounded-full bg-blue-500/20 text-blue-500 mt-1">
                                    <Target size={14} />
                                </div>
                                <p className="text-zinc-400 font-medium">Automated workload balancing based on real-time stress scores.</p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="aspect-4/3 rounded-[32px] bg-linear-to-br from-blue-600/20 to-zinc-900 border border-blue-500/20 shadow-2xl relative overflow-hidden flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Layout className="w-32 h-32 text-blue-500/20 absolute -top-10 -right-10" />
                        <div className="p-8 text-center flex flex-col items-center">
                            <div className="text-[10px] font-mono text-blue-500 mb-6 uppercase tracking-widest border border-blue-500/30 px-3 py-1 rounded-full">// Fleet Status</div>
                            <div className="text-5xl font-black text-white uppercase tracking-tighter mb-2">OPERATIONAL</div>
                            <div className="w-48 h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                                <div className="w-3/4 h-full bg-blue-500 animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Footer */}
                <footer className="mt-60 w-full border-t border-zinc-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-zinc-600 text-sm font-medium uppercase tracking-[0.2em]">© 2026 ProductFlow // CORTEX CORE</div>
                    <div className="flex gap-12">
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Twitter</a>
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">GitHub</a>
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Docs</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}
