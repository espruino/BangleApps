
Intentional
========

A controll panel for creating, displaying, and invoking commands though GadgetBridge to an app that can consume them and act on them (ex. [Tasker](https://tasker.joaoapps.com/) )  It uses the App Customiser for easy editing. 

Set-Up
--------
On your mobile device, set up your application to recieve intents sent from the bangle.js to do some sort of action. Make sure that Gadgetbridge has intents enabled.

While you can edit intention.json to add menu items, it is easiest to use the app customiser in the App loader.
- `Menu Item Name` - The name of the Menu item
- `Intent` - the intent the watch is going to send (ex. com.bangle.camera.torch)
- `Folder` - Group menu items together
- `Seperator` - Give yourself someroom in the menu
- `GadgetBridge` - Device >> Settings >> Developer options >> Allow Intents
- `Tasker` - Set up a new Event Profile using "Intent Recieved" and the unique intent.  Associate a task with that profile

Acknowledgements
========
Many thanks to [João Dias](https://www.patreon.com/joaoapps) for Tasker development

Creator
--------

[ZubaZ21](https://github.com/ZubaZ21)

