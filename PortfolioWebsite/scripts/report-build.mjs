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
  `homepage JS ${home?.rawBytes ?? 0} raw / ${home?.gzipBytes ?? 0} gzip bytes; ` +
  `largest public route ${largestRoute?.[0] ?? "n/a"} ${
    largestRoute?.[1].gzipBytes ?? 0
  } gzip bytes.`,
);
