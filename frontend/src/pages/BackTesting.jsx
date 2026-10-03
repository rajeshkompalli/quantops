import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Play, RotateCcw, Trophy, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AVAILABLE_STRATEGIES = [
    {
        id: 'moving_average',
        label: 'Moving Average Crossover',
        description: 'Trend-following: buys when a short-term average crosses above a long-term average, sells on the reverse crossover.',
    },
    {
        id: 'rsi',
        label: 'RSI (Relative Strength Index)',
        description: 'Mean-reversion: buys when momentum suggests the stock is oversold, sells when it looks overbought.',
    },
    {
        id: 'bollinger_bands',
        label: 'Bollinger Bands',
        description: 'Mean-reversion: buys when price drops unusually far below its recent average, sells as it reverts back toward normal.',
    },
];

const DEFAULT_SYMBOL = 'AAPL';
const DEFAULT_YEARS_BACK = 2;
const DEFAULT_AMOUNT = 10000;
const DEFAULT_STRATEGIES = AVAILABLE_STRATEGIES.map((s) => s.id);

function getStartDate(yearsBack) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - yearsBack);
    return d.toISOString().split('T')[0];
}

function formatPercent(value) {
    return value !== null && value !== undefined ? `${(value * 100).toFixed(1)}%` : 'N/A';
}

function formatCurrency(value) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function buildChartData(result) {
    return result.dates.map((date, i) => ({
        date,
        strategy: result.equity_curve[i],
        buyHold: result.buy_hold_curve[i],
    }));
}


function Backtesting() {
    const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
    const [yearsBack, setYearsBack] = useState(DEFAULT_YEARS_BACK);
    const [amount, setAmount] = useState(DEFAULT_AMOUNT);
    const [selectedStrategies, setSelectedStrategies] = useState(DEFAULT_STRATEGIES);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const toggleStrategy = (id) => {
        setSelectedStrategies((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handleReset = () => {
        setSymbol(DEFAULT_SYMBOL);
        setYearsBack(DEFAULT_YEARS_BACK);
        setAmount(DEFAULT_AMOUNT);
        setSelectedStrategies(DEFAULT_STRATEGIES);
        setResult(null);
        setError(null);
    };

    const runBacktest = async (e) => {
        e.preventDefault();

        if (selectedStrategies.length === 0) {
            setError('Select at least one strategy.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:8000/backtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol,
                    start_date: getStartDate(yearsBack),
                    starting_cash: amount,
                    strategies: selectedStrategies,
                }),
            });

            if (!response.ok) throw new Error('Backtest request failed');
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const strategyWon = result && result.strategy.final_value > result.buy_and_hold.final_value;

    const comparisonRows = result
        ? [
            {
                label: 'Final Value',
                strategy: formatCurrency(result.strategy.final_value),
                buyHold: formatCurrency(result.buy_and_hold.final_value),
                strategyBetter: result.strategy.final_value > result.buy_and_hold.final_value,
            },
            {
                label: 'CAGR',
                strategy: formatPercent(result.strategy.cagr),
                buyHold: formatPercent(result.buy_and_hold.cagr),
                strategyBetter: result.strategy.cagr > result.buy_and_hold.cagr,
            },
            {
                label: 'Sharpe Ratio',
                strategy: result.strategy.sharpe_ratio?.toFixed(2) ?? 'N/A',
                buyHold: result.buy_and_hold.sharpe_ratio?.toFixed(2) ?? 'N/A',
                strategyBetter: (result.strategy.sharpe_ratio ?? -Infinity) > (result.buy_and_hold.sharpe_ratio ?? -Infinity),
            },
            {
                label: 'Max Drawdown',
                strategy: formatPercent(result.strategy.max_drawdown),
                buyHold: formatPercent(result.buy_and_hold.max_drawdown),
                strategyBetter: result.strategy.max_drawdown > result.buy_and_hold.max_drawdown,
            },
        ]
        : [];

    return (
        <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Backtesting</h1>
            <p className="text-sm text-slate-500 mb-8 max-w-2xl">
                A backtest simulates how a trading strategy would have performed on real historical
                price data — no real money involved. It's compared against simply buying and holding
                the stock the whole time, the benchmark any active strategy needs to beat to justify
                its added complexity and risk.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* LEFT COLUMN */}
                <div className="lg:pr-8 lg:border-r lg:border-slate-800">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Configuration
                    </h2>

                    <form onSubmit={runBacktest}>
                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">
                                Market &amp; Time Horizon
                            </h3>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Symbol</label>
                                <input
                                    type="text"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                    placeholder="e.g. AAPL"
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-48"
                                />
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between mb-1.5">
                                    <label className="text-sm font-medium text-slate-400">Years of History</label>
                                    <span className="text-sm text-emerald-400 font-medium">
                                        {yearsBack} {yearsBack === 1 ? 'year' : 'years'}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={20}
                                    step={1}
                                    value={yearsBack}
                                    onChange={(e) => setYearsBack(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <label className="text-sm font-medium text-slate-400">Starting Capital</label>
                                    <span className="text-sm text-emerald-400 font-medium">{formatCurrency(amount)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={1000}
                                    max={10000}
                                    step={500}
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>
                        </section>

                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">
                                Strategies
                            </h3>
                            <div className="flex flex-col gap-3">
                                {AVAILABLE_STRATEGIES.map(({ id, label, description }) => (
                                    <label
                                        key={id}
                                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedStrategies.includes(id)
                                            ? 'border-emerald-500/40 bg-emerald-500/5'
                                            : 'border-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStrategies.includes(id)}
                                            onChange={() => toggleStrategy(id)}
                                            className="w-4 h-4 mt-0.5 accent-emerald-500"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{label}</p>
                                            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-slate-950 font-semibold rounded-lg py-3 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                                {loading ? 'Running...' : 'Run Backtest'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center gap-2 border border-slate-800 hover:bg-slate-900 text-slate-400 font-medium rounded-lg px-5 transition-colors"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN */}
                <div>
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Results
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className={`flex items-center gap-3 rounded-xl px-6 py-5 mb-6 border ${strategyWon
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-amber-500/10 border-amber-500/30'
                                    }`}
                            >
                                {strategyWon ? (
                                    <Trophy className="text-emerald-400 shrink-0" size={28} />
                                ) : (
                                    <TrendingDown className="text-amber-400 shrink-0" size={28} />
                                )}
                                <div>
                                    <p className={`text-xl font-semibold ${strategyWon ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {strategyWon ? 'Strategy Outperformed Buy & Hold' : 'Buy & Hold Won'}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-0.5">
                                        {symbol} · {yearsBack} {yearsBack === 1 ? 'year' : 'years'} · {formatCurrency(amount)} starting capital
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">
                                    Equity Curve
                                </h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={buildChartData(result)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickFormatter={(date) => date.slice(5)}
                                            minTickGap={40}
                                        />
                                        <YAxis
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                            labelStyle={{ color: '#94a3b8' }}
                                            formatter={(value) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`]}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '13px' }} />
                                        <Line type="monotone" dataKey="strategy" name="Strategy" stroke="#34d399" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="buyHold" name="Buy & Hold" stroke="#64748b" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-500">
                                            <th className="text-left font-medium px-6 py-3">Metric</th>
                                            <th className="text-right font-medium px-6 py-3">Strategy</th>
                                            <th className="text-right font-medium px-6 py-3">Buy &amp; Hold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonRows.map((row) => (
                                            <tr key={row.label} className="border-b border-slate-800 last:border-0">
                                                <td className="px-6 py-3 text-slate-500">{row.label}</td>
                                                <td className={`px-6 py-3 text-right font-medium ${row.strategyBetter ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {row.strategy}
                                                </td>
                                                <td className={`px-6 py-3 text-right font-medium ${!row.strategyBetter ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {row.buyHold}
                                                </td>
                                            </tr>
                                        ))}
                                        {result.strategy.win_rate !== null && (
                                            <tr className="border-b border-slate-800 last:border-0">
                                                <td className="px-6 py-3 text-slate-500">Win Rate</td>
                                                <td className="px-6 py-3 text-right font-medium text-slate-200">
                                                    {formatPercent(result.strategy.win_rate)}
                                                </td>
                                                <td className="px-6 py-3 text-right text-slate-600">—</td>
                                            </tr>
                                        )}
                                        {result.strategy.profit_factor !== null && (
                                            <tr>
                                                <td className="px-6 py-3 text-slate-500">Profit Factor</td>
                                                <td className="px-6 py-3 text-right font-medium text-slate-200">
                                                    {result.strategy.profit_factor.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3 text-right text-slate-600">—</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {!result && !error && (
                        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-600 text-sm">
                            Run a backtest to see results here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Backtesting;