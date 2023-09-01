"use client";

import { useEffect, useRef, useState } from "react";
import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import { throttle } from "lodash-es";
import GPUShareTreeMap from "components/GPUShareTreeMap";
import GPUPerformanceShareScatterPlot from "components/GPUPerformanceShareScatterPlot";
import GPUCovidLineChart from "components/GPUCovidLineChart";
import GPUShareCryptoPieChart from "components/GPUShareCryptoPieChart";

const parallaxPageConfig = {
  gpuShares: {
    start: 1.5,
    end: 5,
  },
  gpuPerformance: {
    start: 6.74,
    end: 7.04,
  },
  gpuCovid: {
    start: 8.9,
    end: 12.5,
  },
  gpuCrypto: {
    start: 13.93,
    end: 17.43,
  },
};

const parallaxTimeLineConfig = [
  {
    offset: 0,
    date: "Jan 31, 2020",
    content:
      "WHO declared the COVID-19 outbreak a Public Health Emergency of International Concern.",
  },
  {
    offset: 0.8,
    date: "Sept 17, 2020",
    content: "NVIDIA GeForce RTX 3080 was released.",
  },
  {
    offset: 1.1,
    date: "Dec 14, 2020",
    content:
      "Sandra Lindsay, a nurse in New York, becomes the first American outside of clinical trials to receive a COVID-19 vaccine.",
  },
  {
    offset: 1.3,
    date: "Feb 25, 2021",
    content: "NVIDIA GeForce RTX 3060 was released.",
  },
  {
    offset: 1.57,
    date: "May 18, 2021",
    content:
      "NVIDIA officially announced new RTX 3080, RTX 3070, RTX 3060 Ti that include the cryptocurrency mining hash rate limiter.",
  },
  {
    offset: 2.31,
    date: "Jan 1, 2022",
    content:
      "Europe passed 100 million cases amidst a surge in the Omicron variant.",
  },
  {
    offset: 3.06,
    date: "Oct 21, 2022",
    content:
      "The United States surpassed 99 million cases of COVID-19, the most cases of any country.",
  },
  {
    offset: 3.3,
    date: "Nov 11, 2022",
    content:
      'WHO reported that deaths since the month of February have dropped 90 percent. Director-General Tedros Adhanom Ghebreyesus said this was "cause for optimism".',
  },
];

function interpolateBlur(
  start: number,
  end: number,
  startDelta: number,
  endDelta: number,
) {
  const a1 = start + startDelta;
  const a2 = end - endDelta;
  return function (x: number) {
    if (x < start || x > end) {
      return 0;
    } else if (x >= start && x < a1) {
      return 0;
    } else if (x >= a1 && x < (a1 + a2) / 2) {
      return (2 * (x - a1)) / (a2 - a1);
    } else if (x >= (a1 + a2) / 2 && x < a2) {
      return 2 - (2 * (x - a1)) / (a2 - a1);
    } else if (x >= a2 && x < end) {
      return 0;
    } else {
      return 0;
    }
  };
}

const layerClassName =
  "mx-auto py-20 px-6 pointer-events-none prose dark:prose-invert bg-transparent sm:prose-lg md:prose-lg lg:prose-lg xl:prose-lg 2xl:prose-xl";

const HomePage: React.FC = () => {
  const parallaxRef = useRef<IParallax>(null);

  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    if (!parallaxRef.current || !parallaxRef.current.container.current) {
      return;
    }

    const parallaxContainer = parallaxRef.current.container
      .current as HTMLDivElement;
    const handleScroll = throttle((e: Event) => {
      if (parallaxRef.current) {
        setParallaxOffset(
          parallaxRef.current.current / parallaxRef.current.space,
        );
      }
    }, 100);
    parallaxContainer.addEventListener("scroll", handleScroll);
    return () => {
      parallaxContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <article>
      <Parallax
        ref={parallaxRef}
        pages={21.46}
        className="relative"
        innerStyle={{ zIndex: 50, pointerEvents: "none" }}
      >
        <ParallaxLayer className={`${layerClassName}`} offset={0}>
          <h1 style={{ lineHeight: 1.25 }}>
            Adaptation and Adoption: Analyzing GPU Trends Among PC Gamers During
            COVID-19 and Crypto Craze
          </h1>
          <time className="italic font-medium">March 2023</time>
          <p>
            Over the past three years, the world has been facing unprecedented
            challenges due to the COVID-19 pandemic and the resulting economic
            downturn. The PC gaming industry has been no exception, with many
            gamers forced to adapt to the new reality of remote work and social
            distancing. At the same time, the crypto craze has caused waves in
            the technology sector, with cryptocurrency mining driving up demand
            for high-performance graphics cards (GPUs).
          </p>
          <p>
            {`In this interactive visual explainer, we explore how PC gamers
              have adapted to these changes and examine the trends in GPU
              adoption during this challenging time. Our analysis focuses on
              data from Steam's hardware surveys, which provide a unique insight
              into the hardware distribution among PC gamers. By examining the
              adoption of both new and outgoing GPUs, we look into the evolving landscape of PC gaming
              hardware.`}
          </p>
          <section className="bg-white dark:bg-black pb-2">
            <h2>Overview</h2>
            <p>
              {`To gain a comprehensive understanding of PC gaming hardware during the COVID-19 pandemic and crypto
                craze, we turn to Steam's hardware surveys. Steam is the world's
                largest online store for PC games, boasting millions of users
                worldwide. In addition to selling games, Steam also collects
                data on the hardware configurations of its users' computers,
                including information on the types of GPUs they are
                using. These surveys provide a valuable source of data on the
                adoption and usage of different types of hardware among PC
                gamers. In this first section, we present a treemap
                visualization that offers an overview of the GPU share
                percentage of all cards in the dataset, from the start of the
                pandemic to the present day. This visualization enables us to
                identify the most popular GPUs among PC gamers and to
                observe how their market share has changed over time. By
                examining these trends, we can begin to gain insights into the
                ways in which COVID-19 and crypto prices have affected the
                adoption of different types of GPUs.`}
            </p>
          </section>
        </ParallaxLayer>
        <ParallaxLayer
          className={`${layerClassName} items-center flex z-30`}
          sticky={{
            start: parallaxPageConfig.gpuShares.start,
            end: parallaxPageConfig.gpuShares.end,
          }}
        >
          <GPUShareTreeMap
            height={600}
            progress={
              parallaxOffset > parallaxPageConfig.gpuShares.start
                ? (parallaxOffset - parallaxPageConfig.gpuShares.start) /
                  (parallaxPageConfig.gpuShares.end -
                    parallaxPageConfig.gpuShares.start)
                : 0
            }
          />
        </ParallaxLayer>
        {parallaxTimeLineConfig.map((config) => (
          <ParallaxLayer
            key={config.date}
            className={`${layerClassName} justify-end items-center flex`}
            offset={config.offset + parallaxPageConfig.gpuShares.start}
          >
            <div className="bg-white dark:bg-black w-64 shadow-xl dark:shadow-none dark:border-gray-600 dark:border-2 rounded-lg px-4 -mr-72">
              <p
                className="prose-md dark:prose-invert font-semibold"
                style={{ marginBottom: "0.25em" }}
              >
                {config.date}
              </p>
              <p className="prose-base" style={{ marginTop: "0.25em" }}>
                {config.content}
              </p>
            </div>
          </ParallaxLayer>
        ))}
        <ParallaxLayer
          className={layerClassName}
          offset={parallaxPageConfig.gpuShares.end + 0.9}
        >
          <section>
            <p>
              As evident from the treemap plot, NVIDIA GPUs have consistently
              been the top choice among PC gamers, followed by AMD and Intel.
              However, as most PCs come equipped with both a high-performance
              discrete NVIDIA or AMD GPU and a mediocre integrated Intel GPU,
              the real competition for gaming GPUs is between NVIDIA and AMD.
            </p>
            <p>
              Surprisingly, the NVIDIA GeForce GTX 1060 held its position as the
              most popular GPU for an extended period of time during the
              pandemic, and even its designated successor, the RTX 2060, failed
              to dethrone it. In fact, the RTX 3060 took over the third spot
              from the RTX 2060 at the start of 2023. Notably, the 20 series
              GPUs had poor adoption rates among gamers, who seemed to prefer
              their old GTX 1060 or the newer budget-friendly version of the 20
              series equivalent, the GTX 1650.
            </p>
          </section>
          <section className="bg-white dark:bg-black pb-2">
            <h2>Performance vs Popularity</h2>
            <p>
              Despite the dominance of NVIDIA and AMD in the gaming GPU market,
              not all cards are created equal. As we saw in the previous
              section, the NVIDIA GeForce GTX 1060 remained the most popular GPU
              among PC gamers for an extended period of time during the
              pandemic, even as newer cards were released. But what factors
              contributed to its sustained popularity, and how did the marketing
              and performance of other cards affect their adoption rates? In
              this section, we dive deeper into the GPU benchmark data to
              explore these questions.
            </p>
          </section>
        </ParallaxLayer>
        <ParallaxLayer
          className={`${layerClassName} items-center flex`}
          sticky={{
            start: parallaxPageConfig.gpuPerformance.start,
            end: parallaxPageConfig.gpuPerformance.end,
          }}
        >
          <GPUPerformanceShareScatterPlot
            height={500}
            inView={
              parallaxOffset >=
                parallaxPageConfig.gpuPerformance.start + 0.01 &&
              parallaxOffset <= parallaxPageConfig.gpuPerformance.end - 0.01
            }
          />
        </ParallaxLayer>
        <ParallaxLayer
          className={layerClassName}
          offset={parallaxPageConfig.gpuPerformance.end + 0.9}
        >
          <section>
            <p>
              {`The visualization of the dataset suggests that higher GPU model
                numbers generally correspond to better performance. As expected,
                high-end GPUs with higher marketing positions and hence higher
                prices have lower adoption rates. In contrast, entry-to-mid
                level GPUs like the GTX 1060 and RTX 2060 have shown more
                resilience in their adoption rates, with bigger share jumps and
                less dramatic drops. Additionally, it's worth noting that
                ultra high-end cards like the RTX 3090 consistently make up
                less than 1% of total shares. One interesting finding is that the GTX 1650, despite its lower
                performance, overtook the GTX 1060 at the end of 2022. This
                could be due to its availability and favorable promotion by PC
                manufacturers.`}
            </p>
            <p>
              Overall, our analysis suggests that while performance is certainly
              a key factor, other factors such as availability and marketing
              play a significant role in the adoption of GPUs among PC gamers.
            </p>
          </section>
          <section className="bg-white dark:bg-black pb-2">
            <h2>The Pandemic</h2>
            <p>
              The COVID-19 pandemic has had far-reaching consequences,
              disrupting not only our daily lives but also global supply chains,
              causing a severe shortage of computer chips. As GPUs heavily rely
              on the most advanced chip design, this has had a direct impact on
              their production and availability. But how has this affected the
              adoption and availability of GPUs worldwide? Did the pandemic and
              chip shortage have a different impact from countries that are
              major suppliers of GPUs like China, compared to major consumer
              countries like the United States? Moreover, did different GPUs
              react differently?
            </p>
          </section>
        </ParallaxLayer>
        <ParallaxLayer
          className={`${layerClassName} items-center flex`}
          sticky={{
            start: parallaxPageConfig.gpuCovid.start,
            end: parallaxPageConfig.gpuCovid.end,
          }}
          style={{
            filter: `blur(${
              (parallaxOffset <=
              (parallaxPageConfig.gpuCovid.start +
                parallaxPageConfig.gpuCovid.end) /
                2 -
                0.3
                ? interpolateBlur(
                    parallaxPageConfig.gpuCovid.start,
                    (parallaxPageConfig.gpuCovid.start +
                      parallaxPageConfig.gpuCovid.end) /
                      2,
                    0.3,
                    0.3,
                  )(parallaxOffset)
                : interpolateBlur(
                    (parallaxPageConfig.gpuCovid.start +
                      parallaxPageConfig.gpuCovid.end) /
                      2,
                    parallaxPageConfig.gpuCovid.end - 0.25,
                    0.15,
                    0,
                  )(parallaxOffset)) * 48
            }px)`,
          }}
        >
          <GPUCovidLineChart
            height={500}
            showOnly30seriesData={
              parallaxOffset <=
              (parallaxPageConfig.gpuCovid.start +
                parallaxPageConfig.gpuCovid.end) /
                2 -
                0.3
            }
            showCustomizedControls={
              parallaxOffset >= parallaxPageConfig.gpuCovid.end - 0.8
            }
          />
        </ParallaxLayer>
        <ParallaxLayer
          className={`${layerClassName}`}
          offset={parallaxPageConfig.gpuCovid.start + 1.1}
        >
          <section>
            <p>
              {`During the pandemic, the release of NVIDIA's RTX 30 series,
                marketed as "Ultimate Ray Tracing and AI," was met with limited
                enthusiasm from PC gamers due to the high prices and limited
                support for ray tracing technology in games. The mid-level
                GPUs, such as the RTX 3060, RTX 3060 Ti, and RTX 3050, saw
                higher growth rates during this time.`}
            </p>
            <p>
              Looking at the relationship between COVID-19 and GPU adoption, we
              see that after the first wave of the pandemic, the shares of RTX
              3060 and RTX 3060 Ti increased while the shares of RTX 3090 and
              RTX 3080 remained stable. After the spike in cases caused by the
              Omicron variant, many 30 series GPUs saw an increase in shares as
              COVID-19 cases decreased. However, shares of the high-end RTX 3080
              Ti and RTX 3090 remained relatively unchanged throughout the
              pandemic.
            </p>
          </section>
        </ParallaxLayer>
        <ParallaxLayer
          className={`${layerClassName}`}
          offset={parallaxPageConfig.gpuCovid.start + 2.7}
        >
          <section>
            <p>
              The NVIDIA GTX 1060 remains one of the most popular graphics cards
              in the gaming world, even years after its release. It was
              affordable and handled AAA games well, which contributed to its
              astonishing adoption rate. Surprisingly, the pandemic prolonged
              its popularity even as newer models were released.
            </p>
            <p>
              {`The RTX 2060 and RTX 3060 were intended to replace the GTX 1060,
                but they were not as successful in terms of adoption rate. This
                may be due to NVIDIA's marketing shift and price gouging
                strategies. However, the pandemic also played a significant role
                in preserving the GTX 1060's popularity and making it difficult
                for gamers to acquire the newer models.`}
            </p>
            <p>
              As the pandemic comes to an end, it will be interesting to see if
              the popularity of the GTX 1060 continues or if gamers will finally
              switch to newer models.
            </p>
            <br />
            <p className="italic font-semibold">
              Continue scrolling and explore more by selecting different
              countries and playing with various GPU selections. For example,
              choose China and select 80 suffixed GPUs from NVIDIA. What
              interesting patterns or trends can you discover?
            </p>
          </section>
        </ParallaxLayer>
        <ParallaxLayer
          className={`${layerClassName}`}
          offset={parallaxPageConfig.gpuCovid.end + 0.9}
        >
          <section className="bg-white dark:bg-black pb-2">
            <h2>Crypto Craze</h2>
            <p>
              As the COVID-19 pandemic caused disruptions to global supply
              chains and chip shortages, the gaming industry has been facing
              challenges in the production and availability of GPUs. At the same
              time, the rise of cryptocurrency mining has created additional
              demand for GPUs, further driving up prices and exacerbating the
              scarcity of GPUs in the market. In this section, we will explore
              the correlation between the adoption of GPUs and the price of
              Ethereum (ETH), one of the most popular cryptocurrencies at the
              time, through a pie chart visualization of GPU shares with ETH
              price as the radius. We will discuss how the crypto craze has
              affected the availability and affordability of GPUs for gamers.
            </p>
          </section>
        </ParallaxLayer>
        <ParallaxLayer
          className={`${layerClassName} items-center flex z-30`}
          sticky={{
            start: parallaxPageConfig.gpuCrypto.start,
            end: parallaxPageConfig.gpuCrypto.end,
          }}
        >
          <GPUShareCryptoPieChart
            height={600}
            progress={
              parallaxOffset > parallaxPageConfig.gpuCrypto.start
                ? (parallaxOffset - parallaxPageConfig.gpuCrypto.start) /
                  (parallaxPageConfig.gpuCrypto.end -
                    parallaxPageConfig.gpuCrypto.start)
                : 0
            }
          />
        </ParallaxLayer>
        <ParallaxLayer
          className={`${layerClassName}`}
          offset={parallaxPageConfig.gpuCrypto.end + 0.9}
        >
          <section>
            <p>
              {`Despite the global pandemic, the cryptocurrency market continued
                to surge, with Ethereum's price skyrocketing from $200 to a peak
                of $4000 in November 2021. However, this craze didn't seem to
                have much impact on the GPU market share, which was still
                dominated by the 50 and 60 suffixed models. Surprisingly, the
                demand for computing power for ETH mining didn't significantly
                affect the adoption of 30 series GPUs, as most GPUs that could
                handle mining were high-end models with negligible shares during
                the period. Additionally, large-scale miners typically use
                specialized computer chips (ASIC, application-specific integrated
                  circuit), which aren't in direct competition with consumer
                GPUs. It's worth noting that NVIDIA also released several GPUs
                that limited cryptocurrency mining hash rate in May 2021.`}
            </p>
            <p>
              Therefore, it seems that gamers who blamed crypto for the shortage
              of GPUs may have had a weaker argument, as the supply chain issues
              and scalper hoarding might be the main factors impacting
              availability. Despite the hype around cryptocurrency, the GPU
              market remained largely unaffected by the craze.
            </p>
          </section>
          <section>
            <h2>Epilogue</h2>
            <p>
              {`In conclusion, the COVID-19 pandemic has had profound effects on the global supply chains, causing a severe shortage of computer chips and impacting the production and availability of GPUs, which are critical components in gaming PCs. Our analysis using data from Steam's hardware surveys has shown that NVIDIA GPUs continue to be the top choice among PC gamers, followed by AMD and Intel. The trends in GPU adoption among PC gamers during the pandemic and crypto craze has shown that the adoption of the new RTX 30 series was not as good as the GTX 10 series, due to limited availability and increased prices, except for the mid-level GPUs such as RTX 3060, RTX 3060 Ti, and RTX 3050. Interestingly, the crypto craze did not seem to have much impact on 30 series GPU adoption. Overall, our analysis provides valuable insights into the ways in which the pandemic and crypto prices have affected the adoption of different types of graphics cards among PC gamers, emphasizing that the adoption of GPUs is not only driven by performance but also availability and pricing.`}
            </p>
          </section>
          <section>
            <h2>Author</h2>
            <p>
              <a
                className="pointer-events-auto"
                href="https://ruiying.io"
                target="_blank"
              >
                Rui Ying
              </a>
            </p>
            <p className="italic">
              {`Master's student in Computer Science`}
              <br />
              Stanford University
            </p>
            <p className="italic">
              This project was made for the class CS 448B Data Visualization.
            </p>
          </section>
          <section>
            <h2>Data and Methods</h2>
            <h3>Source Code</h3>
            <p>
              <a
                className="pointer-events-auto"
                href="https://github.com/robertying/gpu-covid-visualization"
                target="_blank"
              >
                robertying/gpu-covid-visualization - GitHub
              </a>
            </p>
            <h3>Data Sources</h3>
            <ul>
              <li>
                Steam Hardware Surveys (GPU Shares):{" "}
                <a
                  className="pointer-events-auto"
                  href="https://github.com/jdegene/steamHWsurvey"
                  target="_blank"
                >
                  jdegene/steamHWsurvey - GitHub
                </a>
              </li>
              <li>
                GPU Benchmarks:{" "}
                <a
                  className="pointer-events-auto"
                  href="https://www.reddit.com/r/buildapc/comments/w3xo1c/compiled_3dmark_time_spy_results_of_various_gpus/"
                  target="_blank"
                >
                  Compiled 3DMark Time Spy Results of Various GPUs - Reddit
                </a>
              </li>
              <li>
                COVID-19 Cases (Index & Epidemiology):{" "}
                <a
                  className="pointer-events-auto"
                  href="https://health.google.com/covid-19/open-data/raw-data"
                  target="_blank"
                >
                  COVID-19 Open Data Repository - Google
                </a>
              </li>
              <li>
                Ethereum Prices:{" "}
                <a
                  className="pointer-events-auto"
                  href="https://query1.finance.yahoo.com/v7/finance/download/ETH-USD?period1=1546300800&period2=1677628800&interval=1mo&events=history&includeAdjustedClose=true"
                  target="_blank"
                >
                  ETH-USD - Yahoo Finance
                </a>
              </li>
            </ul>
            <h3>Data Processing</h3>
            <p>
              GPU Benchmarks were taken from the website, saved in a CSV file
              and then manually processed into a JSON file. To make the data
              consistent with Steam Hardware Surveys, some GPU SKUs and their
              scores were merged. For example, GTX 1060 6G and GTX 1060 3G were
              put together as one GTX 1060 with their scores averaged.
            </p>
            <p>
              For all other datasets, processing was done using JavaScript
              scripts. See{" "}
              <a
                className="pointer-events-auto"
                href="https://github.com/robertying/gpu-covid-visualization/tree/main/scripts"
                target="_blank"
              >
                the source code
              </a>
              .
            </p>
          </section>
        </ParallaxLayer>
      </Parallax>
    </article>
  );
};

export default HomePage;
