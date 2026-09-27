import pandas as pd

def calculate_win_rate(trades):
    winning_trades = [t for t in trades if t['sell_price'] > t['buy_price']]
    win_rate = len(winning_trades) / len(trades)
    return win_rate


def calculate_profit_factor(trades):
    winning_trades = [t for t in trades if t['sell_price'] > t['buy_price']]
    losing_trades = [t for t in trades if t['sell_price'] <= t['buy_price']]

    total_profit = sum(t['sell_price'] - t['buy_price'] for t in winning_trades)
    total_loss = sum(t['buy_price'] - t['sell_price'] for t in losing_trades)

    profit_factor = total_profit / total_loss
    return profit_factor

def calculate_max_drawdown(equity_curve):
    equity_series = pd.Series(equity_curve)
    running_max = equity_series.cummax()
    drawdown = (equity_series - running_max) / running_max
    max_drawdown = drawdown.min()
    return max_drawdown

def calculate_cagr(equity_curve, start_date, end_date):
    starting_value = equity_curve[0]
    ending_value = equity_curve[-1]

    num_days = (end_date - start_date).days
    years = num_days / 365.25

    cagr = (ending_value / starting_value) ** (1 / years) - 1
    return cagr


def calculate_sharpe_ratio(equity_curve):
    equity_series = pd.Series(equity_curve)
    daily_returns = equity_series.pct_change()

    avg_return = daily_returns.mean()
    std_return = daily_returns.std()

    sharpe = (avg_return / std_return) * (252 ** 0.5)
    return sharpe