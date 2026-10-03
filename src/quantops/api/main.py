from fastapi import FastAPI
from pydantic import BaseModel
from quantops.backtesting.engine import run_full_backtest
from fastapi.middleware.cors import CORSMiddleware

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
    starting_cash: float = 10000

@app.get("/")
def read_root():
    return {"message": "QuantOps API is running"}

@app.post("/backtest")
def run_backtest_endpoint(request: BacktestRequest):
    return run_full_backtest(request.symbol, request.start_date, request.starting_cash)
   