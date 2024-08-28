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
