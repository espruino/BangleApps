# Phone Reminder
This app detects when bluetooth disconnects from the watch and shows you a prompt so you can check if you left your phone behind.
When the prompt shows, you can choose to set the location you are currently at as a familiar location, so it won't alert you whenever you are nearby.

This app uses the `MyLocation` app. To set up dynamic location updating with an iOS device, you can use the `BangleDumpLocation` shortcut to push the lcoation. 
For more information on automating this and setup, look [here.](https://banglejs.com/apps/?id=ios&readme)

This app does not use the watch GPS.

## Settings
* <b>Precision</b> - Change how close you need to be to a familiar location in order for it to not alert you.
* <b>Check Delay</b> - Change how long after the phone is disconnected that it alerts you. If your phone randomly disconnects and then reconnects, adjusting this value will ensure it does not get triggered until that time is up and it is still disconnected.
* <b>Delete Locations</b> - Deletes all familiar locations.
  
## TODO
- Add a setting to use watch GPS to get the location instead of myLocation.
- Make a way to save phone MAC address to know what device is connected

## Creator
RKBoss6
