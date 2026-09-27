
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
