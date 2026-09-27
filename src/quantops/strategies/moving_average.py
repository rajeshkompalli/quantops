
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


