import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const flow = JSON.parse(readFileSync(join(root, "flows", "smart-parking.json"), "utf8"));
const ids = new Set(flow.map(node => node.id));
assert.equal(ids.size, flow.length, "Node ids must be unique");
for (const node of flow) {
    for (const output of node.wires || []) {
        for (const target of output) assert.ok(ids.has(target), "Missing wire target: " + target);
    }
}

const source = name => readFileSync(join(root, "dashboard", name), "utf8");
const analyse = new Function("msg", "flow", "node", source("analyse.js"));
const format = new Function("msg", source("format.js"));
const metadata = {
    a: { name: "Exact", district: "Central" },
    b: { name: "Binary", district: "Central" },
    c: { name: "Closed", district: "Central" },
    d: { name: "No report", district: "Central" }
};
const message = analyse({
    statusCode: 200,
    payload: { results: [
        { park_Id: "a", privateCar: [{ vacancy_type: "A", vacancy: 3 }] },
        { park_Id: "b", privateCar: [{ vacancy_type: "B", vacancy: 0 }] },
        { park_Id: "c", privateCar: [{ vacancy_type: "C" }] }
    ] }
}, { get: () => metadata }, { warn: () => {} });
assert.equal(message.payload.metadataTotal, 4);
assert.equal(message.payload.closed, 1);
assert.equal(message.payload.districts[0].reported, 2);
assert.equal(message.payload.districts[0].full, 1);
assert.equal(message.payload.districts[0].exactCount, 1);
assert.equal(message.payload.districts[0].spacesAvailable, 3);

const result = format({ payload: [message.payload] });
assert.equal(result.length, 3);
assert.equal(result[2].payload.reported, 2);
assert.equal(result[2].payload.fullPct, 50);
assert.equal(result[2].payload.binaryCount, 1);
assert.equal(result[2].payload.notReporting, 2);
const snapshots = ["2026-10-29T00:00:00.000Z", "2026-10-29T00:05:00.000Z", "2026-10-29T01:00:00.000Z"]
    .map(collectedAt => ({
        ...message.payload,
        collectedAt,
        districts: [{ ...message.payload.districts[0], reported: 3 }]
    }));
const history = format({ payload: snapshots });
assert.equal(history[2].payload.gapCount, 1);
assert.equal(history[2].payload.longestGapMinutes, 55);
assert.deepEqual(history[0].payload[0].data[0].map(point => point.y), [3, 3, null, 3]);
console.log("Flow, A/B/C aggregation, and collection-gap checks passed");
