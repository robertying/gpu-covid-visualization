const DAY = 24 * 60 * 60 * 1000;

/**
 * Packs { [country]: [{ date, code, name, newCases }] } (one row per day,
 * occasionally skipping days) into what public/covid-cases.json holds:
 * { [country]: { code, start, gaps, newCases } }, where gaps[i] is the number
 * of days since the previous row (0 for the first). data/index.ts unpacks it.
 */
export function compactCovidCases(groupedData) {
  return Object.fromEntries(
    Object.entries(groupedData).map(([name, rows]) => [
      name,
      {
        code: rows[0].code,
        start: rows[0].date,
        gaps: rows.map((row, i) =>
          i === 0
            ? 0
            : (Date.parse(row.date) - Date.parse(rows[i - 1].date)) / DAY,
        ),
        newCases: rows.map((row) => row.newCases),
      },
    ]),
  );
}
