from quantops.data.alpaca_client import get_historical_bars
from quantops.strategies import moving_average, rsi, bollinger_bands
from quantops.strategies.ensemble import generate_signals
from quantops.strategies.buy_and_hold import run_buy_and_hold
from quantops.backtesting.engine import run_backtest
from quantops.analytics.performance import (
    calculate_win_rate,
    calculate_profit_factor,
    calculate_max_drawdown,
    calculate_cagr,
    calculate_sharpe_ratio,
)


def main():
    symbol = "AAPL"
    fetch_start_date = "2024-01-01"
    starting_cash = 10000

    strategies = [
        {'func': moving_average.generate_signals, 'weight': 1.0},
        {'func': rsi.generate_signals, 'weight': 1.0},
        {'func': bollinger_bands.generate_signals, 'weight': 1.0},
    ]

    # --- Build signals ---
    df = get_historical_bars(symbol, fetch_start_date)
    df = generate_signals(df, strategies)

    # --- Run strategy backtest ---
    final_value, buy_hold_value, trades, equity_curve = run_backtest(df, starting_cash)

    # --- Run buy-and-hold benchmark ---
    buy_hold_curve = run_buy_and_hold(df, starting_cash)

    # --- Compute metrics ---
    period_start = df['timestamp'].iloc[0]
    period_end = df['timestamp'].iloc[-1]

    win_rate = calculate_win_rate(trades)
    profit_factor = calculate_profit_factor(trades)
    max_dd = calculate_max_drawdown(equity_curve)
    cagr = calculate_cagr(equity_curve, period_start, period_end)
    sharpe = calculate_sharpe_ratio(equity_curve)

    buy_hold_max_dd = calculate_max_drawdown(buy_hold_curve)
    buy_hold_cagr = calculate_cagr(buy_hold_curve, period_start, period_end)
    buy_hold_sharpe = calculate_sharpe_ratio(buy_hold_curve)

    # --- Report ---
    print(f"Symbol: {symbol}")
    print(f"Period: {period_start.date()} to {period_end.date()}\n")

    print("Strategy")
    print(f"  Final value:     ${final_value:,.2f}")
    print(f"  CAGR:            {cagr:.1%}")
    print(f"  Sharpe ratio:    {sharpe:.2f}" if sharpe is not None else "  Sharpe ratio:    N/A")
    print(f"  Max drawdown:    {max_dd:.1%}")
    print(f"  Win rate:        {win_rate:.1%}" if win_rate is not None else "  Win rate:        N/A (no trades)")
    print(f"  Profit factor:   {profit_factor:.2f}" if profit_factor is not None else "  Profit factor:   N/A (no trades)")

    print("\nBuy-and-Hold")
    print(f"  Final value:     ${buy_hold_value:,.2f}")
    print(f"  CAGR:            {buy_hold_cagr:.1%}")
    print(f"  Sharpe ratio:    {buy_hold_sharpe:.2f}" if buy_hold_sharpe is not None else "  Sharpe ratio:    N/A")
    print(f"  Max drawdown:    {buy_hold_max_dd:.1%}")


if __name__ == "__main__":
    main()