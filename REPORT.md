# COMP7503A Smart Parking report draft

## Use case

Drivers and transport planners need to understand where private-car parking is scarce. The project compares reported vacancies and full car parks across Hong Kong districts, then shows how those measures change over 24 hours.

## Data and implementation

The Digital Policy Office's one-stop parking API provides car-park basic information and vacancy reports. Node-RED fetches metadata daily and vacancies every five minutes, joins by `park_Id`, aggregates by district, and stores snapshots in MongoDB. Docker Compose starts Node-RED and MongoDB with persistent volumes.

Availability type A is an exact count. Type B reports only full/available; it contributes to full percentage but not the numeric vacancy sum. Closed and missing reports are excluded. A district ranking requires at least three reporting car parks.

## Dashboard interpretation

The summary displays the latest collection time and reporting/full totals. One chart tracks the sum of exact private-car vacancies by district; the other tracks the percentage of reporting car parks that are full. The ranking highlights districts with the highest full percentage. These measures may help identify where parking guidance or transport alternatives are most useful.

## Limitations

Participation is voluntary and coverage differs between districts. Operators update at different times, so the five-minute collection timestamp is not necessarily the observation timestamp. Numeric vacancy sums are not occupancy rates because capacity data may be incomplete. Trends require collection over time.

## Complete after collecting data

- Add group names and student IDs.
- State the actual collection period and snapshot count.
- Insert screenshots of the Node-RED flow and dashboard.
- Discuss observed daily patterns using real values. Do not claim a trend before data have accumulated.
- Describe a concrete smart city decision supported by the observations.

