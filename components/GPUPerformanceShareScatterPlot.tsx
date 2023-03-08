import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useTransition, animated } from "@react-spring/web";
import { usePopper } from "react-popper";
import dayjs from "dayjs";
import Colors from "lib/colors";
import useWidth from "lib/useWidth";
import { getGpuSharesByDateData, gpuBenchmarkData, GPUShareDatum } from "data";

const getGPUName = (name: string) => {
  return name.split(" ").slice(2).join(" ");
};

const Margins = { top: 40, right: 10, bottom: 40, left: 50 };
const animationDuration = 600;

interface GPUPerformanceShareScatterPlotProps {
  height: number;
  inView: boolean;
}
const GPUPerformanceShareScatterPlot: React.FC<
  GPUPerformanceShareScatterPlotProps
> = ({ height, inView }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGGElement>(null);
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
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
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const dataDates = useMemo(() => Object.keys(gpuData), [gpuData]);
  const date = dataDates[index];

  const data = useMemo(
    () => gpuData[date]?.filter((d) => gpuBenchmarkData[d.name]) ?? [],
    [gpuData, date]
  );

  const xScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, 16])
        .range([Margins.left, width - Margins.right])
        .nice(),
    [width]
  );
  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, 21000])
        .range([height - Margins.bottom, Margins.top])
        .nice(),
    [height]
  );

  useEffect(() => {
    (async () => {
      const gpuSharesByDateData = await getGpuSharesByDateData();
      setGpuData(gpuSharesByDateData);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!chartRef.current || !xAxisRef.current || !yAxisRef.current) {
      return;
    }

    d3.select(xAxisRef.current).call(d3.axisBottom(xScale));
    d3.select(yAxisRef.current).call(d3.axisLeft(yScale));

    const chart = d3.select(chartRef.current);

    const t = d3
      .transition()
      .duration(animationDuration)
      .ease(d3.easeCubicInOut);

    const dots = chart
      .selectAll<SVGCircleElement, GPUShareDatum>("circle")
      .data(data, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", (d) => xScale(d.percentage * 100))
            .attr("cy", (d) => yScale(gpuBenchmarkData[d.name]))
            .attr("fill", (d) =>
              d.manufacturer === "NVIDIA" ? Colors.nvidiaColor : Colors.amdColor
            )
            .attr("opacity", 0)
            .attr("r", 5)
            .style("pointer-events", "auto")
            .on("mouseover", function () {
              d3.select(this).attr("opacity", 1).attr("r", 8);
              setPopperReferenceElement(this);
            })
            .on("mouseout", function () {
              d3.select(this).attr("opacity", 0.75).attr("r", 5);
              setPopperReferenceElement(null);
            })
            .on("click", function () {
              d3.select(this).attr("opacity", 1).attr("r", 8);
              setPopperReferenceElement(this);
            }),
        (update) =>
          update
            .transition(t)
            .attr("cx", (d) => xScale(d.percentage * 100))
            .attr("cy", (d) => yScale(gpuBenchmarkData[d.name]))
            .attr("fill", (d) =>
              d.manufacturer === "NVIDIA" ? Colors.nvidiaColor : Colors.amdColor
            ),
        (exit) => exit.transition(t).attr("opacity", 0).attr("r", 0).remove()
      );
    dots
      .transition(t)
      .attr("cx", (d) => xScale(d.percentage * 100))
      .attr("cy", (d) => yScale(gpuBenchmarkData[d.name]))
      .attr("fill", (d) =>
        d.manufacturer === "NVIDIA" ? Colors.nvidiaColor : Colors.amdColor
      )
      .attr("opacity", 0.75)
      .attr("r", 5)
      .style("pointer-events", "auto");

    const labels = chart
      .selectAll<SVGTextElement, GPUShareDatum>("text")
      .data(data, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("text")
            .text((d) => getGPUName(d.name))
            .attr("x", (d) => xScale(d.percentage * 100))
            .attr("y", (d) => yScale(gpuBenchmarkData[d.name]) - 9)
            .attr("font-size", "0.5rem")
            .attr("opacity", 0)
            .style("text-anchor", "middle")
            .style("pointer-events", "none"),
        (update) =>
          update
            .transition(t)
            .attr("x", (d) => xScale(d.percentage * 100))
            .attr("y", (d) => yScale(gpuBenchmarkData[d.name]) - 9),
        (exit) => exit.transition(t).attr("opacity", 0).remove()
      );
    labels
      .transition(t)
      .attr("x", (d) => xScale(d.percentage * 100))
      .attr("y", (d) => yScale(gpuBenchmarkData[d.name]) - 9)
      .attr("opacity", 0.9)
      .attr("font-size", "0.5rem");
  }, [data, xScale, yScale]);

  useEffect(() => {
    if (inView) {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [inView]);

  useEffect(() => {
    if (playing) {
      setIndex((v) => (v + 1) % dataDates.length);
      const interval = setInterval(() => {
        setIndex((v) => (v + 1) % dataDates.length);
      }, animationDuration);
      return () => clearInterval(interval);
    }
  }, [dataDates.length, playing]);

  const handleDateChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setIndex(parseInt(e.target.value));
  };

  const handleStartStop = () => {
    setPlaying((v) => !v);
  };

  const dateTransitions = useTransition(date, {
    keys: null,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: animationDuration, easing: d3.easeCubicInOut },
  });

  if (loading) {
    return (
      <div
        ref={parentRef}
        className="w-full flex justify-center items-center bg-gray-200"
        style={{ height }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative h-16">
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
        </div>
        <div className="flex items-center justify-between">
          {dateTransitions((style, date) => (
            <animated.div
              className="absolute tabular-nums font-mono ml-1"
              style={style}
            >
              {dayjs(date).format("MMM YYYY")}
            </animated.div>
          ))}
          <div className="ml-auto flex items-center space-x-4 pointer-events-auto">
            <input
              className="w-48"
              type="range"
              min="0"
              max={dataDates.length - 1}
              value={index}
              onChange={handleDateChange}
            />
            <button
              className="bg-gray-200 hover:bg-gray-300 active:bg-opacity-60 font-semibold text-base py-1 px-2 w-20 rounded"
              onClick={handleStartStop}
            >
              {playing ? "Pause" : "Resume"}
            </button>
          </div>
        </div>
      </div>
      <div ref={parentRef} className="w-full relative" style={{ height }}>
        <svg width="100%" height={height}>
          <g ref={chartRef} />
          <g
            ref={xAxisRef}
            transform={`translate(0, ${height - Margins.bottom})`}
          >
            <text
              textAnchor="end"
              fill="black"
              fontSize="0.75rem"
              fontWeight="bold"
              x={width - Margins.right}
              y={35}
            >
              Hardware Share (%)
            </text>
          </g>
          <g ref={yAxisRef} transform={`translate(${Margins.left}, 0)`}>
            <text
              textAnchor="end"
              fill="black"
              fontSize="0.75rem"
              fontWeight="bold"
              transform={`translate(213, ${Margins.top - 15})`}
            >
              Performance Benchmark (3DMark Time Spy)
            </text>
          </g>
        </svg>
        <div className="w-full text-center text-xs italic text-gray-700 mt-1">
          Pause and hover over a dot to see the full GPU name, its benchmark and
          share
        </div>
      </div>
      <div
        ref={popperRef}
        style={{ ...popperStyles.popper, pointerEvents: "none" }}
        {...popperAttributes.popper}
      >
        {popperReferenceElement && (
          <div className="bg-white rounded shadow-lg p-2">
            <div className="text-sm font-semibold">
              {(popperReferenceElement as any).__data__.name}
            </div>
            <div className="text-sm">
              Benchmark:{" "}
              {gpuBenchmarkData[(popperReferenceElement as any).__data__.name]}
            </div>
            <div className="text-sm">
              Share:{" "}
              {(
                (popperReferenceElement as any).__data__.percentage * 100
              ).toFixed(2)}
              %
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPUPerformanceShareScatterPlot;
