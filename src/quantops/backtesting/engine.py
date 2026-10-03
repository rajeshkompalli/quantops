from quantops.data.alpaca_client import get_historical_bars
from quantops.strategies import moving_average, rsi, bollinger_bands
from quantops.strategies.ensemble import generate_signals
from quantops.strategies.buy_and_hold import run_buy_and_hold
from quantops.analytics.performance import (
    calculate_win_rate,
    calculate_profit_factor,
    calculate_max_drawdown,
    calculate_cagr,
    calculate_sharpe_ratio,
)

STRATEGY_REGISTRY = {
    "moving_average": moving_average.generate_signals,
    "rsi": rsi.generate_signals,
    "bollinger_bands": bollinger_bands.generate_signals,
}

def run_backtest(df, starting_cash):
    cash = starting_cash
    shares = 0
    trades = []
    buy_price = None
    equity_curve = []

    for index, row in df.iterrows():
        if row['signal'] == 'BUY' and shares == 0:
            shares = cash / row['close']
            buy_price = row['close']
            cash = 0
            print(f"BUY on {row['timestamp']} at {row['close']}, shares={shares}")
        elif row['signal'] == 'SELL' and cash == 0:
            cash = shares * row['close']
            trades.append({'buy_price': buy_price, 'sell_price': row['close']})
            shares = 0
            print(f"SELL on {row['timestamp']} at {row['close']}, cash={cash}")

        current_value = shares * row['close'] if shares > 0 else cash
        equity_curve.append(current_value)

    final_close = df['close'].iloc[-1]
    final_value = shares * final_close if shares > 0 else cash

    first_close = df['close'].iloc[0]
    buy_hold_shares = starting_cash / first_close
    buy_hold_value = buy_hold_shares * final_close

    return final_value, buy_hold_value, trades, equity_curve


def run_full_backtest(symbol, start_date, starting_cash=10000, end_date=None, strategy_names=None):
    if strategy_names is None:
        strategy_names = list(STRATEGY_REGISTRY.keys())

    strategies = [
        {'func': STRATEGY_REGISTRY[name], 'weight': 1.0}
        for name in strategy_names
    ]

    df = get_historical_bars(symbol, start_date, end_date=end_date)
    df = generate_signals(df, strategies)

    final_value, buy_hold_value, trades, equity_curve = run_backtest(df, starting_cash)
    buy_hold_curve = run_buy_and_hold(df, starting_cash)

    period_start = df['timestamp'].iloc[0]
    period_end = df['timestamp'].iloc[-1]

    return {
        "symbol": symbol,
        "period_start": period_start,
        "period_end": period_end,
        "strategy": {
            "final_value": final_value,
            "cagr": calculate_cagr(equity_curve, period_start, period_end),
            "sharpe_ratio": calculate_sharpe_ratio(equity_curve),
            "max_drawdown": calculate_max_drawdown(equity_curve),
            "win_rate": calculate_win_rate(trades),
            "profit_factor": calculate_profit_factor(trades),
        },
        "buy_and_hold": {
            "final_value": buy_hold_value,
            "cagr": calculate_cagr(buy_hold_curve, period_start, period_end),
            "sharpe_ratio": calculate_sharpe_ratio(buy_hold_curve),
            "max_drawdown": calculate_max_drawdown(buy_hold_curve),
        }
    }