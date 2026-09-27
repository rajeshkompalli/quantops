from quantops.strategies.moving_average import generate_signals as ma_signals
from quantops.strategies.bollinger_bands import generate_signals as bb_signals

def generate_signals(df, short_window=20, long_window=50, bb_window=20, num_std=2):
    df = ma_signals(df, short_window, long_window)
    df = df.rename(columns={'signal': 'ma_signal'})

    df = bb_signals(df, bb_window, num_std)
    df = df.rename(columns={'signal': 'bb_signal'})

    df['signal'] = 'HOLD'
    df.loc[(df['ma_signal'] == 'BUY') & (df['bb_signal'] == 'BUY'), 'signal'] = 'BUY'
    df.loc[(df['ma_signal'] == 'SELL') & (df['bb_signal'] == 'SELL'), 'signal'] = 'SELL'

    return df

if __name__ == "__main__":
    from quantops.data.alpaca_client import get_historical_bars
    df = get_historical_bars("AAPL", "2024-01-01")
    df = generate_signals(df)
    print(df[df['signal'] != 'HOLD'][['timestamp', 'close', 'ma_signal', 'bb_signal', 'signal']])