import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Play } from 'lucide-react';

function Backtesting() {
    const [symbol, setSymbol] = useState('AAPL');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const runBacktest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:8000/backtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, start_date: '2024-01-01', starting_cash: 10000 }),
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

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold text-white mb-1">Backtesting</h1>
            <p className="text-sm text-slate-500 mb-8">Run your ensemble strategy against historical data.</p>

            <form onSubmit={runBacktest} className="flex gap-3 mb-8">
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Symbol (e.g. AAPL)"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-48"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-slate-950 font-semibold rounded-lg px-5 py-2 transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                    {loading ? 'Running...' : 'Run Backtest'}
                </button>
            </form>

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
                    className="grid grid-cols-2 gap-6"
                >
                    <ResultCard title="Strategy" data={result.strategy} accent />
                    <ResultCard title="Buy & Hold" data={result.buy_and_hold} />
                </motion.div>
            )}
        </div>
    );
}

function ResultCard({ title, data, accent }) {
    const row = (label, value) => (
        <div className="flex justify-between py-2 border-b border-slate-800 last:border-0">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm font-medium text-slate-200">{value}</span>
        </div>
    );

    return (
        <div className={`bg-slate-900 border rounded-xl p-6 ${accent ? 'border-emerald-500/30' : 'border-slate-800'}`}>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">{title}</h3>
            {row('Final Value', `$${data.final_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)}
            {row('CAGR', `${(data.cagr * 100).toFixed(1)}%`)}
            {row('Sharpe Ratio', data.sharpe_ratio !== null ? data.sharpe_ratio.toFixed(2) : 'N/A')}
            {row('Max Drawdown', `${(data.max_drawdown * 100).toFixed(1)}%`)}
            {data.win_rate !== undefined && row('Win Rate', data.win_rate !== null ? `${(data.win_rate * 100).toFixed(1)}%` : 'N/A')}
            {data.profit_factor !== undefined && row('Profit Factor', data.profit_factor !== null ? data.profit_factor.toFixed(2) : 'N/A')}
        </div>
    );
}

export default Backtesting;