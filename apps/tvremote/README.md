# TV Remote
A [BangleJS 2](https://shop.espruino.com/banglejs2) app that allows the user to send TV input signals from their watch to their TV. 
Currenly there is only support for Panasonic viera TV's however support for other brands may be considered in interest is there.

# Requirements
1. The [Bangle GadgetBridge App](https://www.espruino.com/Gadgetbridge) with permissions allowed for `http requests`.
2. A domain name and DNS created.
3. A webserver that the DNS points to, that is set up to receive and process the watch http requests. [Here](https://github.com/Guptilious/banglejs-tvremote-webserver) is one I have created that should complete the full set up for users - provided they have their own domain name and DNS created.

# Set Up
You will need to upload the below JSON file to your BangleJS, which will be used for config settings. At minimum you must provide:
* `webServerDNS` address, which points to your webserver.
* `username` which should mirror what is included in your webservers auth config. If using my webserver it would be `config.json`.
* `password` which should mirror what is included in your webservers auth config. If using my webserver it would be `config.json`.

`port` and `tvIp` are optional as they can be manually assigned and updated via the tvremote watch app settings.

    ## Tv remote config example
    require("Storage").write("tvremote.settings.json", {
      "webServerDns": "",
      "tvIp": "",
      "port": "",
      "username": "",
      "password": ""
    });

# Usage
Main Menu
* Select TV type (panasonic is currently the only one supported)
* Settings takes you to the settings menu, that allows you to manually assign ports and IP's.

Settings Menu
* Device Select sends a http request to the webserver for a scrollable list devices to select.
* Manual IP takes standard number inputs and swipping up will provide a `.` for IP's.

Power Screen
* Press button - on/off.
* Swipe left - `App Menu`.
* Swipe Right - Main Menu

App Menu
* Scroll and select to send App menu input.
* Swipe left -  Selection menu.
* Swipe right - Power Screen.

Selection Menu
* ^ - up
* ! - down
* < - left
* `>` - right
* Swipe right - back
* Swipe left - select
* Swipe Down - Number Menu ( used for inputting key passwords).
* Swipe Up - Vol Commands

Vol Commands
* Swipe Down - Selection Menu
* Swipe right - rewind
* Swipe left - fast forward
* Swipe Up - Play/Pause

Back Button - Should take you back to the previous menu screen.

# Requests
If you have any issues or suggestions for improvements, please feel free to message [me](https://github.com/Guptilious). 




# Creator
[Guptilious](https://github.com/Guptilious)
