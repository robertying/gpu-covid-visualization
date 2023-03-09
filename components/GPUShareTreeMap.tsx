import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { groupBy } from "lodash-es";
import { useTransition, animated } from "@react-spring/web";
import { usePopper } from "react-popper";
import dayjs from "dayjs";
import Colors from "lib/colors";
import useWidth from "lib/useWidth";
import { getGpuSharesByDateData, GPUShareDatum } from "data";

const getGPUName = (name: string) => {
  return name.substring(name.indexOf(" ") + 1);
};

const animationDuration = 600;

interface GPUShareTreeMapProps {
  height: number;
  progress: number;
}
const GPUShareTreeMap: React.FC<GPUShareTreeMapProps> = ({
  height,
  progress,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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

  const leaves = useMemo(() => {
    const data = gpuData[date];
    const processedData = Object.entries(groupBy(data, "manufacturer")).map(
      ([key, value]) => ({
        name: key,
        children: value.sort((a, b) => b.percentage - a.percentage),
      })
    );

    const root = d3
      .hierarchy<GPUShareDatum>({ children: processedData } as any)
      .sum((d) => d.percentage)
      .sort(
        (a, b) => b.value! - a.value!
      ) as unknown as d3.HierarchyRectangularNode<GPUShareDatum>;
    d3.treemap<GPUShareDatum>().size([width, height]).padding(2)(root);

    return root.leaves();
  }, [date, gpuData, height, width]);

  const labelData = useMemo(
    () =>
      leaves.filter(
        (leaf) =>
          leaf.x1 - leaf.x0 > 50 && leaf.y1 - leaf.y0 > 50 && leaf.data.name
      ),
    [leaves]
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
    if (!svgRef.current) {
      return;
    }

    const t = d3
      .transition()
      .duration(animationDuration)
      .ease(d3.easeCubicInOut);

    const cells = d3
      .select(svgRef.current)
      .selectAll<SVGRectElement, d3.HierarchyRectangularNode<GPUShareDatum>>(
        "rect"
      )
      .data(leaves, (d) => d.data.name)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
            .attr("width", 0)
            .attr("height", 0)
            .attr("opacity", 0)
            .attr("fill", (d) => categoryColorScale(d.data.manufacturer))
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
            .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
            .attr("fill", (d) => categoryColorScale(d.data.manufacturer))
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0),
        (exit) =>
          exit
            .transition(t)
            .attr("width", 0)
            .attr("height", 0)
            .attr("opacity", 0)
            .remove()
      );
    cells
      .transition(t)
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      .attr("fill", (d) => categoryColorScale(d.data.manufacturer))
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("opacity", 0.8)
      .style("pointer-events", "auto");
  }, [categoryColorScale, leaves]);

  const labelTransitions = useTransition(labelData, {
    keys: (leaf) => leaf.data.name,
    from: (leaf) => ({
      opacity: 0,
      top: leaf.y0,
      left: leaf.x0,
      width: leaf.x1 - leaf.x0,
      height: leaf.y1 - leaf.y0,
      fontSize: (Math.min(leaf.x1 - leaf.x0, leaf.y1 - leaf.y0) / 16) * 3,
    }),
    enter: (leaf) => ({
      opacity: 1,
      top: leaf.y0,
      left: leaf.x0,
      width: leaf.x1 - leaf.x0,
      height: leaf.y1 - leaf.y0,
      fontSize: (Math.min(leaf.x1 - leaf.x0, leaf.y1 - leaf.y0) / 16) * 3,
    }),
    update: (leaf) => ({
      top: leaf.y0,
      left: leaf.x0,
      width: leaf.x1 - leaf.x0,
      height: leaf.y1 - leaf.y0,
      fontSize: (Math.min(leaf.x1 - leaf.x0, leaf.y1 - leaf.y0) / 16) * 3,
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
        {dateTransitions((style, date) => (
          <animated.div
            className="absolute tabular-nums font-mono ml-1"
            style={style}
          >
            {dayjs(date).format("MMM YYYY")}
          </animated.div>
        ))}
      </div>
      <div ref={parentRef} className="w-full relative" style={{ height }}>
        <svg ref={svgRef} width="100%" height={height} />
        <div className="w-full text-center text-xs italic text-gray-700 dark:text-gray-200 mt-1">
          Hover over a rectangle to see the full GPU name and its share
        </div>
        <div className="pointer-events-none">
          {labelTransitions((style, leaf) => (
            <animated.div
              key={leaf.data.name}
              className="absolute flex items-center justify-center p-2"
              style={style}
            >
              <div className="text-white text-center line-clamp-3 whitespace-pre-wrap leading-tight">
                {getGPUName(leaf.data.name)}
              </div>
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
          <div className="bg-white dark:bg-black text-black dark:text-white rounded shadow-lg dark:shadow-none dark:border-gray-600 dark:border p-2">
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

export default GPUShareTreeMap;
