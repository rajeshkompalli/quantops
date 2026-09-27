def generate_signals(df, window=20, num_std=2):
    df['sma'] = df['close'].rolling(window=window).mean()
    df['std'] = df['close'].rolling(window=window).std()

    df['upper_band'] = df['sma'] + (num_std * df['std'])
    df['lower_band'] = df['sma'] - (num_std * df['std'])

    df['signal'] = 'HOLD'
    df.loc[df['close'] < df['lower_band'], 'signal'] = 'BUY'
    df.loc[df['close'] > df['sma'], 'signal'] = 'SELL'

    return df


if __name__ == "__main__":
    from quantops.data.alpaca_client import get_historical_bars
    df = get_historical_bars("AAPL", "2024-01-01")
    df = generate_signals(df)
    print(df[df['signal'] != 'HOLD'][['timestamp', 'close', 'lower_band', 'sma', 'signal']].head(20))