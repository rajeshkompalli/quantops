from quantops.data.alpaca_client import get_historical_bars
from quantops.strategies.moving_average import add_moving_average_signals
from quantops.backtesting.engine import run_backtest


def main():
    symbol = "AAPL"
    start_date = "2024-01-01"
    short_window = 20
    long_window = 50
    starting_cash = 10000

    df = get_historical_bars(symbol, start_date)
    df = add_moving_average_signals(df, short_window, long_window)
    final_value, buy_hold_value = run_backtest(df, starting_cash)
    print(f"Symbol: {symbol}")
    print(f"Strategy final value: {final_value}")
    print(f"Buy-and-hold final value: {buy_hold_value}")


if __name__ == "__main__":
    main()