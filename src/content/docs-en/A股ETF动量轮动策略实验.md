---
title: A-Share ETF Momentum Rotation Experiment
description: An experimental A-share ETF momentum rotation strategy, including its design, backtest results, and risks.
order: 20
---

## Overview

**Investing involves risk. Exercise caution.**

**Please note: this project is for educational purposes only and does not constitute investment advice.**

### ~~Strategy details and daily reports are published here~~ Experiment discontinued: “Value investing does not work in A-shares :-)” — the author's comment

[Archived project notes](https://infinitysignal.notion.site/A-ETF-33e2440f992f80d189a5c9dda41ea19e)

## Background

Momentum rotation is a classic quantitative investing approach: buy assets that have recently performed strongly and sell those that have performed weakly. It assumes that markets are not fully efficient and that price trends can persist over the short to medium term.

In the A-share market, a high proportion of retail investors and pronounced sentiment swings can lead to rapid sector and style rotation. Traditional buy-and-hold strategies may experience substantial drawdowns, while pure momentum strategies can suffer repeated whipsaws in sideways markets. This strategy seeks a balance through trend filters to limit major losses, momentum scores to capture upside opportunities, and allocation across multiple assets to reduce exposure to any single asset.

## Core Logic

The strategy uses a **two-layer structure**:

- **Risk-asset layer**: dynamically score and allocate among ETFs covering quality growth, value, low-volatility dividends, dividend quality, gold, and other exposures. The main considerations are practical execution for A-share investors and relatively low correlations.
- **Short-term financing bond ETF layer**: use ETF **511360** as a cash-management allocation when no eligible risk assets are available, after risk-control exits, or for allocations left over after overheating constraints.

The core rules are: **use trend filters for entry and exit, momentum scores for weights, overheating controls to limit chasing rallies, and drawdown controls to protect capital**.

## Features

| Feature                          | Description                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Low trading frequency**        | Main rebalancing is monthly, with no intraday trading, making execution more practical for investors with full-time jobs. |
| **Trend filters**                | Combine the MA200 moving average with its slope to avoid premature bottom-fishing.                                        |
| **Dynamic defensive allocation** | Adjust the short-term financing bond ETF allocation from 10% to 100% based on eligible-asset breadth.                     |
| **Staged entries**               | Establish 50% of a new position first and add the remainder once conditions are met, reducing the risk of chasing highs.  |
| **Adaptive risk controls**       | Adjust drawdown thresholds based on volatility, trend strength, and liquidity.                                            |
| **Overheating constraints**      | Monitor BIAS20 deviation to limit chasing rallies in extreme markets.                                                     |

## Backtest Summary

| Year                     | Strategy Return | Strategy Max Drawdown | Strategy Sharpe | 510300 Return | 510300 Max Drawdown | 510300 Sharpe |
| ------------------------ | --------------- | --------------------- | --------------- | ------------- | ------------------- | ------------- |
| 2020                     | 3.15%           | -3.09%                | 0.84            | 31.11%        | -18.22%             | 1.19          |
| 2021                     | 2.81%           | -0.17%                | 7.96            | -5.24%        | -18.52%             | -0.13         |
| 2022                     | -3.47%          | -4.63%                | -1.38           | -21.37%       | -29.53%             | -1.05         |
| 2023                     | 7.16%           | -2.04%                | 1.96            | -10.71%       | -21.30%             | -0.72         |
| 2024                     | 9.91%           | -4.53%                | 1.71            | 20.11%        | -13.13%             | 0.85          |
| 2025                     | 19.98%          | -3.90%                | 2.29            | 25.20%        | -10.62%             | 1.37          |
| 2026 through early April | 0.75%           | -10.88%               | 0.58            | -4.91%        | -7.63%              | -0.78         |

**Note**: 2022 was the only full calendar year with a loss in this backtest. The CSI 300 fell approximately 21.4%, while the strategy lost approximately 3.5%, showing some defensive characteristics. Historical backtests do not predict future returns; substantial drawdowns remain possible in extreme markets. The larger drawdown in 2026 was mainly driven by a gold correction.

## Intended Users and Risks

**Intended users**:

- Long-term investors seeking steady growth with less pronounced volatility.
- Investors who accept trend following and the possibility of missing some market rallies.
- Investors with basic ETF trading experience who understand the strategy's logic.

**Principal risks**:

- **Trend failure**: repeated whipsaws and accumulated small losses in sideways markets.
- **Black swan events**: sudden adverse developments can exhaust liquidity and undermine risk controls.
- **Parameter failure**: structural changes in markets can invalidate historical patterns.
- **Execution risk**: practical issues such as ETF trading suspensions and large premiums or discounts.
