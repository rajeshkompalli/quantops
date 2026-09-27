
def add_moving_average_signals(df,short_window,long_window):
    df['sma_short'] = df['close'].rolling(window=short_window).mean()
    df['sma_long'] = df['close'].rolling(window=long_window).mean()

    df['sma_short_prev'] = df['sma_short'].shift(1)
    df['sma_long_prev'] = df['sma_long'].shift(1)

    df['today_above'] =  df['sma_short'] > df['sma_long']
    df['yesterday_below'] = df['sma_short_prev'] < df['sma_long_prev']
    df['golden_cross'] = df['today_above'] &  df['yesterday_below']

    df['today_below'] = df['sma_short'] < df['sma_long']
    df['yesterday_above'] = df['sma_short_prev'] >df['sma_long_prev']
    df['death_cross'] = df['today_below'] &  df['yesterday_above']

    return df

def generate_signals(df, short_window=20, long_window=50):
    df = add_moving_average_signals(df, short_window, long_window)

    df['signal'] = 'HOLD'
    df.loc[df['golden_cross'] == True, 'signal'] = 'BUY'
    df.loc[df['death_cross'] == True, 'signal'] = 'SELL'

    return df



if __name__ == "__main__":
    from quantops.data.alpaca_client import get_historical_bars
    df = get_historical_bars("AAPL", "2024-01-01")
    df = generate_signals(df)
    print(df[df['signal'] != 'HOLD'][['timestamp', 'close', 'signal']])
