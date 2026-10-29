if (msg.statusCode !== 200 || !msg.payload || !Array.isArray(msg.payload.results)) {
    node.warn("Vacancy API error");
    return null;
}

const metadata = flow.get("parks") || {};
const metadataTotal = Object.keys(metadata).length;
if (!metadataTotal) {
    node.warn("Waiting for car park metadata");
    return null;
}

const districts = {};
const parks = [];
let unmatched = 0;
let closed = 0;

for (const row of msg.payload.results) {
    const info = metadata[String(row.park_Id)];
    if (!info) {
        unmatched++;
        continue;
    }

    const entries = Array.isArray(row.privateCar) ? row.privateCar : [];
    // A has a numeric vacancy count, B has only an available/full flag, C is closed.
    const exact = entries.filter(x => x.vacancy_type === "A" && Number.isFinite(Number(x.vacancy)) && Number(x.vacancy) >= 0);
    const binary = entries.filter(x => x.vacancy_type === "B" && (Number(x.vacancy) === 0 || Number(x.vacancy) === 1));
    if (!exact.length && !binary.length) {
        if (entries.some(x => x.vacancy_type === "C")) closed++;
        continue;
    }

    const available = exact.length ? exact.reduce((sum, x) => sum + Number(x.vacancy), 0) : null;
    const full = exact.length ? available === 0 : binary.every(x => Number(x.vacancy) === 0);
    const reportType = exact.length ? "A" : "B";
    const district = info.district || "Unknown";
    const aggregate = districts[district] || (districts[district] = {
        district, reported: 0, full: 0, exactCount: 0, spacesAvailable: 0
    });

    aggregate.reported++;
    if (full) aggregate.full++;
    if (reportType === "A") {
        aggregate.exactCount++;
        aggregate.spacesAvailable += available;
    }
    parks.push({
        id: String(row.park_Id),
        name: info.name || String(row.park_Id),
        district,
        available,
        full,
        reportType
    });
}

const districtList = Object.values(districts)
    .map(d => ({ ...d, fullPct: Math.round(100 * d.full / d.reported) }))
    .sort((a, b) => a.district.localeCompare(b.district));
if (!districtList.length) return null;

msg.payload = {
    collectedAt: new Date().toISOString(),
    metadataTotal,
    unmatched,
    closed,
    districts: districtList,
    parks
};
return msg;
