const rows = (Array.isArray(msg.payload) ? msg.payload : Object.values(msg.payload || {}))
    .filter(x => x && x.collectedAt && Array.isArray(x.districts))
    .sort((a, b) => a.collectedAt.localeCompare(b.collectedAt));
if (!rows.length) return null;

const latest = rows[rows.length - 1];
const eligible = latest.districts.filter(d => d.reported >= 3);
const seriesNames = [...eligible]
    .sort((a, b) => b.spacesAvailable - a.spacesAvailable)
    .slice(0, 6)
    .map(d => d.district);

const chart = key => [{
    series: seriesNames,
    data: seriesNames.map(name => rows.map(row => {
        const district = row.districts.find(d => d.district === name);
        return { x: Date.parse(row.collectedAt), y: district ? Number(district[key]) : null };
    }).filter(point => point.y !== null)),
    labels: [""]
}];

const reported = latest.districts.reduce((sum, d) => sum + d.reported, 0);
const full = latest.districts.reduce((sum, d) => sum + d.full, 0);
const exactCount = latest.districts.reduce((sum, d) => sum + d.exactCount, 0);
const spacesAvailable = latest.districts.reduce((sum, d) => sum + d.spacesAvailable, 0);
const pressure = [...eligible].sort((a, b) => b.fullPct - a.fullPct || b.reported - a.reported);
const leading = pressure[0];
const availableParks = (latest.parks || [])
    .filter(p => p.reportType === "A" && p.available > 0)
    .sort((a, b) => b.available - a.available);
const fullParks = (latest.parks || [])
    .filter(p => p.full)
    .sort((a, b) => a.district.localeCompare(b.district) || a.name.localeCompare(b.name));
const metadataTotal = Number(latest.metadataTotal) || reported;

const overview = {
    reported,
    full,
    fullPct: reported ? Math.round(100 * full / reported) : 0,
    exactCount,
    binaryCount: Math.max(0, reported - exactCount),
    spacesAvailable,
    snapshotCount: rows.length,
    districtCount: eligible.length,
    metadataTotal,
    notReporting: Math.max(0, metadataTotal - reported),
    updatedLocal: new Date(latest.collectedAt).toLocaleString("zh-HK", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false
    }),
    districts: pressure,
    availableParks,
    fullParks,
    insightTitle: leading ? "重点观察：" + leading.district : "等待分区报告",
    insightText: leading
        ? "该区 " + leading.full + " / " + leading.reported + " 个报告停车场已满（" + leading.fullPct + "%）。比较各区时，也要看报告数量和 A 类覆盖，不能把精确空位总数当作占用率。"
        : "当前各区的有效报告尚不足 3 个，暂不排名。"
};

return [
    { payload: chart("spacesAvailable") },
    { payload: chart("fullPct") },
    { payload: overview }
];
