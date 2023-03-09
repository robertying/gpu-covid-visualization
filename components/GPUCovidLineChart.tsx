import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { maxBy } from "lodash-es";
import { usePopper } from "react-popper";
import dayjs from "dayjs";
import useWidth from "lib/useWidth";
import {
  GPUShareDatum,
  CovidCaseDatum,
  getGpuSharesByNameData,
  getCovidCasesByCountryData,
  gpus,
} from "data";
import Chip from "./Chip";
import DropdownSearch from "./DropdownSearch";

const Margins = { top: 40, right: 80, bottom: 40, left: 50 };
const animationDuration = 600;
const _60SeriesDates = [new Date("2016-07-01"), new Date("2023-03-01")];
const _30SeriesDates = [new Date("2020-01-01"), new Date("2023-03-01")];
const bisect = d3.bisector<GPUShareDatumWithDate, Date>((d) => d.date).left;

const _30SeriesGpus = gpus.filter(
  (g) => g.startsWith("NVIDIA GeForce RTX 30") && !g.includes("Laptop")
);
const _60SeriesGpus = [
  "NVIDIA GeForce RTX 3060",
  "NVIDIA GeForce RTX 2060",
  "NVIDIA GeForce GTX 1060",
];

const getGPUName = (name: string) => {
  return name.substring(name.indexOf(" ") + 1);
};

type GPUShareDatumWithDate = Omit<GPUShareDatum, "date"> & { date: Date };
type CovidCaseDatumWithDate = Omit<CovidCaseDatum, "date"> & { date: Date };

interface GPUCovidLineChartProps {
  height: number;
  showOnly30seriesData: boolean;
  showCustomizedControls: boolean;
}
const GPUCovidLineChart: React.FC<GPUCovidLineChartProps> = ({
  height,
  showOnly30seriesData,
  showCustomizedControls,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const gpuLineRef = useRef<SVGGElement>(null);
  const covidLineRef = useRef<SVGGElement>(null);
  const xAxisRef = useRef<SVGGElement>(null);
  const gpuAxisRef = useRef<SVGGElement>(null);
  const covidAxisRef = useRef<SVGGElement>(null);
  const tooltipLineRef = useRef<SVGLineElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);

  const [popperReferenceElement, setPopperReferenceElement] =
    useState<Element | null>(null);
  const { styles: popperStyles, attributes: popperAttributes } = usePopper(
    popperReferenceElement,
    popperRef.current,
    {
      placement: "auto",
      modifiers: [{ name: "offset", options: { offset: [0, 100] } }],
    }
  );

  const width = useWidth(parentRef);

  const [loading, setLoading] = useState(true);
  const [gpuData, setGpuData] = useState<
    {
      name: string;
      values: GPUShareDatumWithDate[];
    }[]
  >([]);
  const [covidData, setCovidData] = useState<
    {
      name: string;
      values: CovidCaseDatumWithDate[];
    }[]
  >([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    "United States of America",
  ]);
  const [selectedGpus, setSelectedGpus] = useState<string[]>(_30SeriesGpus);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showCovidDates, setShowCovidDates] = useState(false);

  const countries = useMemo(() => covidData.map((d) => d.name), [covidData]);
  const selectedCovidData = useMemo(
    () => covidData.filter((d) => selectedCountries.includes(d.name)),
    [covidData, selectedCountries]
  );
  const selectedGpuData = useMemo(
    () => gpuData.filter((d) => selectedGpus.includes(d.name)),
    [gpuData, selectedGpus]
  );

  const hoveredGpuData = useMemo(
    () =>
      hoveredDate
        ? selectedGpuData
            .map((d) => ({
              name: d.name,
              value: d.values.find(
                (v) => v.date.getTime() === hoveredDate.getTime()
              ),
            }))
            .sort(
              (a, b) => (b.value?.percentage ?? 0) - (a.value?.percentage ?? 0)
            )
        : [],
    [hoveredDate, selectedGpuData]
  );

  const maxShare = useMemo(
    () =>
      (maxBy(
        Object.values(selectedGpuData)
          .map((o) => o.values)
          .flat(),
        (d) => d.percentage
      )?.percentage ?? 0) * 100,
    [selectedGpuData]
  );
  const maxCases = useMemo(
    () =>
      maxBy(
        Object.values(selectedCovidData)
          .map((o) => o.values)
          .flat(),
        (d) => d.newCases
      )?.newCases ?? 0,
    [selectedCovidData]
  );

  const xScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain(
          showOnly30seriesData || showCovidDates
            ? _30SeriesDates
            : _60SeriesDates
        )
        .range([Margins.left, width - Margins.right]),
    [showOnly30seriesData, showCovidDates, width]
  );
  const gpuShareScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, maxShare])
        .range([height - Margins.bottom, Margins.top])
        .nice(),
    [height, maxShare]
  );
  const newCaseScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, maxCases])
        .range([height - Margins.bottom, Margins.top])
        .nice(),
    [height, maxCases]
  );
  const gpuColorScale = useMemo(
    () =>
      d3
        .scaleOrdinal<string>()
        .domain(selectedGpuData.map((d) => d.name))
        .range(d3.schemeDark2),
    [selectedGpuData]
  );

  const gpuShareLine = useMemo(
    () =>
      d3
        .line<GPUShareDatumWithDate>()
        .x((d) => xScale(d.date))
        .y((d) => gpuShareScale(d.percentage * 100)),
    [xScale, gpuShareScale]
  );
  const newCaseLine = useMemo(
    () =>
      d3
        .line<CovidCaseDatumWithDate>()
        .x((d) => xScale(d.date))
        .y((d) => newCaseScale(d.newCases)),
    [xScale, newCaseScale]
  );

  useEffect(() => {
    (async () => {
      const gpuSharesByNameData = await getGpuSharesByNameData();
      const covidCasesByCountryData = await getCovidCasesByCountryData();
      const gpuData = Object.entries(gpuSharesByNameData).map(
        ([key, value]) => ({
          name: key,
          values: value.map((d) => ({
            ...d,
            date: new Date(d.date),
          })),
        })
      );
      const covidData = Object.entries(covidCasesByCountryData).map(
        ([key, value]) => ({
          name: key,
          values: value.map((d) => ({
            ...d,
            date: new Date(d.date),
          })),
        })
      );
      setGpuData(gpuData);
      setCovidData(covidData);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (showOnly30seriesData) {
      setSelectedGpus(_30SeriesGpus);
    } else {
      setSelectedGpus(_60SeriesGpus);
    }
  }, [showOnly30seriesData]);

  useEffect(() => {
    if (
      !gpuLineRef.current ||
      !covidLineRef.current ||
      !xAxisRef.current ||
      !gpuAxisRef.current ||
      !covidAxisRef.current
    ) {
      return;
    }

    const t = d3
      .transition()
      .duration(animationDuration)
      .ease(d3.easeCubicInOut);

    d3.select(xAxisRef.current).transition(t).call(d3.axisBottom(xScale));
    d3.select(gpuAxisRef.current)
      .transition(t)
      .call(d3.axisLeft(gpuShareScale));
    d3.select(covidAxisRef.current)
      .transition(t)
      .call(d3.axisRight(newCaseScale));

    const gpuLines = d3
      .select(gpuLineRef.current)
      .selectAll<SVGPathElement, GPUShareDatumWithDate>("path")
      .data(selectedGpuData, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => gpuShareLine(d.values))
            .attr("fill", "none")
            .attr("opacity", 0)
            .attr("stroke", (d) => gpuColorScale(d.name))
            .attr("stroke-width", "0.15rem")
            .style("pointer-events", "none"),
        (update) =>
          update
            .transition(t)
            .attr("d", (d) => gpuShareLine(d.values))
            .attr("stroke", (d) => gpuColorScale(d.name)),
        (exit) => exit.transition(t).attr("opacity", 0).remove()
      );
    gpuLines
      .transition(t)
      .attr("d", (d) => gpuShareLine(d.values))
      .attr("opacity", 0.8)
      .attr("stroke", (d) => gpuColorScale(d.name));

    const covidLines = d3
      .select(covidLineRef.current)
      .selectAll<SVGPathElement, CovidCaseDatumWithDate>("path")
      .data(selectedCovidData, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => newCaseLine(d.values))
            .attr("fill", "none")
            .attr("opacity", 0)
            .attr("stroke", "currentColor")
            .attr("stroke-width", "0.1rem")
            .style("pointer-events", "none"),
        (update) =>
          update.transition(t).attr("d", (d) => newCaseLine(d.values)),
        (exit) => exit.transition(t).attr("opacity", 0).remove()
      );
    covidLines
      .transition(t)
      .attr("d", (d) => newCaseLine(d.values))
      .attr("opacity", 0.25);
  }, [
    gpuColorScale,
    gpuShareLine,
    gpuShareScale,
    newCaseLine,
    newCaseScale,
    selectedCovidData,
    selectedGpuData,
    xScale,
  ]);

  const handleMouseOut = () => {
    setHoveredDate(null);
    setPopperReferenceElement(null);
    d3.select(tooltipLineRef.current).attr("x1", -1).attr("x2", -1);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.target as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x < Margins.left ||
      x > width - Margins.right ||
      y < Margins.top ||
      y > height - Margins.bottom
    ) {
      handleMouseOut();
      return;
    }

    const xDate = xScale.invert(x);
    const gpuWithMaxHistory = maxBy(selectedGpuData, (d) => d.values.length)!;
    const gpuValues = gpuWithMaxHistory.values;
    const closestDateIndex = bisect(gpuValues, xDate);
    const closestDate =
      gpuValues[
        closestDateIndex >= gpuValues.length
          ? gpuValues.length - 1
          : closestDateIndex
      ].date;
    const closestX = xScale(closestDate);
    setHoveredDate(closestDate);

    setPopperReferenceElement({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: y + rect.top,
        left: closestX + rect.left,
      }),
    } as any);

    if (tooltipLineRef.current) {
      d3.select(tooltipLineRef.current)
        .attr("x1", closestX)
        .attr("x2", closestX)
        .attr("y1", Margins.top)
        .attr("y2", height - Margins.bottom);
    }
  };

  const handleAddGpu = (gpu: string) => {
    if (selectedGpus.includes(gpu)) {
      return;
    }
    setSelectedGpus((v) => [...v, gpu]);
  };

  const handleRemoveGpu = (gpu: string) => {
    setSelectedGpus((v) => v.filter((g) => g !== gpu));
  };

  const handleToggleCovidDates = () => {
    setShowCovidDates((v) => !v);
  };

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
      <div className="w-full pointer-events-auto flex justify-between items-start mb-2 space-x-4">
        <div className="w-3/5 flex flex-col space-y-2">
          {showCustomizedControls && (
            <DropdownSearch
              data={gpus}
              placeholder="Search GPUs to add..."
              onAdd={handleAddGpu}
            />
          )}
          <div className="flex flex-wrap text-base">
            {selectedGpus.length
              ? selectedGpus.map((gpu) => (
                  <Chip
                    className="my-0.5 mx-0.5"
                    key={gpu}
                    label={getGPUName(gpu)}
                    onDelete={
                      showCustomizedControls
                        ? () => handleRemoveGpu(gpu)
                        : undefined
                    }
                  />
                ))
              : "No GPU selected"}
          </div>
        </div>
        <div className="w-2/5 flex flex-col items-end space-y-2">
          {showCustomizedControls && (
            <DropdownSearch
              data={countries}
              placeholder="Choose a country..."
              onAdd={(country) => setSelectedCountries([country])}
            />
          )}
          <Chip label={selectedCountries[0]} />
          {showCustomizedControls && (
            <button
              className="bg-gray-200 hover:bg-gray-300 active:bg-opacity-60 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-opacity-60 font-semibold text-sm py-1 px-2 w-44 rounded"
              onClick={handleToggleCovidDates}
            >
              Toggle COVID-19 Dates
            </button>
          )}
        </div>
      </div>
      <div ref={parentRef} className="w-full relative" style={{ height }}>
        <svg width="100%" height={height}>
          <g
            ref={xAxisRef}
            transform={`translate(0, ${height - Margins.bottom})`}
          >
            <text
              textAnchor="center"
              fill="currentColor"
              fontSize="0.75rem"
              fontWeight="bold"
              transform={`translate(${width / 2}, 40)`}
            >
              Time
            </text>
          </g>
          <g ref={gpuAxisRef} transform={`translate(${Margins.left}, 0)`}>
            <text
              textAnchor="end"
              fill="currentColor"
              fontSize="0.75rem"
              fontWeight="bold"
              transform={`translate(65, ${Margins.top - 20})`}
            >
              Hardware Share (%)
            </text>
          </g>
          <g
            ref={covidAxisRef}
            transform={`translate(${width - Margins.right}, 0)`}
          >
            <text
              textAnchor="end"
              fill="currentColor"
              fontSize="0.75rem"
              fontWeight="bold"
              transform={`translate(55, ${Margins.top - 20})`}
            >
              New COVID-19 Cases
            </text>
          </g>
          <g ref={gpuLineRef} />
          <g ref={covidLineRef} />
          <line
            ref={tooltipLineRef}
            stroke="currentColor"
            strokeWidth="0.1rem"
            strokeDasharray="0.5rem 0.5rem"
            opacity={0.5}
          />
        </svg>
        <div className="w-full text-center text-xs italic text-gray-700 dark:text-gray-200 mt-4">
          Hover over the chart to see the full GPU name and its share at the
          time
        </div>
        <div
          className="absolute inset-0 pointer-events-auto"
          onMouseMove={handleMouseMove}
          onMouseOver={handleMouseMove}
          onMouseOut={handleMouseOut}
        />
        <div
          ref={popperRef}
          style={{ ...popperStyles.popper, pointerEvents: "none" }}
          {...popperAttributes.popper}
        >
          {hoveredDate && (
            <div className="bg-white dark:bg-black rounded shadow-lg dark:shadow-none dark:border-gray-600 dark:border p-3 space-y-2">
              <div className="text-sm font-semibold">
                {dayjs(hoveredDate).format("MMM YYYY")}
              </div>
              {hoveredGpuData.map((gpuData) => (
                <div key={gpuData.name}>
                  <div className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: gpuColorScale(gpuData.name) }}
                    />
                    <div className="text-sm font-medium">{gpuData.name}</div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {((gpuData.value?.percentage ?? 0) * 100).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPUCovidLineChart;
