import fs from "fs-extra";
import { parse } from "csv-parse";

export const parseCSV = (path) =>
  new Promise(async (resolve, reject) => {
    const content = await fs.readFile(path);
    parse(
      content,
      {
        columns: true,
      },
      (err, records) => {
        if (err) {
          reject(err);
        }
        resolve(records);
      },
    );
  });
