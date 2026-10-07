import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, DollarSign, TrendingUp, BarChart3, ShieldAlert, Sparkles,
    RefreshCw, Send, ScrollText, Search,
} from 'lucide-react';

const DEFAULT_WATCHLIST = 'AAPL,MSFT,NVDA,GOOGL,AMZN';

function getMarketStatus() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
    }).formatToParts(now);

    const get = (type) => parts.find((p) => p.type === type)?.value;
    const minutesIntoDay = Number(get('hour')) * 60 + Number(get('minute'));
    const isWeekday = !['Sat', 'Sun'].includes(get('weekday'));
    const open = isWeekday && minutesIntoDay >= 9 * 60 + 30 && minutesIntoDay < 16 * 60;

    const time = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
    }).format(now);

    return { open, time };
}

function Card({ children, className = '', glow = false }) {
    return (
        <div
            className={`rounded-2xl border bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-sm ${glow
                    ? 'border-emerald-500/25 shadow-[0_0_32px_-14px_rgba(52,211,153,0.45)]'
                    : 'border-slate-800/80'
                } ${className}`}
        >
            {children}
        </div>
    );
}

function PulseDot({ color = 'emerald', pulse = true }) {
    const dot = { emerald: 'bg-emerald-400', amber: 'bg-amber-400', slate: 'bg-slate-500' }[color];
    return (
        <span className="relative flex h-2 w-2">
            {pulse && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`} />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
        </span>
    );
}

function ComingSoon() {
    return (
        <span className="text-[10px] font-medium text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-full">
            Coming Soon
        </span>
    );
}

function SignalBadge({ signal }) {
    const styles = {
        BUY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        SELL: 'bg-red-500/10 text-red-400 border-red-500/30',
        HOLD: 'bg-slate-800 text-slate-500 border-slate-700',
    };
    return (
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[signal]}`}>
            {signal}
        </span>
    );
}

function KpiCard({ icon: Icon, label, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="bg-slate-800/60 rounded-lg p-2">
                        <Icon className="text-slate-500" size={16} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-2xl font-semibold font-mono tabular-nums text-slate-700 mb-3">—</p>
                <svg viewBox="0 0 100 20" className="w-full h-5" preserveAspectRatio="none" aria-hidden="true">
                    <line
                        x1="0" y1="10" x2="100" y2="10"
                        stroke="#334155" strokeWidth="1.5" strokeDasharray="3 4"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
                <p className="text-[10px] text-slate-700 mt-2">Available once paper trading is live</p>
            </Card>
        </motion.div>
    );
}

function Dashboard() {
    const [signals, setSignals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastScanned, setLastScanned] = useState(null);
    const [activeWatchlist, setActiveWatchlist] = useState(DEFAULT_WATCHLIST);
    const [watchlistInput, setWatchlistInput] = useState(DEFAULT_WATCHLIST.split(',').join(', '));
    const [market, setMarket] = useState(getMarketStatus());

    const runScan = useCallback(async (symbolList) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:8000/scan?symbols=${encodeURIComponent(symbolList)}`);
            if (!res.ok) throw new Error('Scan failed. Check that every symbol is valid.');
            const data = await res.json();
            setSignals(data.results);
            setLastScanned(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        runScan(DEFAULT_WATCHLIST);
    }, [runScan]);

    useEffect(() => {
        const timer = setInterval(() => setMarket(getMarketStatus()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleWatchlistSubmit = (e) => {
        e.preventDefault();
        const cleaned = watchlistInput
            .split(',')
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean)
            .join(',');
        if (!cleaned) return;
        setWatchlistInput(cleaned.split(',').join(', '));
        setActiveWatchlist(cleaned);
        runScan(cleaned);
    };

    const counts = signals
        ? signals.reduce(
            (acc, s) => {
                acc[s.combined_signal] += 1;
                return acc;
            },
            { BUY: 0, HOLD: 0, SELL: 0 }
        )
        : null;

    return (
        <div className="relative">
            <div className="pointer-events-none absolute -top-10 left-1/4 h-48 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

            {/* Header */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Your trading command center.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${market.open
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                : 'text-slate-400 bg-slate-800/60 border-slate-700'
                            }`}
                    >
                        <PulseDot color={market.open ? 'emerald' : 'slate'} pulse={market.open} />
                        {market.open ? 'Market Open' : 'Market Closed'} · {market.time} ET
                    </span>
                    <span className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
                        <PulseDot color="amber" />
                        Paper Trading
                    </span>
                </div>
            </div>

            {/* KPI strip */}
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard icon={Wallet} label="Equity" index={0} />
                <KpiCard icon={DollarSign} label="Cash" index={1} />
                <KpiCard icon={TrendingUp} label="Day P&L" index={2} />
                <KpiCard icon={BarChart3} label="Total P&L" index={3} />
            </div>

            <div className="relative grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <Card glow className="overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800/80">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-white">Today's Signals</h3>
                                    {signals && !error && <PulseDot />}
                                </div>
                                {counts && (
                                    <p className="text-xs mt-1 font-mono tabular-nums">
                                        <span className="text-emerald-400">{counts.BUY} BUY</span>
                                        <span className="text-slate-600"> · </span>
                                        <span className="text-slate-400">{counts.HOLD} HOLD</span>
                                        <span className="text-slate-600"> · </span>
                                        <span className="text-red-400">{counts.SELL} SELL</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <form onSubmit={handleWatchlistSubmit} className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input
                                            type="text"
                                            value={watchlistInput}
                                            onChange={(e) => setWatchlistInput(e.target.value)}
                                            placeholder="AAPL, MSFT, NVDA"
                                            className="bg-slate-950/60 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="text-xs font-medium bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 rounded-lg px-3 py-1.5 transition-colors"
                                    >
                                        Scan
                                    </button>
                                </form>
                                <button
                                    type="button"
                                    onClick={() => runScan(activeWatchlist)}
                                    disabled={loading}
                                    aria-label="Refresh signals"
                                    className="border border-slate-800 hover:bg-slate-800/60 disabled:opacity-60 text-slate-400 rounded-lg p-1.5 transition-colors"
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {error && <div className="text-sm text-red-400 px-6 py-8">{error}</div>}

                        {!error && !signals && loading && (
                            <div className="px-6 py-6 flex flex-col gap-3">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-9 rounded-lg bg-slate-800/40 animate-pulse" />
                                ))}
                            </div>
                        )}

                        {!error && signals && (
                            <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-50' : ''}`}>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800/80 text-xs text-slate-500">
                                            <th className="text-left font-medium px-6 py-3">Symbol</th>
                                            <th className="text-right font-medium px-6 py-3">Price</th>
                                            <th className="text-center font-medium px-6 py-3">MA Crossover</th>
                                            <th className="text-center font-medium px-6 py-3">RSI</th>
                                            <th className="text-center font-medium px-6 py-3">Bollinger</th>
                                            <th className="text-center font-medium px-6 py-3">Combined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {signals.map((s, i) => (
                                            <tr
                                                key={s.symbol}
                                                className={`border-b border-slate-800/60 last:border-0 ${i % 2 === 1 ? 'bg-slate-950/30' : ''}`}
                                            >
                                                <td className="px-6 py-3 font-semibold text-slate-200">{s.symbol}</td>
                                                <td className="px-6 py-3 text-right font-mono tabular-nums text-slate-300">
                                                    ${s.close.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3 text-center"><SignalBadge signal={s.votes.moving_average} /></td>
                                                <td className="px-6 py-3 text-center"><SignalBadge signal={s.votes.rsi} /></td>
                                                <td className="px-6 py-3 text-center"><SignalBadge signal={s.votes.bollinger_bands} /></td>
                                                <td className="px-6 py-3 text-center"><SignalBadge signal={s.combined_signal} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {lastScanned && !error && (
                            <div className="px-6 py-2.5 border-t border-slate-800/80 text-[11px] text-slate-600">
                                Last scanned {lastScanned.toLocaleTimeString()} · based on daily price bars
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-slate-800/60 rounded-lg p-2">
                                    <BarChart3 className="text-slate-500" size={16} />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-400">Portfolio Performance</h3>
                            </div>
                            <ComingSoon />
                        </div>
                        <div className="relative h-48">
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="border-t border-dashed border-slate-800/80" />
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-xs text-slate-600">
                                    Your equity curve will appear here once paper trading starts.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-slate-800/60 rounded-lg p-2">
                                    <ShieldAlert className="text-slate-500" size={16} />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-400">Risk &amp; Exposure</h3>
                            </div>
                            <ComingSoon />
                        </div>
                        <div className="flex flex-col items-center">
                            <svg viewBox="0 0 120 70" className="w-40" aria-hidden="true">
                                <path
                                    d="M 10 60 A 50 50 0 0 1 110 60"
                                    fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round"
                                />
                                <text x="60" y="56" textAnchor="middle" className="fill-slate-700" fontSize="14" fontFamily="monospace">
                                    —
                                </text>
                            </svg>
                            <p className="text-[11px] text-slate-600 text-center mt-2">
                                Exposure, position limits, and risk status will appear here.
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-slate-800/60 rounded-lg p-2">
                                    <Sparkles className="text-slate-500" size={16} />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-400">AI Insights</h3>
                            </div>
                            <ComingSoon />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                disabled
                                placeholder="Ask QuantOps why it made a call..."
                                className="w-full bg-slate-950/40 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-600 placeholder:text-slate-700 cursor-not-allowed"
                            />
                            <Send size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700" />
                        </div>
                        <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                            Plain-English explanations and market context. AI explains decisions, it never makes them.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-slate-800/60 rounded-lg p-2">
                                    <ScrollText className="text-slate-500" size={16} />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-400">Activity Feed</h3>
                            </div>
                            <ComingSoon />
                        </div>
                        <div className="flex flex-col gap-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded-full bg-slate-800/60" />
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <div className="h-2 w-3/4 rounded bg-slate-800/60" />
                                        <div className="h-2 w-1/2 rounded bg-slate-800/40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-4">
                            Every signal, risk check, and order will be logged here.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;