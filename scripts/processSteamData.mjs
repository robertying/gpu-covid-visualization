import dayjs from "dayjs";
import { uniq } from "lodash-es";
import fs from "fs-extra";
import { parseCSV } from "./parseCSV.mjs";

const data = await parseCSV("./datasets/raw/steam-hardware-surveys.csv");

const dataAfterGTX1060 = data.filter((row) => {
  return dayjs(row.date).isAfter("2016-06-31");
});

const dataGPUOnly = dataAfterGTX1060.filter((row) => {
  return row.category === "Video Card Description" && row.name;
});

const dataWithManufacturer = dataGPUOnly.map((row) => ({
  date: row.date,
  name: row.name,
  percentage: parseFloat(row.percentage),
  manufacturer:
    row.name.toLowerCase().includes("nvidia") ||
    row.name.toLowerCase().includes("geforce")
      ? "NVIDIA"
      : row.name.toLowerCase().includes("amd") ||
        row.name.toLowerCase().includes("ati")
      ? "AMD"
      : row.name.toLowerCase().includes("intel")
      ? "Intel"
      : "Other",
}));

const uniqueGPUs = uniq(dataWithManufacturer.map((row) => row.name)).sort();

await fs.writeJSON("./datasets/gpu-shares.json", dataWithManufacturer, {
  spaces: 2,
});
await fs.writeJSON("./datasets/gpus.json", uniqueGPUs, {
  spaces: 2,
});
