
## Setup

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
4. Run the backtest:
```bash
   python -m quantops.backtesting.engine
```

## Roadmap

- [ ] Proper backtesting engine (transaction costs, slippage, portfolio metrics)
- [ ] Multi-strategy framework (RSI, momentum, mean reversion)
- [ ] Quant research tooling (walk-forward testing, parameter optimization)
- [ ] Risk management layer
- [ ] Automated testing (unit, integration, regression)
- [ ] CI/CD pipeline
- [ ] Cloud deployment
- [ ] Observability (logging, metrics, dashboards)
- [ ] AI/LLM-assisted research (news/sentiment analysis — never directly executing trades)
- [ ] Live paper trading with notifications

## Disclaimer

This project is for educational purposes. It is not intended for live trading with real capital, and no results here should be interpreted as investment advice.