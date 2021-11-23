# Smart Switch app for BangleJS

This app allows you to remotely control devices (or anything else you like!) with:

* [Bangle.js](https://www.espruino.com/Bangle.js) (Hackable JavaScript Smartwatch)
* [EspruinoHub](https://github.com/espruino/EspruinoHub) (Bluetooth Low Energy -> MQTT bridge)
* [Node-RED](https://nodered.org) (Flow-based programming tool)

![Demo of Smart Switch app in action](https://raw.githubusercontent.com/wdmtech/BangleApps/add-video/apps/smtswch/demo.gif)

* Swipe right to turn a device ON
* Swipe left to turn a device OFF
* BTN1 (top-right) - Previous device (page)
* BTN3 (bottom-right) - Next device (page)

> Currently, devices can only be added/removed/changed by editing them in the app's source code. 

# How to use

First, you'll need a device that supports BLE. 

Install EspruinoHub following the directions at [https://github.com/espruino/EspruinoHub](https://github.com/espruino/EspruinoHub)

Install [Node-RED](https://nodered.org/docs/getting-started)

## Example Node-RED flow

Import the following JSON into Node-RED and configure the MQTT IN node to use your EspruinoHub's MQTT instance (default port is 1883):

```JSON
[{"id":"87c6f73e.f22038","type":"mqtt in","z":"a256522.ca0b0b","name":"⌚️BangleJS data","topic":"/ble/advertise/ec:5a:c1:a7:fc:91/data","qos":"2","datatype":"auto","broker":"b961407a.91beb","x":860,"y":100,"wires":[["c37809de.3fc538"]]},{"id":"c37809de.3fc538","type":"function","z":"a256522.ca0b0b","name":"Set topic, remove quotes","func":"msg.topic = \"any_topic_here\";\nmsg.payload = msg.payload.replace(/['\"]+/g, \"\")\n\nreturn msg;","outputs":1,"noerr":0,"x":1070,"y":100,"wires":[["9019be89.5b6d5"]]},{"id":"9019be89.5b6d5","type":"debug","z":"a256522.ca0b0b","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1250,"y":100,"wires":[]},{"id":"b961407a.91beb","type":"mqtt-broker","z":"","name":"","broker":"192.168.1.22","port":"1883","clientid":"","usetls":false,"compatmode":false,"keepalive":"60","cleansession":true,"birthTopic":"hello_there","birthQos":"0","birthPayload":"","closeTopic":"bye_now","closeQos":"0","closePayload":"true","willTopic":"bye_now","willQos":"0","willPayload":"true"}]
```

Replace the topic of the MQTT IN node to use the ID of your Bangle.js device, e.g:

`/ble/advertise/ec:5a:c1:a7:fc:91/data`

Once you see the MQTT IN node is configured correctly (it says `connected` below the node itself), try swiping in the Smart Switch app, and 
you should see some data in the Debug node.

The possibilities for switching things on and off via Bangle.js are now endless. Have fun!

# How it works

This is the code that does the actual [BLE advertising](https://www.espruino.com/BLE%20Advertising) on the watch itself:

```JS
NRF.setAdvertising({
  0xFFFF: [currentPage, page.state]
});
```

# Not working?

If you can't see any data in Node-RED after swiping, check to see if your device is advertising by visiting port 1888 of your EspruinoHub instance:

You should see something like the following:
  
```
ec:5a:c1:a7:fc:91 - Bangle.js fc91 (RSSI -83)
    ffff => {"data":"1,1"}
```

# Any comments?

[Tweet me!](https://twitter.com/BillyWhizzkid) 

# Future 

PRs welcome!

[ ] Add an HTML GUI for configuring devices inside the Bangle.js App Loader
[ ] Allow enable/disable of buzz/beep on change of device state 
