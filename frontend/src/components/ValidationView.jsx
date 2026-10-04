import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Microscope } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AVAILABLE_STRATEGIES = [
    { id: 'moving_average', label: 'Moving Average Crossover' },
    { id: 'rsi', label: 'RSI' },
    { id: 'bollinger_bands', label: 'Bollinger Bands' },
];

function formatPercent(value) {
    return value !== null && value !== undefined ? `${(value * 100).toFixed(1)}%` : 'N/A';
}

function buildChartData(periodResult) {
    return periodResult.dates.map((date, i) => ({
        date,
        strategy: periodResult.equity_curve[i],
        buyHold: periodResult.buy_hold_curve[i],
    }));
}

function PeriodSummary({ label, periodResult }) {
    const gap = periodResult.strategy.cagr - periodResult.buy_and_hold.cagr;
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{label}</h4>
            <div className="flex justify-between text-sm py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Strategy CAGR</span>
                <span className="text-slate-200 font-medium">{formatPercent(periodResult.strategy.cagr)}</span>
            </div>
            <div className="flex justify-between text-sm py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Buy & Hold CAGR</span>
                <span className="text-slate-200 font-medium">{formatPercent(periodResult.buy_and_hold.cagr)}</span>
            </div>
            <div className="flex justify-between text-sm py-1.5">
                <span className="text-slate-500">Gap</span>
                <span className={`font-medium ${gap >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {gap >= 0 ? '+' : ''}{(gap * 100).toFixed(1)} pts
                </span>
            </div>
        </div>
    );
}

function EquityChart({ title, periodResult }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">{title}</h4>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={buildChartData(periodResult)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(d) => d.slice(0, 7)} minTickGap={50} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={(value) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="strategy" name="Strategy" stroke="#34d399" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="buyHold" name="Buy & Hold" stroke="#64748b" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function ValidationView() {
    const [symbol, setSymbol] = useState('AAPL');
    const [trainStart, setTrainStart] = useState('2021-01-01');
    const [trainEnd, setTrainEnd] = useState('2023-12-31');
    const [testStart, setTestStart] = useState('2024-01-01');
    const [testEnd, setTestEnd] = useState('2026-09-01');
    const [selectedStrategies, setSelectedStrategies] = useState(
        AVAILABLE_STRATEGIES.map((s) => s.id)
    );
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const toggleStrategy = (id) => {
        setSelectedStrategies((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const runValidation = async (e) => {
        e.preventDefault();

        if (selectedStrategies.length === 0) {
            setError('Select at least one strategy.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:8000/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol,
                    train_start: trainStart,
                    train_end: trainEnd,
                    test_start: testStart,
                    test_end: testEnd,
                    strategies: selectedStrategies,
                }),
            });

            if (!response.ok) throw new Error('Validation request failed');
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const gapTrain = result ? result.train.strategy.cagr - result.train.buy_and_hold.cagr : null;
    const gapTest = result ? result.test.strategy.cagr - result.test.buy_and_hold.cagr : null;
    const consistent = result && Math.sign(gapTrain) === Math.sign(gapTest);

    return (
        <div>
            <p className="text-sm text-slate-500 mb-6 max-w-2xl">
                Tune on one period, test on another the strategy has never seen. If a strategy's edge
                (or lack of one) holds steady across both, that's real evidence — not a lucky coincidence
                from testing on a single time window.
            </p>

            <form onSubmit={runValidation} className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Symbol</label>
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Train Start</label>
                            <input
                                type="date"
                                value={trainStart}
                                onChange={(e) => setTrainStart(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Train End</label>
                            <input
                                type="date"
                                value={trainEnd}
                                onChange={(e) => setTrainEnd(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>
                    <div></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Test Start</label>
                            <input
                                type="date"
                                value={testStart}
                                onChange={(e) => setTestStart(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Test End</label>
                            <input
                                type="date"
                                value={testEnd}
                                onChange={(e) => setTestEnd(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Strategies</label>
                    <div className="flex flex-wrap gap-3">
                        {AVAILABLE_STRATEGIES.map(({ id, label }) => (
                            <label
                                key={id}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${selectedStrategies.includes(id)
                                        ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedStrategies.includes(id)}
                                    onChange={() => toggleStrategy(id)}
                                    className="w-3.5 h-3.5 accent-emerald-500"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-slate-950 font-semibold rounded-lg px-5 py-2.5 transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Microscope size={18} />}
                    {loading ? 'Validating...' : 'Run Validation'}
                </button>
            </form>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
                    {error}
                </div>
            )}

            {result && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div
                        className={`rounded-lg px-4 py-3 text-sm mb-6 border ${consistent
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            }`}
                    >
                        {consistent
                            ? 'The performance gap vs. Buy & Hold held the same direction in both periods — a stable, non-overfit result.'
                            : 'The result flipped direction between periods — a sign this may be overfit to one specific window, not a durable pattern.'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <PeriodSummary label="Train Period" periodResult={result.train} />
                        <PeriodSummary label="Test Period (Held Out)" periodResult={result.test} />
                    </div>

                    <div className="flex flex-col gap-6">
                        <EquityChart title="Train Period" periodResult={result.train} />
                        <EquityChart title="Test Period (Held Out)" periodResult={result.test} />
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default ValidationView;