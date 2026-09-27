
import numpy as np

def add_rsi(df, window):
    
    df['price_change'] = df['close'].diff()
    df['gain'] = np.where(df['price_change'] > 0, df['price_change'], 0)
    df['loss'] = np.where(df['price_change'] < 0, -df['price_change'], 0)

    df['avg_gain'] = df['gain'].rolling(window=window).mean()
    df['avg_loss'] = df['loss'].rolling(window=window).mean()

    df['rs'] = df['avg_gain'] / df['avg_loss']
    df['rsi'] = 100 - (100 / (1 + df['rs']))

    return df

def generate_signals(df, window=14, oversold=30, overbought=70):
    df = add_rsi(df, window)

    df['signal'] = 'HOLD'
    df.loc[df['rsi'] < oversold, 'signal'] = 'BUY'
    df.loc[df['rsi'] > overbought, 'signal'] = 'SELL'

    return df

if __name__ == "__main__":
    from quantops.data.alpaca_client import get_historical_bars
    df = get_historical_bars("AAPL", "2024-01-01")
    df = generate_signals(df)
    print(df[df['signal'] != 'HOLD'][['timestamp', 'close', 'rsi', 'signal']])