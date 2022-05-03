# Sleep Phase Alarm

The alarm must be in the next 24h.

The display shows:

- the current time
- time of the next alarm or timer
- time difference between current time and alarm time (ETA)
- current state of the ESS algorithm, "Sleep" or "Awake", useful for debugging

## Logging

For each day of month (1..31) the ESS states are logged. An entry will be overwritten in the next month, e.g. an entry on the 4th May will overwrite an entry on the 4th April.
The logs can be viewed with the download button:

![](screenshot.jpg)
