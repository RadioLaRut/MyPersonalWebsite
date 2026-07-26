import path from "node:path";

import { createBuildReport, writeBuildReport } from "./report-build-lib.mjs";

const nextRoot = path.resolve(process.cwd(), ".next");
const report = createBuildReport({ nextRoot });
writeBuildReport(report, nextRoot);

const routeReports = report.routes;
const largestRoute = Object.entries(routeReports)
  .sort((left, right) => right[1].gzipBytes - left[1].gzipBytes)[0];
const home = routeReports["/"];

console.log(
  `Build report: ${report.prerenderedRoutes.length} prerendered routes; ` +
  `homepage JS ${home?.js.rawBytes ?? 0} raw / ${home?.js.gzipBytes ?? 0} gzip bytes; ` +
  `largest public route ${largestRoute?.[0] ?? "n/a"} ${
    largestRoute?.[1].js.gzipBytes ?? 0
  } gzip bytes.`,
);

if (report.budgetFailures.length > 0) {
  for (const failure of report.budgetFailures) {
    console.error(
      `Performance budget failed: ${failure.route} ${failure.budget} ` +
      `${failure.actual} > ${failure.limit}`,
    );
  }
  process.exitCode = 1;
}
