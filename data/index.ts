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
export const getCovidCasesByCountryData = async () =>
  (await import("datasets/covid-cases.json")).default as unknown as {
    [name: string]: CovidCaseDatum[];
  };

export const ethData = ethPrices as Record<string, number>;
