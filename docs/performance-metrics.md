# Performance Metrics Reference

A reference for the metrics QuantOps uses to evaluate strategy performance — what each one answers, and why it matters on its own.

## Signal / Indicator Terms (inputs to a strategy)

| Term | What it is | Why it matters |
|---|---|---|
| **SMA (Simple Moving Average)** | Average closing price over the last N days | Smooths day-to-day noise to reveal trend direction |
| **Golden Cross** | Short-term SMA crosses *above* long-term SMA | Candidate buy signal — trend turning up |
| **Death Cross** | Short-term SMA crosses *below* long-term SMA | Candidate sell signal — trend turning down |
| **RSI (Relative Strength Index)** | 0–100 score measuring how much recent gains dominate recent losses | Flags overbought (>70) / oversold (<30) momentum extremity, not trend direction |

## Performance / Evaluation Terms (outputs — how good was the strategy)

| Term | What it answers | Why it matters |
|---|---|---|
| **Final value / Buy-and-hold value** | How much money did I end up with, vs. doing nothing? | Most basic comparison — hides *how* you got there |
| **Win rate** | Of completed trades, what % were profitable? | How *often* the strategy is right — says nothing about *how much* |
| **Profit factor** | Total profit from winners ÷ total loss from losers | The *size* relationship between wins and losses — a low win rate can still be profitable if wins are much bigger than losses |
| **Equity curve** | Portfolio's total value, tracked every single day | The full picture over time — raw data everything below is computed from |
| **Max Drawdown** | Worst peak-to-trough decline at any point | Pure risk measure — a strategy can have a great final value while having gone through a severe dip that final-value alone hides |
| **CAGR** | Annualized % return | Lets you fairly compare strategies tested over different time spans |
| **Sharpe Ratio** | Return earned per unit of risk/volatility taken | The standard single number for "is this a *good* strategy," not just a profitable one |

## Mental Model

Three layers, each a more sophisticated question:
1. **Did I make money?** → final value vs. buy-and-hold
2. **How well did my trades perform?** → win rate, profit factor
3. **How risky was the ride, and was the return worth it?** → equity curve, max drawdown, Sharpe ratio, CAGR

A strategy is only worth considering for real use once it holds up across all three layers — not just layer 1.

## Findings Log

- **RSI as a golden-cross entry filter** (tested on AAPL, INTC; 2024–2026 data): RSI < 70 consistently *hurt* returns (~-30% vs. unfiltered on both stocks) by blocking strong trending entries. RSI < 80 was roughly equivalent to no filter. No evidence this filter design adds value — kept RSI computation in the codebase as a reusable indicator, but dropped it from the entry filter.


### AAPL — Golden/Death Cross Strategy vs. Buy-and-Hold
Period: 2024-01-02 to 2026-09-22

| Metric | Strategy | Buy-and-Hold |
|---|---|---|
| Final value | $13,797.88 | $18,301.55 |
| CAGR | 12.6% | 24.9% |
| Sharpe ratio | 0.72 | 0.95 |
| Max drawdown | -24.7% | -33.4% |
| Win rate | 33.3% | — |
| Profit factor | 2.16 | — |

**Conclusion:** Buy-and-hold outperformed the strategy on return and risk-adjusted return (CAGR, Sharpe). The strategy did provide a meaningfully shallower drawdown (-24.7% vs. -33.4%), showing some real downside protection from its death-cross exits — but this wasn't enough to make it the better choice overall on this stock/period.

### INTC — Golden/Death Cross Strategy vs. Buy-and-Hold
| Metric | Strategy | Buy-and-Hold |
|---|---|---|
| Final value | $12,422.46 | $25,476.99 |
| Max drawdown | -60.3% | -63.4% |

**Conclusion:** Buy-and-hold more than doubled the strategy's return, with only marginally worse drawdown. The strategy's exits offered negligible risk protection here, likely because INTC's decline and recovery were both too fast/sharp for the 20/50-day crossover to meaningfully sidestep.

### RSI as an entry filter (tested on both AAPL and INTC)
RSI < 70 consistently *hurt* returns (~-30% vs. unfiltered on both stocks) by blocking strong trending entries. RSI < 80 was roughly equivalent to no filter. No evidence this filter design adds value — RSI computation kept in the codebase as a reusable indicator, but dropped from the entry filter (currently set to a no-op threshold of 100).

### Overall Phase 2 takeaway
Across two stocks and multiple metrics, the simple moving-average crossover strategy has not beaten buy-and-hold. This is treated as a legitimate research result, not a bug — the next step is testing a genuinely different strategy family (e.g., mean reversion) rather than continuing to tune this one.

### Standalone RSI as a Mean-Reversion Strategy (buy RSI<30, sell RSI>70)

| Metric | AAPL Strategy | AAPL Buy-Hold | INTC Strategy | INTC Buy-Hold |
|---|---|---|---|---|
| Final value | $18,812.06 | $18,372.66 | $11,920.14 | $25,732.22 |
| CAGR | 26.1% | 25.0% | 6.7% | 41.4% |
| Sharpe ratio | 1.35 | 0.95 | 0.37 | 0.85 |
| Max drawdown | -10.8% | -33.4% | -54.9% | -63.4% |
| Win rate | 80.0% | — | 71.4% | — |
| Profit factor | 27.00 | — | 2.05 | — |

**Conclusion:** Dramatic outperformance on AAPL did not replicate on INTC — buy-and-hold won decisively on INTC across every return metric. This strongly suggests the AAPL result was curve-fit to that stock's specific price behavior (likely a more range-bound, choppy pattern suited to mean reversion) rather than a durable edge. A third stock is needed before drawing any real conclusion about standalone RSI mean-reversion.