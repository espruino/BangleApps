Tyreid

Tyreid is a Bluetooth war-driving app for the Bangle.js 2.

Menu options:
- Start: This turns on the Bluetooth and starts logging Bluetooth packets with time, latitude, and longitude information to a CSV file.
- Pause/Continue: These functions pause the capture and then allow it to resume.
- Devices: When paused this menu option will display the MAC addresses of discovered Bluetooth devices. Selecting a device will then display the MAC, Manufacturer code, the time it was first seen, and the RSSI of the first sighting.
- Marker: This command adds a 'marker' to the CSV log, which consists of the time and location information, but the Bluetooth packet information is replaced with the word MARKER. Markers can also be added by pressing the watch's button.
- Exit: This exits the app.

The current number of discovered devices is displayed in the top left corner.
This value is displayed in green when the GPS has a fix, or red otherwise.

To retrieve the CSV file, connect to the watch through the Espruino web IDE (https://www.espruino.com/ide/). From there the files stored on the watch can be downloaded by clicking the storage icon in the IDE's central column.



