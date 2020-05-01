# Smart Switch app for BangleJS

![Demo of Smart Switch app in action](https://raw.githubusercontent.com/wdmtech/BangleApps/add-video/apps/smtswch/demo.gif)

Swipe right to turn a device ON
Swipe left to turn a device OFF

BTN1 (top-right) - Previous device (page)
BTN3 (bottom-right) - Next device (page)

# EspruinoHub

Install EspruinoHub following the directions at [https://github.com/espruino/EspruinoHub](https://github.com/espruino/EspruinoHub)

Here's the part that does the actual BTLE advertising on the watch itself:

```JS
NRF.setAdvertising({
  0xFFFF: [currentPage, page.state]
});
```

You should see data like the following:
  
```
ec:5a:c1:a7:fc:91 - Bangle.js fc91 (RSSI -83)
    ffff => {"data":"1,1"}
```

# Example Node-RED flow

Import the following JSON into Node-RED

```JSON
[{"id":"6d5e0685.62fed8","type":"switch","z":"37813ca5.3e4a04","name":"","property":"payload","propertyType":"msg","rules":[{"t":"eq","v":"0,0","vt":"str"},{"t":"eq","v":"0,1","vt":"str"},{"t":"eq","v":"1,0","vt":"str"},{"t":"eq","v":"1,1","vt":"str"},{"t":"eq","v":"2,0","vt":"str"},{"t":"eq","v":"2,1","vt":"str"},{"t":"eq","v":"3,0","vt":"str"},{"t":"eq","v":"3,1","vt":"str"},{"t":"eq","v":"4,0","vt":"str"},{"t":"eq","v":"4,1","vt":"str"}],"checkall":"true","repair":false,"outputs":10,"x":130,"y":520,"wires":[["2dd25bad.402644"],["e39ef382.eea6c"],["bb5aca6b.24e888"],["ed2bb6.25745448"],["869f116a.18c0a"],["d7661912.3d1f78"],[],[],[],[]]},{"id":"e39ef382.eea6c","type":"change","z":"37813ca5.3e4a04","name":"","rules":[{"t":"set","p":"payload","pt":"msg","to":"ON","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":320,"y":500,"wires":[["fc85fc8f.9622f8"]]},{"id":"2dd25bad.402644","type":"change","z":"37813ca5.3e4a04","name":"","rules":[{"t":"set","p":"payload","pt":"msg","to":"OFF","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":320,"y":460,"wires":[["fc85fc8f.9622f8"]]},{"id":"ed2bb6.25745448","type":"change","z":"37813ca5.3e4a04","name":"","rules":[{"t":"set","p":"payload","pt":"msg","to":"ON","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":320,"y":600,"wires":[["dbcd73c6.cc0bf"]]},{"id":"bb5aca6b.24e888","type":"change","z":"37813ca5.3e4a04","name":"","rules":[{"t":"set","p":"payload","pt":"msg","to":"OFF","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":320,"y":560,"wires":[["dbcd73c6.cc0bf"]]},{"id":"d7661912.3d1f78","type":"change","z":"37813ca5.3e4a04","name":"","rules":[{"t":"set","p":"payload","pt":"msg","to":"ON","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":320,"y":700,"wires":[["c8cb0b9b.1b7528"]]},{"id":"869f116a.18c0a","type":"change","z":"37813ca5.3e4a04","name":"","rules":[{"t":"set","p":"payload","pt":"msg","to":"OFF","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":320,"y":660,"wires":[["c8cb0b9b.1b7528"]]}]
```

# Future 

PRs welcome!

[ ] Add an HTML GUI for configuring devices inside the Bangle.js App Loader
[ ] Allow enable/disable of buzz/beep on change of device state 
