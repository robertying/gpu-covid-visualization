import fs from "fs-extra";
import { parseCSV } from "./parseCSV.mjs";

const ethData = await parseCSV("./datasets/raw/ETH-USD.csv");

const processData = (data) =>
  data
    .map((d) => ({ date: d.Date, price: parseFloat(d["Adj Close"]) }))
    .reduce(
      (acc, d) => ({
        ...acc,
        [d.date]: d.price,
      }),
      {},
    );

fs.writeJSON("./datasets/eth.json", processData(ethData), {
  spaces: 2,
});
