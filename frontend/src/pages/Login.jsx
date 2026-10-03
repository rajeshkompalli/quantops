import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Loader2, LineChart, ShieldCheck, Boxes, Sparkles } from 'lucide-react';

const capabilities = [
    { icon: LineChart, text: 'Multi-strategy backtesting with real performance metrics' },
    { icon: ShieldCheck, text: 'Risk-aware execution before any trade is placed' },
    { icon: Boxes, text: 'Modular strategies — trend, mean-reversion, and ensembles' },
    { icon: Sparkles, text: 'AI-assisted research, never AI-driven execution' },
];

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleContinue = (delay) => {
        setLoading(true);
        setTimeout(() => navigate('/dashboard'), delay);
    };

    return (
        <div className="min-h-screen flex bg-slate-950">
            {/* Left: brand panel */}
            <div className="hidden lg:flex w-1/2 items-center justify-center p-12">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="max-w-md"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-emerald-400" size={40} />
                        <h1 className="text-4xl font-semibold tracking-tight">
                            <span className="text-white">Quant</span>
                            <span className="text-emerald-400">Ops</span>
                        </h1>
                    </div>
                    <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                        Research-driven strategies. Real engineering discipline.
                    </p>

                    <div className="flex flex-col gap-5">
                        {capabilities.map(({ icon: Icon, text }, i) => (
                            <motion.div
                                key={text}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                                className="flex items-start gap-3"
                            >
                                <div className="bg-emerald-500/10 rounded-lg p-2 mt-0.5">
                                    <Icon className="text-emerald-400" size={18} />
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed pt-1.5">{text}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right: login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <Activity className="text-emerald-400" size={24} />
                        <span className="text-xl font-semibold tracking-tight">
                            <span className="text-white">Quant</span>
                            <span className="text-emerald-400">Ops</span>
                        </span>
                    </div>

                    <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
                    <p className="text-sm text-slate-500 mb-6">Log in to access your research workspace.</p>

                    <form onSubmit={(e) => { e.preventDefault(); handleContinue(900); }} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                disabled={loading}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                disabled={loading}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-slate-950 font-semibold rounded-lg py-2 mt-2 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (<><Loader2 className="animate-spin" size={18} />Logging in...</>) : 'Log In'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="h-px bg-slate-800 flex-1" />
                        <span className="text-xs text-slate-600">OR</span>
                        <div className="h-px bg-slate-800 flex-1" />
                    </div>

                    <button
                        onClick={() => handleContinue(700)}
                        disabled={loading}
                        className="w-full border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-slate-300 font-medium rounded-lg py-2 transition-colors"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;