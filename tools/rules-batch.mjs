// Runs src/rules/read.js over a dump of the packs and prints the entries it reads, for review into src/rules/batch-*.js.
// node tools/rules-batch.mjs <dump.json>   (the dump: an array of item sources, each with _module and _pack, as the index tools write it)

import { readFileSync } from "node:fs";
import { readRules } from "../src/rules/read.js";
import { compendiumUuid } from "../src/rules/index.js";

const items = JSON.parse(readFileSync(process.argv[2], "utf8"));
const entries = [];
for (const item of items) {
    if (!["feat", "heritage", "background"].includes(item.type)) continue;
    const rules = readRules(item);
    if (rules.length) entries.push({ uuid: compendiumUuid(item._module, item._pack, item._id), name: item.name, rules });
}
console.log(entries.map((entry) => `    ${JSON.stringify(entry)},`).join("\n"));
console.error(`${entries.length} items`);
