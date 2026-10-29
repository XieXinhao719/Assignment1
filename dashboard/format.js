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

const maxGapMs = 12 * 60 * 1000;
const gaps = rows.slice(1).map((row, index) =>
    Date.parse(row.collectedAt) - Date.parse(rows[index].collectedAt)
).filter(duration => duration > maxGapMs);
const insertGaps = points => points.flatMap((point, index) =>
    index && point.x - points[index - 1].x > maxGapMs
        ? [{ x: points[index - 1].x + 1, y: null }, point]
        : [point]
);
const chart = key => [{
    series: seriesNames,
    data: seriesNames.map(name => insertGaps(rows.map(row => {
        const district = row.districts.find(d => d.district === name);
        return { x: Date.parse(row.collectedAt), y: district ? Number(district[key]) : null };
    }))),
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
    expectedSnapshots: 288,
    coveragePct: Math.min(100, Math.round(100 * rows.length / 288)),
    gapCount: gaps.length,
    longestGapMinutes: gaps.length ? Math.round(Math.max(...gaps) / 60000) : 0,
    districtCount: eligible.length,
    metadataTotal,
    notReporting: Math.max(0, metadataTotal - reported),
    updatedLocal: new Date(latest.collectedAt).toLocaleString("en-GB", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false
    }),
    districts: pressure,
    availableParks,
    fullParks,
    insightTitle: leading ? "District to watch: " + leading.district : "Waiting for district reports",
    insightText: leading
        ? leading.full + " of " + leading.reported + " reporting car parks are full (" + leading.fullPct + "%). Compare districts alongside report counts and Type A coverage. Exact vacant-space totals are not occupancy rates."
        : "No district has at least three valid reports yet."
};

return [
    { payload: chart("spacesAvailable") },
    { payload: chart("fullPct") },
    { payload: overview }
];
