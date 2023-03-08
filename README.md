# [Adaptation and Adoption: Analyzing GPU Trends Among PC Gamers During COVID-19 and Crypto Craze](https://visualization.ruiying.io/adaptation-and-adoption-analyzing-gpu-trends-among-pc-gamers-during-covid-19-and-crypto-craze)

> An interactive visual explainer built with D3.js and React.js
>
> Made for CS 448B Data Visualization, Stanford University

https://visualization.ruiying.io/adaptation-and-adoption-analyzing-gpu-trends-among-pc-gamers-during-covid-19-and-crypto-craze

In this interactive visual explainer, we delve into the world of PC gaming hardware trends during the COVID-19 pandemic and crypto craze, with a particular focus on graphics cards (GPUs). Using data from Steam's hardware surveys, we analyze the adoption of new and outgoing graphics cards, examine the impact of COVID-19 and crypto prices on GPU adoption, and provide insights into the evolving landscape of PC gaming hardware.

## Data & Methods

### Data Sources

- Steam Hardware Surveys (GPU Shares): [jdegene/steamHWsurvey - GitHub](https://github.com/jdegene/steamHWsurvey)
- GPU Benchmarks: [Compiled 3DMark Time Spy Results of Various GPUs - Reddit](https://www.reddit.com/r/buildapc/comments/w3xo1c/compiled_3dmark_time_spy_results_of_various_gpus/)
- COVID-19 Cases (Index & Epidemiology): [COVID-19 Open Data Repository - Google](https://health.google.com/covid-19/open-data/raw-data)
- Ethereum Prices: [ETH-USD - Yahoo Finance](https://query1.finance.yahoo.com/v7/finance/download/ETH-USD?period1=1546300800&period2=1677628800&interval=1mo&events=history&includeAdjustedClose=true)

Raw datasets can be found in [datasets/raw](./datasets/raw).

Processed datasets can be found in [datasets](./datasets).

### Data Processing

GPU Benchmarks were taken from the website, saved in a CSV file and then manually processed into a JSON file. To make the data consistent, some GPU SKUs and their scores were merged. For example, GTX 1060 6G and GTX 1060 3G were put together as one GTX 1060 with the score of both averaged.

For all other datasets, processing was done using JavaScript scripts. See [scripts](./scripts).

Some of more specific processing on Steam data was done on the fly. See [data](./data/index.ts).
