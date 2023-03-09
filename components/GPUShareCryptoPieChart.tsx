import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useTransition, animated } from "@react-spring/web";
import { usePopper } from "react-popper";
import dayjs from "dayjs";
import Colors from "lib/colors";
import useWidth from "lib/useWidth";
import { ethData, getGpuSharesByDateData, GPUShareDatum } from "data";

const getGPUName = (name: string) => {
  return name.substring(name.indexOf(" ") + 1);
};

const animationDuration = 600;

interface GPUShareCryptoPieChartProps {
  height: number;
  progress: number;
}
const GPUShareCryptoPieChart: React.FC<GPUShareCryptoPieChartProps> = ({
  height,
  progress,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGGElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);

  const [popperReferenceElement, setPopperReferenceElement] =
    useState<Element | null>(null);
  const { styles: popperStyles, attributes: popperAttributes } = usePopper(
    popperReferenceElement,
    popperRef.current,
    {
      placement: "auto",
      modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
    }
  );

  const width = useWidth(parentRef);

  const [loading, setLoading] = useState(true);
  const [gpuData, setGpuData] = useState<Record<string, GPUShareDatum[]>>({});

  const dataDates = useMemo(() => Object.keys(gpuData), [gpuData]);
  const startDateIndex = useMemo(
    () => dataDates.indexOf("2020-01-01"),
    [dataDates]
  );
  const date =
    dataDates[
      Math.floor(progress * (dataDates.length - startDateIndex)) +
        startDateIndex
    ] ?? dataDates[dataDates.length - 1];

  const ethPrice = ethData[date] ?? 0;
  const ethPriceStringObj = ("$" + ethPrice.toFixed(2))
    .split("")
    .reverse()
    .map((d, i) => ({
      value: d,
      index: i,
    }))
    .reverse();

  const pieData = useMemo(() => {
    const data = gpuData[date];
    if (!data) {
      return [];
    }

    return d3
      .pie<GPUShareDatum>()
      .value((d) => d.percentage)
      .sort((a, b) =>
        a.manufacturer === "Other"
          ? 1
          : b.manufacturer === "Other"
          ? -1
          : b.percentage - a.percentage
      )(data);
  }, [date, gpuData]);

  const radiusScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, 4700])
        .range([0, height / 2]),
    [height]
  );
  const outerRadius = radiusScale(ethPrice) - 1;

  const arc = useMemo(
    () =>
      d3
        .arc<d3.PieArcDatum<GPUShareDatum>>()
        .innerRadius(0)
        .outerRadius(outerRadius),
    [outerRadius]
  );
  const labelRadius = outerRadius + 8;
  const arcLabel = useMemo(
    () =>
      d3
        .arc<d3.PieArcDatum<GPUShareDatum>>()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius),
    [labelRadius]
  );

  const labelData = useMemo(
    () =>
      pieData
        .filter(
          (d) =>
            outerRadius > height / 5 &&
            d.endAngle - d.startAngle > 0.15 &&
            d.data.manufacturer !== "Other"
        )
        .map((d) => ({
          ...d,
          left: arcLabel.centroid(d)[0] + width / 2,
          top: arcLabel.centroid(d)[1] + height / 2 - 8,
        })),
    [arcLabel, height, outerRadius, pieData, width]
  );

  const categoryColorScale = useMemo(
    () =>
      d3
        .scaleOrdinal<string>()
        .domain(["AMD", "NVIDIA", "Intel", "Other"])
        .range([
          Colors.amdColor,
          Colors.nvidiaColor,
          Colors.intelColor,
          "lightgrey",
        ]),
    []
  );

  useEffect(() => {
    (async () => {
      const gpuSharesByDateData = await getGpuSharesByDateData();
      setGpuData(gpuSharesByDateData);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const t = d3
      .transition()
      .duration(animationDuration)
      .ease(d3.easeCubicInOut);

    const pies = d3
      .select(chartRef.current)
      .selectAll<SVGPathElement, d3.PieArcDatum<GPUShareDatum>>("path")
      .data(pieData, (d) => d.data.name)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => arc(d))
            .attr("fill", (d) => categoryColorScale(d.data.manufacturer))
            .attr("stroke", "white")
            .attr("stroke-width", "0.01rem")
            .attr("opacity", 0)
            .property("_current", (d) => d)
            .style("pointer-events", "auto")
            .on("mouseover", function () {
              d3.select(this).attr("opacity", 1);
              setPopperReferenceElement(this);
            })
            .on("mouseout", function () {
              d3.select(this).attr("opacity", 0.8);
              setPopperReferenceElement(null);
            }),
        (update) =>
          update
            .transition(t)
            .attr("d", (d) => arc(d))
            .attr("fill", (d) => categoryColorScale(d.data.manufacturer)),
        (exit) => exit.transition(t).attr("opacity", 0).remove()
      );
    pies
      .transition(t)
      .attr("opacity", 0.8)
      .attr("d", (d) => arc(d))
      .attr("fill", (d) => categoryColorScale(d.data.manufacturer))
      .style("pointer-events", "auto");
  }, [arc, categoryColorScale, pieData]);

  const labelTransitions = useTransition(labelData, {
    keys: (d) => d.data.name,
    from: (d) => ({
      opacity: 0,
      left: d.left,
      top: d.top,
      marginRight: -9999,
    }),
    enter: (d) => ({
      opacity: 1,
      left: d.left,
      top: d.top,
    }),
    update: (d) => ({
      left: d.left,
      top: d.top,
    }),
    leave: { opacity: 0 },
    config: { duration: animationDuration, easing: d3.easeCubicInOut },
  });

  const dateTransitions = useTransition(date, {
    keys: null,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: animationDuration, easing: d3.easeCubicInOut },
  });

  const digitTransitions = useTransition(ethPriceStringObj, {
    keys: (d) => d.index + d.value,
    from: (d) => ({
      opacity: 0,
      transform: "translateY(10px)",
      right: 10 * d.index,
    }),
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(-10px)" },
    config: { duration: animationDuration, easing: d3.easeCubicInOut },
  });

  if (loading) {
    return (
      <div
        ref={parentRef}
        className="w-full flex justify-center items-center bg-gray-200 dark:bg-gray-700"
        style={{ height }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full h-24">
        <div className="ml-1 mb-4 flex items-center space-x-3">
          <div className="flex items-center">
            <div
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: Colors.nvidiaColor }}
            />
            <div className="text-sm">NVIDIA</div>
          </div>
          <div className="flex items-center">
            <div
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: Colors.amdColor }}
            />
            <div className="text-sm">AMD</div>
          </div>
          <div className="flex items-center">
            <div
              className="w-2 h-2 rounded-full bg-intel mr-1"
              style={{ backgroundColor: Colors.intelColor }}
            />
            <div className="text-sm">Intel</div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-gray-300 mr-1" />
            <div className="text-sm">Other</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {dateTransitions((style, date) => (
              <animated.div
                className="absolute tabular-nums font-mono ml-1"
                style={style}
              >
                {dayjs(date).format("MMM YYYY")}
              </animated.div>
            ))}
          </div>
          <div className="ml-auto relative">
            <div className="absolute right-10 w-36">ETH-USD:</div>
            {digitTransitions((style, digit) => (
              <animated.span
                className="absolute tabular-nums font-mono"
                style={style}
              >
                {digit.value}
              </animated.span>
            ))}
          </div>
        </div>
      </div>
      <div ref={parentRef} className="w-full relative" style={{ height }}>
        <svg width="100%" height={height}>
          <g
            ref={chartRef}
            transform={`translate(${width / 2}, ${height / 2})`}
          />
        </svg>
        <div className="w-full text-center text-xs italic text-gray-700 dark:text-gray-200 mt-1">
          Hover over a pie to see the full GPU name and its share
        </div>
        <div className="pointer-events-none">
          {labelTransitions((style, d) => (
            <animated.div
              key={d.data.name}
              className="absolute text-black dark:text-white text-sm leading-none"
              style={style}
            >
              {getGPUName(d.data.name)}
            </animated.div>
          ))}
        </div>
      </div>
      <div
        ref={popperRef}
        style={{ ...popperStyles.popper, pointerEvents: "none" }}
        {...popperAttributes.popper}
      >
        {popperReferenceElement && (
          <div className="bg-white dark:bg-black rounded shadow-lg dark:shadow-none dark:border-gray-600 dark:border p-2">
            <div className="text-sm font-semibold">
              {(popperReferenceElement as any).__data__.data.name}
            </div>
            <div className="text-sm">
              {(
                (popperReferenceElement as any).__data__.data.percentage * 100
              ).toFixed(2)}
              %
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPUShareCryptoPieChart;
