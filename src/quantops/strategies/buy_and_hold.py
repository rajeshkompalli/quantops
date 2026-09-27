def run_buy_and_hold(df, starting_cash):
    first_close = df['close'].iloc[0]
    shares = starting_cash / first_close
    equity_curve = (df['close'] * shares).tolist()
    return equity_curve