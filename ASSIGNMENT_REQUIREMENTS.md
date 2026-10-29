# Assignment requirements and project mapping

Based on the supplied `Programming Assignment.pdf`. Deadline: **1 December 2026, 23:55**. This is a **two- or three-person group project**.

| Requirement | Current project | Before submission |
| --- | --- | --- |
| Collect data streams from data.gov.hk | Node-RED retrieves car park metadata and vacancy reports every five minutes | Keep a record of the collection period and source |
| Analyse and correlate data | Join by `park_Id` and calculate district vacant-space totals and full shares | Add a multi-day time-of-day analysis |
| Present smart city insights on a dashboard | Live metrics, district pressure, car park detail, and 24-hour trends | Capture screenshots and explain each view |
| Program in Node-RED | Importable `flows/smart-parking.json` | Re-export the final deployed flow |
| Store data in MongoDB | `parking_snapshots` stores each collection | Document fields, interval, and sample size |
| Write a project report | `REPORT.md` drafts the use case, implementation, storage, metrics, and limitations | Add group members, final results, screenshots, and conclusions |
| Submit one ZIP via Moodle | The flow, Docker description, and report are in this project | Package and submit the final ZIP; GitHub is not the Moodle submission |

Late work loses 5% per day and is not accepted after one week. Programs that cannot compile are not graded. Plagiarism is heavily penalized. The supplied HKO flow is an example; this project uses an independent parking use case.
