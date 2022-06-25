# Home Assistant
Call Home assistant services from Bangle.JS via android intents. Only functional for android.

## Dependencies 
- [Bangle.js Gadgetbridge](https://www.espruino.com/Gadgetbridge) 
- [Home assistant companion android app](https://companion.home-assistant.io/) with Last Update Sensor enabled for target intent (default: `com.homeassistant.service`)
- Home assistant automation to trigger on intent, example:
```
alias: Intent received
trigger:
  - platform: event
    event_type: android.intent_received
    event_data:
      intent: com.homeassistant.service
    id: intent
action:
  - choose:
      - conditions:
          - condition: trigger
            id: intent
        sequence:
          - service: '{{ trigger.event.data.service }}'
            data:
              entity_id: '{{ trigger.event.data.entity_id }}'
```