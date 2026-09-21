def run_backtest(df, starting_cash):
    cash = starting_cash
    shares = 0

    for index, row in df.iterrows():
       if row['golden_cross'] == True and shares == 0:
             shares = cash / row['close']
             cash = 0
             print(f"BUY on {row['timestamp']} at {row['close']}, shares={shares}")
       elif row['death_cross'] == True and cash == 0 :
             cash = shares * row['close'] 
             shares = 0
             print(f"SELL on {row['timestamp']} at {row['close']}, cash={cash}")

    final_close = df['close'].iloc[-1]
    final_value = shares * final_close if shares > 0 else cash

    first_close = df['close'].iloc[0]
    buy_hold_shares = starting_cash / first_close
    buy_hold_value = buy_hold_shares * final_close

    return final_value, buy_hold_value


if __name__ == "__main__":
    from quantops.data.alpaca_client import get_historical_bars
    from quantops.strategies.moving_average import add_moving_average_signals

    df = get_historical_bars("AAPL", "2024-01-01")
    df = add_moving_average_signals(df, short_window=20, long_window=50)
    final_value, buy_hold_value = run_backtest(df, starting_cash=10000)

    print(f"Strategy final value: {final_value}")
    print(f"Buy-and-hold final value: {buy_hold_value}")