from quantops.backtesting.engine import run_full_backtest


def run_train_test_backtest(symbol, train_start, train_end, test_start, test_end, starting_cash=10000, strategy_names=None):
    train_result = run_full_backtest(
        symbol=symbol,
        start_date=train_start,
        end_date=train_end,
        starting_cash=starting_cash,
        strategy_names=strategy_names,
    )
    test_result = run_full_backtest(
        symbol=symbol,
        start_date=test_start,
        end_date=test_end,
        starting_cash=starting_cash,
        strategy_names=strategy_names,
    )
    return {"train": train_result, "test": test_result}
