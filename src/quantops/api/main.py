from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from datetime import date, timedelta

from quantops.backtesting.engine import run_full_backtest
from quantops.backtesting.validation import run_train_test_backtest
from quantops.data.alpaca_client import get_historical_bars
from quantops.strategies.ensemble import generate_signals
from quantops.backtesting.engine import STRATEGY_REGISTRY

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class BacktestRequest(BaseModel):
    symbol: str
    start_date: str
    end_date: Optional[str] = None
    starting_cash: float = 10000
    strategies: List[str] = ["moving_average", "rsi", "bollinger_bands"]

@app.get("/")
def read_root():
    return {"message": "QuantOps API is running"}

@app.post("/backtest")
def run_backtest_endpoint(request: BacktestRequest):
    return run_full_backtest(
        symbol=request.symbol,
        start_date=request.start_date,
        starting_cash=request.starting_cash,
        end_date=request.end_date,
        strategy_names=request.strategies,
    )


class ResearchRequest(BaseModel):
    symbols: List[str]
    start_date: str
    end_date: Optional[str] = None
    starting_cash: float = 10000
    strategies: List[str] = ["moving_average", "rsi", "bollinger_bands"]

@app.post("/research")
def run_research_endpoint(request: ResearchRequest):
    results = []
    for symbol in request.symbols:
        result = run_full_backtest(
            symbol=symbol,
            start_date=request.start_date,
            starting_cash=request.starting_cash,
            end_date=request.end_date,
            strategy_names=request.strategies,
        )
        results.append(result)
    return {"results": results}


class ValidationRequest(BaseModel):
    symbol: str
    train_start: str
    train_end: str
    test_start: str
    test_end: str
    starting_cash: float = 10000
    strategies: List[str] = ["moving_average", "rsi", "bollinger_bands"]

@app.post("/validate")
def run_validation_endpoint(request: ValidationRequest):
    return run_train_test_backtest(
        symbol=request.symbol,
        train_start=request.train_start,
        train_end=request.train_end,
        test_start=request.test_start,
        test_end=request.test_end,
        starting_cash=request.starting_cash,
        strategy_names=request.strategies,
    )



@app.get("/scan")
def scan_watchlist(symbols: str = "AAPL,MSFT,NVDA,GOOGL,AMZN"):
    symbol_list = [s.strip().upper() for s in symbols.split(",")]
    lookback_start = (date.today() - timedelta(days=200)).isoformat()

    strategy_names = ["moving_average", "rsi", "bollinger_bands"]
    results = []
    for symbol in symbol_list:
        df = get_historical_bars(symbol, lookback_start)
        strategies_config = [{'func': STRATEGY_REGISTRY[name], 'weight': 1.0} for name in strategy_names]
        df = generate_signals(df, strategies_config)
        latest = df.iloc[-1]
        results.append({
            "symbol": symbol,
            "close": latest["close"],
            "date": latest["timestamp"].strftime("%Y-%m-%d"),
            "combined_signal": latest["signal"],
            "votes": {
                name: latest[f"signal_{i}"]
                for i, name in enumerate(strategy_names)
            },
        })
    return {"results": results}