import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, FlaskConical } from 'lucide-react';
import ValidationView from '../components/ValidationView';


const AVAILABLE_STRATEGIES = [
    { id: 'moving_average', label: 'Moving Average Crossover' },
    { id: 'rsi', label: 'RSI' },
    { id: 'bollinger_bands', label: 'Bollinger Bands' },
];

function formatPercent(value) {
    return value !== null && value !== undefined ? `${(value * 100).toFixed(1)}%` : 'N/A';
}

function Research() {
    const [symbolsInput, setSymbolsInput] = useState('AAPL, INTC, MSFT');
    const [selectedStrategies, setSelectedStrategies] = useState(
        AVAILABLE_STRATEGIES.map((s) => s.id)
    );
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('compare'); // 'compare' | 'validate'


    const toggleStrategy = (id) => {
        setSelectedStrategies((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const runResearch = async (e) => {
        e.preventDefault();

        const symbols = symbolsInput
            .split(',')
            .map((s) => s.trim().toUpperCase())
            .filter((s) => s.length > 0);

        if (symbols.length === 0) {
            setError('Enter at least one symbol.');
            return;
        }
        if (selectedStrategies.length === 0) {
            setError('Select at least one strategy.');
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await fetch('http://localhost:8000/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbols,
                    start_date: '2024-01-01',
                    starting_cash: 10000,
                    strategies: selectedStrategies,
                }),
            });

            if (!response.ok) throw new Error('Research request failed');
            const data = await response.json();
            setResults(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const winCount = results ? results.filter((r) => r.strategy.final_value > r.buy_and_hold.final_value).length : 0;

    return (
        <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Research</h1>
            <p className="text-sm text-slate-500 mb-8 max-w-2xl">
                Run the same strategy across multiple stocks at once. A strategy that only
                performs well on one symbol is often luck or curve-fitting, not a real edge —
                this view makes that pattern visible immediately.
            </p>

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setMode('compare')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'compare' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Compare Symbols
                </button>
                <button
                    onClick={() => setMode('validate')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'validate' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Validate Out-of-Sample
                </button>
            </div>

            {mode === 'validate' ? (
                <ValidationView />
            ) : (
                <>

                    <form onSubmit={runResearch} className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                Symbols <span className="text-slate-600">(comma-separated)</span>
                            </label>
                            <input
                                type="text"
                                value={symbolsInput}
                                onChange={(e) => setSymbolsInput(e.target.value)}
                                placeholder="e.g. AAPL, MSFT, INTC"
                                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full max-w-md"
                            />
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
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <FlaskConical size={18} />}
                            {loading ? 'Running...' : 'Run Research'}
                        </button>
                    </form>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {results && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-400 mb-4">
                                Strategy beat Buy &amp; Hold on <span className="text-emerald-400 font-medium">{winCount} of {results.length}</span> symbols tested.
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-500">
                                            <th className="text-left font-medium px-6 py-3">Symbol</th>
                                            <th className="text-right font-medium px-6 py-3">Strategy CAGR</th>
                                            <th className="text-right font-medium px-6 py-3">Buy &amp; Hold CAGR</th>
                                            <th className="text-right font-medium px-6 py-3">Strategy Sharpe</th>
                                            <th className="text-right font-medium px-6 py-3">Strategy Drawdown</th>
                                            <th className="text-right font-medium px-6 py-3">Buy &amp; Hold Drawdown</th>
                                            <th className="text-center font-medium px-6 py-3">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((r) => {
                                            const won = r.strategy.final_value > r.buy_and_hold.final_value;
                                            return (
                                                <tr key={r.symbol} className="border-b border-slate-800 last:border-0">
                                                    <td className="px-6 py-3 font-medium text-slate-200">{r.symbol}</td>
                                                    <td className={`px-6 py-3 text-right ${won ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                        {formatPercent(r.strategy.cagr)}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-slate-300">{formatPercent(r.buy_and_hold.cagr)}</td>
                                                    <td className="px-6 py-3 text-right text-slate-300">{r.strategy.sharpe_ratio?.toFixed(2) ?? 'N/A'}</td>
                                                    <td className="px-6 py-3 text-right text-slate-300">{formatPercent(r.strategy.max_drawdown)}</td>
                                                    <td className="px-6 py-3 text-right text-slate-300">{formatPercent(r.buy_and_hold.max_drawdown)}</td>
                                                    <td className="px-6 py-3 text-center">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${won ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                                            }`}>
                                                            {won ? 'Won' : 'Lost'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}


                </>
            )}

        </div>
    );
}

export default Research;