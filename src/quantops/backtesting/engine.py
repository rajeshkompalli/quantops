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