# Hong Kong Smart Parking

COMP7503A Node-RED smart city project. It collects real-time private-car parking vacancies from Hong Kong's open data portal, joins them to car park metadata, saves district snapshots in MongoDB, and presents current and historical insights on a Chinese dashboard. This transport use case is independent of the supplied weather example.

## Start

1. Run `docker compose up --build -d` here.
2. Open `http://localhost:1880`, import `flows/smart-parking.json` using Menu > Import, then Deploy.
3. Open `http://localhost:1880/ui`. The dashboard shows current KPIs, district pressure, searchable car-park details, data-quality context, and 24-hour trends. Metadata loads at startup; the first vacancy snapshot follows a few seconds later.

Compose provides persistent `node_red_data` and `mongo_data` volumes. MongoDB stays on the internal Compose network. To stop without deleting data, run `docker compose down`.

## Data and calculations

Source: [Parking Vacancy Data (One-Stop Version)](https://data.gov.hk/en-data/dataset/hk-dpo-datagovhk1-carpark-info-vacancy), `https://api.data.gov.hk/v1/carpark-info-vacancy`. The flow requests `data=info` daily and `data=vacancy` every five minutes for private cars. It joins records by `park_Id` and groups them by district.

The API distinguishes **A** (exact available-space count), **B** (available/full flag), and **C** (closed). The project sums spaces only for type A. Full percentage uses valid A and B reports; closed or missing data are excluded. A district needs at least three reporting car parks to appear in rankings. It does not call these counts occupancy or capacity utilization.

The dashboard displays the numerator and denominator beside each district's full percentage so small samples are visible. It separates A and B coverage and lists metadata car parks without a valid A/B report. The car-park table switches between the largest exact vacancy reports and full car parks, with name and district search.

Each snapshot stores `collectedAt`, district aggregates, and individual car-park observations in MongoDB's `parking_snapshots` collection. The timestamp records collection time, which may differ from each operator's update time.

## Collection continuity

The official API serves the current vacancy report and has no historical-time parameter. Node-RED cannot collect while its container or the computer is off, and missed samples cannot be reconstructed honestly. The 24-hour charts leave a visible break whenever consecutive snapshots are more than 12 minutes apart. The dashboard reports the number of gaps, the longest gap, and the share of the approximately 288 expected five-minute snapshots actually stored.

To collect continuously, keep this computer, Docker Desktop, and the Compose services running, or deploy the same Compose project to an always-on host. Setting Docker Desktop to start with Windows helps only while the computer itself is on. A remote host must be configured and secured before use; no hosting is provided by this repository.

## Editing the dashboard

Editable HTML and JavaScript live in `dashboard/`. After changing them, run `node scripts/build-flow.mjs` to update the exported JSON and `node scripts/check-flow.mjs` to check aggregation rules and flow references. Import and deploy the updated flow in Node-RED.

## Submission

The assignment requires a single ZIP on Moodle with an exported Node-RED flow, Docker ID or description, and report. `flows/smart-parking.json` and `docker-compose.yml` provide the first two. See `ASSIGNMENT_REQUIREMENTS.md` for a checklist. Expand `REPORT.md` with screenshots, a multi-day collection period, findings, and team details after the system has run. GitHub upload alone is not Moodle submission.
