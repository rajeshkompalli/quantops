def generate_signals(df, strategies):
    """
    strategies: a list of dicts, each like:
        {'func': some_generate_signals_function, 'weight': 1.0, 'params': {...}}
    """
    score = None

    for i, strat in enumerate(strategies):
        temp_df = strat['func'](df.copy(), **strat.get('params', {}))
        signal_col = f'signal_{i}'
        df[signal_col] = temp_df['signal']

        vote = df[signal_col].map({'BUY': 1, 'HOLD': 0, 'SELL': -1})
        weighted_vote = vote * strat['weight']

        score = weighted_vote if score is None else score + weighted_vote

    df['score'] = score
    df['signal'] = 'HOLD'
    df.loc[df['score'] > 0, 'signal'] = 'BUY'
    df.loc[df['score'] < 0, 'signal'] = 'SELL'

    return df