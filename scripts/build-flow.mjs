import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const flowPath = join(root, "flows", "smart-parking.json");
const flow = JSON.parse(readFileSync(flowPath, "utf8"))
    .filter(node => node.id !== "summary" && node.id !== "ranking");
const byId = id => {
    const node = flow.find(item => item.id === id);
    if (!node) throw new Error("Missing flow node: " + id);
    return node;
};

byId("analyse").func = readFileSync(join(root, "dashboard", "analyse.js"), "utf8").trim();
byId("dashboard").func = readFileSync(join(root, "dashboard", "format.js"), "utf8").trim();
byId("dashboard").outputs = 3;
byId("dashboard").wires = [["spaces-chart"], ["full-chart"], ["overview"]];

const base = byId("ui-base");
base.site.name = "Hong Kong Parking Observatory";
base.site.sizes.sx = 84;
base.theme.lightTheme.default = "#102b45";
base.theme.lightTheme.baseColor = "#102b45";
base.theme.lightTheme.baseFont = "Segoe UI,Microsoft YaHei,Arial,sans-serif";
base.theme.customTheme.default = "#102b45";
base.theme.customTheme.baseColor = "#102b45";
base.theme.customTheme.baseFont = "Segoe UI,Microsoft YaHei,Arial,sans-serif";

const group = byId("parking-group");
group.name = "Live overview";
group.disp = false;
group.order = 1;
group.width = "12";
byId("ui-tab").name = "Parking availability";

if (!flow.some(node => node.id === "trend-group")) {
    flow.push({
        id: "trend-group", type: "ui_group", name: "24-hour trends · 5-minute collection",
        tab: "ui-tab", order: 2, disp: true, width: "12", collapse: false
    });
}
for (const [id, order] of [["spaces-chart", 1], ["full-chart", 2]]) {
    const node = byId(id);
    node.group = "trend-group";
    node.order = order;
    node.height = "5";
}
byId("trend-group").name = "24-hour trends · 5-minute collection";
byId("spaces-chart").label = "Exact vacant spaces · selected districts";
byId("full-chart").label = "Share of reporting car parks full · selected districts";
if (!flow.some(node => node.id === "overview")) {
    flow.push({
        id: "overview", type: "ui_template", z: "parking-flow",
        group: "parking-group", name: "Parking insights overview", order: 1,
        width: "12", height: "34", format: "",
        storeOutMessages: false, fwdInMessages: false,
        resendOnRefresh: true, templateScope: "local",
        x: 1090, y: 300, wires: [[]]
    });
}
byId("overview").height = "34";
byId("overview").name = "Parking insights overview";
byId("overview").format = readFileSync(join(root, "dashboard", "overview.html"), "utf8").trim();
writeFileSync(flowPath, JSON.stringify(flow, null, 2) + "\n", "utf8");
console.log("Updated " + flow.length + " Node-RED nodes");
