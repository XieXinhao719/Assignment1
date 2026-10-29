# COMP7503A Smart Parking — report draft

## 1. Smart city use case

Drivers need to find parking without circling congested streets. Transport planners need to know which districts repeatedly have scarce parking. This project monitors **reported private-car parking availability in Hong Kong** and asks: Which districts have the highest share of reporting car parks marked full? Where are the most precisely reported vacant spaces? How do these measures change over time, and how reliable is the coverage?

When a district has a persistently high full share and adequate reporting coverage, a planner could prioritise parking guidance, park-and-ride information, or public transport alternatives there. A single snapshot is a prompt to investigate, not evidence of a persistent shortage.

## 2. Data acquisition and correlation

The [data.gov.hk Parking Vacancy Data (One-Stop Version)](https://data.gov.hk/en-data/dataset/hk-dpo-datagovhk1-carpark-info-vacancy) API supplies two related streams from `https://api.data.gov.hk/v1/carpark-info-vacancy`:

| Stream | Request | Schedule | Role |
| --- | --- | --- | --- |
| Car park information | `data=info&vehicleTypes=privateCar&lang=en_US` | At flow start, then daily | Name, district and car park ID |
| Vacancy reports | `data=vacancy&vehicleTypes=privateCar&lang=en_US` | At flow start, then every 5 minutes | Vacancy counts or availability flags |

Node-RED joins the streams by `park_Id`. Records without matching information are excluded from district comparisons. The collection timestamp is generated when the flow receives a report; it is not necessarily the operator's last update time.

## 3. Analysis rules

| Type | Meaning | In exact vacant-space sum? | In full share? |
| --- | --- | --- | --- |
| A | Numeric number of available spaces | Yes | Yes; full when the sum is zero |
| B | Available/full flag | No | Yes; full when all flags are zero |
| C | Closed | No | No |

For each district, the flow counts reporting car parks, full car parks, A-type car parks, and the sum of A-type available spaces. **Full share** equals full car parks divided by reporting car parks. A district appears in the pressure ranking only when at least three car parks have valid reports. The exact-space sum is not an occupancy rate: it omits B-type reports and has no total-capacity denominator.

The dashboard also shows coverage: metadata car parks minus car parks with a valid A/B report in the latest snapshot. This category can include closed, missing, unmatched, or invalid vacancy reports; it must not be called the number of closed car parks.

## 4. Storage and implementation

Docker Compose starts Node-RED and MongoDB. The flow uses HTTP request, Function, MongoDB and Dashboard nodes. MongoDB's `parking_snapshots` collection stores one document per five-minute collection:

- `collectedAt`: ISO collection timestamp.
- `metadataTotal`, `unmatched`, `closed`: coverage context.
- `districts[]`: reported, full, exactCount, spacesAvailable and fullPct by district.
- `parks[]`: ID, name, district, A-type vacant spaces when available, full flag and report type.

Persistent Docker volumes retain the flow and MongoDB data after container restart. A second five-minute query reads snapshots from the last 24 hours and formats the dashboard. The exported flow is `flows/smart-parking.json`; editable dashboard sources are in `dashboard/`.

## 5. Dashboard and interpretation

1. **Current position:** reporting car parks, full car parks, exact vacant-space sum, and 24-hour snapshot count.
2. **District pressure:** districts ranked by full share, with the full/reported numerator and denominator and A-type coverage. This identifies candidates for closer review.
3. **Car park detail:** the largest exact vacancy reports or the list of full car parks, with name and district search. This supports a driver-facing use case.
4. **History:** two charts show A-type vacant-space sums and full shares for major reporting districts. They are descriptive trends, not forecasts.

As an **early validation example**, a snapshot observed on 29 October 2026 at about 05:58 Hong Kong time showed 464 reporting car parks, 20 full car parks (about 4%), and 23,466 A-type available spaces. The metadata stream listed 575 car parks; 459 supplied A-type and 5 supplied B-type valid reports. These numbers change every collection and must be replaced with the final collection-period analysis.

## 6. Limitations and next analysis

Coverage is unequal across districts. A high full share based on three reporting car parks is less persuasive than the same share based on thirty. Some operators provide only B-type status, and collection time can differ from operator update time. Raw vacant-space totals can reflect coverage rather than underlying demand.

After collecting several days of snapshots, compare weekdays with weekends and morning, afternoon and evening periods. Report each district's median and range of full share, sample size, and frequency among the highest-pressure districts. Check whether full-share spikes coincide with falling A-type vacant-space sums. Do not infer causation from these correlations.

## 7. Submission work still needed

- Add the two or three group members' names and student IDs.
- Record the final collection period, snapshot count and observed results.
- Add screenshots of the Node-RED flow and dashboard.
- Write a final discussion based on multiple days of data and a concrete planning decision.
- Export the latest running flow and package it with the Docker description and final report in one ZIP for Moodle.
