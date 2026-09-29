from quantops.backtesting.engine import run_full_backtest

def main():
    symbol = "AAPL"
    fetch_start_date = "2024-01-01"
    starting_cash = 10000

    result = run_full_backtest(symbol, fetch_start_date, starting_cash)

    print(f"Symbol: {result['symbol']}")
    print(f"Period: {result['period_start'].date()} to {result['period_end'].date()}\n")

    strategy = result['strategy']
    buy_hold = result['buy_and_hold']

    print("Strategy")
    print(f"  Final value:     ${strategy['final_value']:,.2f}")
    print(f"  CAGR:            {strategy['cagr']:.1%}")
    print(f"  Sharpe ratio:    {strategy['sharpe_ratio']:.2f}" if strategy['sharpe_ratio'] is not None else "  Sharpe ratio:    N/A")
    print(f"  Max drawdown:    {strategy['max_drawdown']:.1%}")
    print(f"  Win rate:        {strategy['win_rate']:.1%}" if strategy['win_rate'] is not None else "  Win rate:        N/A (no trades)")
    print(f"  Profit factor:   {strategy['profit_factor']:.2f}" if strategy['profit_factor'] is not None else "  Profit factor:   N/A (no trades)")

    print("\nBuy-and-Hold")
    print(f"  Final value:     ${buy_hold['final_value']:,.2f}")
    print(f"  CAGR:            {buy_hold['cagr']:.1%}")
    print(f"  Sharpe ratio:    {buy_hold['sharpe_ratio']:.2f}" if buy_hold['sharpe_ratio'] is not None else "  Sharpe ratio:    N/A")
    print(f"  Max drawdown:    {buy_hold['max_drawdown']:.1%}")

if __name__ == "__main__":
    main()