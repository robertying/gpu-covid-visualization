import { groupBy } from "lodash-es";
import gpuData from "datasets/gpus.json";
import gpuBenchmarks from "datasets/gpu-benchmarks.json";
import ethPrices from "datasets/eth.json";

export const gpus = gpuData;

export interface GPUShareDatum {
  date: string;
  name: string;
  percentage: number;
  manufacturer: string;
}
const getGpuSharesData = async () => {
  return (await import("datasets/gpu-shares.json")).default as GPUShareDatum[];
};
export const getGpuSharesByDateData = async () =>
  groupBy(await getGpuSharesData(), (row) => {
    return row.date;
  });
export const getGpuSharesByNameData = async () =>
  groupBy(await getGpuSharesData(), (row) => {
    return row.name;
  });

export interface GPUBenchmarkData {
  [name: string]: number;
}
export const gpuBenchmarkData: GPUBenchmarkData = gpuBenchmarks;

export interface CovidCaseDatum {
  date: string;
  code: string;
  name: string;
  newCases: number;
}
// Written by scripts/processCovidData.mjs. gaps[i] is the number of days since
// the previous row (0 for the first).
interface CompactCovidCases {
  [name: string]: {
    code: string;
    start: string;
    gaps: number[];
    newCases: number[];
  };
}
const DAY = 24 * 60 * 60 * 1000;

// Fetched as plain JSON rather than imported, which would bundle it into a
// 15 MB script chunk.
export const getCovidCasesByCountryData = async () => {
  const response = await fetch("/covid-cases.json");
  if (!response.ok) {
    throw new Error(`covid-cases.json: HTTP ${response.status}`);
  }
  const compact: CompactCovidCases = await response.json();
  return Object.fromEntries(
    Object.entries(compact).map(([name, { code, start, gaps, newCases }]) => {
      let time = Date.parse(start);
      const rows = newCases.map((cases, i): CovidCaseDatum => {
        time += gaps[i] * DAY;
        const date = new Date(time).toISOString().slice(0, 10);
        return { date, code, name, newCases: cases };
      });
      return [name, rows];
    }),
  );
};

export const ethData = ethPrices as Record<string, number>;
