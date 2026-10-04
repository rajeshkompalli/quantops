# QuantOps

An AI-assisted algorithmic trading and quantitative research platform, built as a hands-on learning project — not a system for generating real trading returns.

## Why This Project Exists

This project has three goals:
1. Learn Python and React deeply through hands-on implementation
2. Learn algorithmic trading and quantitative concepts by building and testing real strategies
3. Build a portfolio project demonstrating software engineering, QA, DevOps, and cloud skills

The focus is on engineering quality, correctness, and honest research — not on producing impressive-looking backtest returns. Every strategy here is evaluated rigorously, including against simple Buy & Hold, and negative results are treated as valid findings, not bugs to fix.

## Current Status

**Backend** — Python, FastAPI, pandas:
- Fetches historical stock data via the Alpaca API (paper trading account)
- Three strategies on a common interface: Moving Average Crossover, RSI, Bollinger Bands, plus a weighted ensemble combiner
- Full backtesting engine with real performance metrics: CAGR, Sharpe ratio, max drawdown, win rate, profit factor
- Out-of-sample validation: train/test split backtesting to check whether a strategy's edge (or lack of one) is real or curve-fit
- REST API exposing backtesting, multi-symbol research, and validation as endpoints

**Frontend** — React, Tailwind CSS, Recharts:
- Login page and dashboard shell with sidebar navigation
- **Backtesting** — configurable symbol, time horizon, capital, and strategy selection, with a win/lose verdict, equity curve chart, and full metrics comparison against Buy & Hold
- **Research** — compare a strategy across multiple symbols at once, or validate it out-of-sample with a train/test split
- Risk, Market Intelligence, and Trade Log pages are placeholders, gated behind backend work (Risk Engine, AI/LLM integration, live execution) that doesn't exist yet

## Key Findings So Far

Tested across three stocks (AAPL, INTC, MSFT) with meaningfully different price behavior:

- **Moving Average Crossover and standalone RSI** both consistently underperformed simple Buy & Hold on return and risk-adjusted return. A train/test split on AAPL and INTC showed the underperformance gap held steady across non-overlapping time periods — evidence this is a real pattern, not an artifact of one time window.
- **RSI as an entry filter** on the crossover strategy made results *worse*, not better — it blocked the strategy's best trades.
- **Bollinger Bands** also underperformed Buy & Hold on return, but was the first strategy to show a consistent, meaningful reduction in max drawdown across all three stocks — a real (if modest) risk/return trade-off, not a fluke.
- **A naive equal-weighted ensemble** of all three strategies performed worse than several of its individual components — combining strategies isn't automatically better.

Full findings, numbers, and methodology: [`docs/performance-metrics.md`](docs/performance-metrics.md)

## Project Structure
quantops/
├── src/quantops/
│ ├── data/ # Alpaca API client
│ ├── strategies/ # Signal logic: crossover, RSI, Bollinger, ensemble
│ ├── backtesting/ # Backtest engine + train/test validation
│ ├── analytics/ # Performance metrics
│ └── api/ # FastAPI backend
├── frontend/ # React + Tailwind + Recharts UI
└── docs/ # Research findings and documentation


## Setup

### Backend

1. Clone the repo and create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate
```
2. Install dependencies:
```bash
pip install -r requirements.txt
pip install -e .
```
3. Copy `.env.example` to `.env` and add your Alpaca paper trading API keys:
```bash
cp .env.example .env
```
4. Run the API server:
```bash
uvicorn quantops.api.main:app --reload
```
API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

### CLI (no server needed)

```bash
python -m quantops.main
```

## Roadmap

- [x] Backtesting engine with full performance metrics
- [x] Multi-strategy framework (crossover, RSI, Bollinger, ensemble)
- [x] Out-of-sample validation (train/test split)
- [x] React frontend with live backtesting and research
- [ ] Walk-forward testing and market regime analysis
- [ ] Risk management layer
- [ ] Automated testing (unit, integration, regression)
- [ ] CI/CD pipeline
- [ ] Cloud deployment
- [ ] Observability (logging, metrics, dashboards)
- [ ] AI/LLM-assisted research (news/sentiment analysis — never directly executing trades)
- [ ] Live paper trading with notifications

## Disclaimer

This project is for educational purposes. It is not intended for live trading with real capital, and no results here should be interpreted as investment advice.