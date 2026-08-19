import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(process.argv[2], "utf8"));
const valid = config.slug === "sports803tv-mobile"
  && config.android?.package === "com.app.sports803tvmobile"
  && Boolean(config.extra?.eas?.projectId);

if (!valid) process.exit(1);
console.log("Expo config identity and EAS linkage validated");
