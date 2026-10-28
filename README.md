# Hong Kong Smart Parking

COMP7503A Node-RED smart city project. It collects real-time private-car parking vacancies from Hong Kong's open data portal, joins them to car park metadata, saves district snapshots in MongoDB, and plots district trends on a dashboard. This is a new transport use case, independent of the supplied weather example.

## Start

1. Run `docker compose up --build -d` here.
2. Open `http://localhost:1880`, import `flows/smart-parking.json` using Menu > Import, then Deploy.
3. Open `http://localhost:1880/ui`. Metadata loads at startup; the first vacancy snapshot follows a few seconds later. The charts develop over time.

Compose provides persistent `node_red_data` and `mongo_data` volumes. MongoDB stays on the internal Compose network. To stop without deleting data, run `docker compose down`.

## Data and calculations

Source: [Parking Vacancy Data (One-Stop Version)](https://data.gov.hk/en-data/dataset/hk-dpo-datagovhk1-carpark-info-vacancy), `https://api.data.gov.hk/v1/carpark-info-vacancy`. The flow requests `data=info` daily and `data=vacancy` every five minutes for private cars. It joins records by `park_Id` and groups them by district.

The API distinguishes **A** (exact available-space count), **B** (available/full flag), and **C** (closed). The project sums spaces only for type A. Full percentage uses valid A and B reports; closed or missing data are excluded. A district needs at least three reporting car parks to appear in rankings. It does not call these counts occupancy or capacity utilization.

Each snapshot stores `collectedAt`, district aggregates, and individual car-park observations in MongoDB's `parking_snapshots` collection. The dashboard shows the latest reporting/full counts, districts with the most full car parks, and 24-hour trends for numeric vacancies and full percentage. The timestamp records collection time, which may differ from each operator's update time.

## Submission

The assignment requires a single ZIP on Moodle with an exported Node-RED flow, Docker ID or description, and report. `flows/smart-parking.json` and `docker-compose.yml` provide the first two. Expand `REPORT.md` with actual screenshots, collection period, findings, and team details after the system has run. GitHub upload alone is not Moodle submission.

