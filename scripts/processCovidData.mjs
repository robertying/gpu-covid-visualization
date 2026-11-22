import fs from "fs-extra";
import { groupBy } from "lodash-es";
import { parseCSV } from "./parseCSV.mjs";
import { compactCovidCases } from "./compactCovidCases.mjs";

const indexData = await parseCSV("./datasets/raw/covid-19-index.csv");
const filteredIndexData = indexData.filter(
  (row) => row.aggregation_level === "0",
);
const countryIndices = filteredIndexData.map((row) => row.location_key);
const countryMap = filteredIndexData.reduce((acc, row) => {
  acc[row.location_key] = row.country_name;
  return acc;
}, {});
const countrySet = new Set(countryIndices);

const epidemiologyData = await parseCSV(
  "./datasets/raw/covid-19-epidemiology.csv",
);

const data = [];
for (const row of epidemiologyData) {
  if (countrySet.has(row.location_key)) {
    data.push({
      date: row.date,
      code: row.location_key,
      name: countryMap[row.location_key],
      newCases: parseInt(row.new_confirmed),
    });
  }
}

const groupedData = groupBy(data, "name");

// Served as a static file and fetched by the line chart; see data/index.ts.
await fs.writeJSON("./public/covid-cases.json", compactCovidCases(groupedData));
