/**
 * This library can be used to read all triggers that a user
 * configured and send a trigger to homeassistant.
 */
function _getIcon(){
    const icon = this.icon;
    if(icon == "light"){
      return {
        width : 48, height : 48, bpp : 1,
        transparent : 0,
        buffer : require("heatshrink").decompress(atob("AAMBwAFE4AFDgYFJjgFBnAFBjwXBvAFBh4jBuAFCAQPwAQMHAQPgEQQCBEgcf/AvDn/8Aof//5GDAoJOBh+BAoOB+EP8YFB4fwgfnAoPnGANHAoPjHYQFBHYQFd44pDg47C4/gh/DIIZNFLIplGgF//wFIgZ9BRIUHRII7Ch4FBUIUOAoKzCjwFEhgCBmDpIVooFFh4oCAA4LFC5b7BAob1BAYI="))
      };
    } else if(icon == "door"){
      return {
        width : 48, height : 48, bpp : 1,
        transparent : 0,
        buffer : require("heatshrink").decompress(atob("AAM4Aok/4AED///Aov4Aon8DgQGBAv4FpnIFKJv4FweAQFFAgQFB8AFDnADC"))
      };
    } else if (icon == "fire"){
      return {
        width : 48, height : 48, bpp : 1,
        transparent : 0,
        buffer : require("heatshrink").decompress(atob("ABsDAokBwAFE4AFE8AFE+AFE/AFJgf8Aon+AocHAokP/8QAokYAoUfAok//88ApF//4kDAo//AgMQAgIFCjgFEjwFCOYIFFHQIFDn/+AoJ/BAoIqBAoN//xCBAoI5BDIPAgP//gFB8AFChYFBgf//EJAogOBAoSgBAoMHAQIFEFgXAAoJEBv4FCNoQFGVYd/wAFEYYIFIvwCBDoV8UwQCBcgUPwDwDfQMBaIYADA"))
      };
    }

    // Default is always the HA icon
    return {
      width : 48, height : 48, bpp : 1,
      transparent : 0,
      buffer : require("heatshrink").decompress(atob("AD8BwAFDg/gAocP+AFDj4FEn/8Aod//wFD/1+FAf4j+8AoMD+EPDAUH+OPAoUP+fPAoUfBYk/C4l/EYIwC//8n//FwIFEgYFD4EH+E8nkP8BdBAonjjk44/wj/nzk58/4gAFDF4PgCIMHAoPwhkwh4FB/EEkEfIIWAHwIFC4A+BAoXgg4FDL4IFDL4IFDLIYFkAEQA=="))
    };
}

exports.getTriggers = function(){
    var triggers;

    try{
        triggers = require("Storage").readJSON("ha.trigger.json");
    } catch(e) {
        // In case there are no user triggers yet, we show the default...
        console.log("ha: error loading triggers:", e);
        triggers = [
            {display: "Empty", trigger: "NOP", icon: "ha"},
        ];
    }

    // We lazy load all icons, otherwise, we have to keep
    // all the icons n times in memory which can be
    // problematic for embedded devices. Therefore,
    // we lazy load icons only if needed using the getIcon
    // method of each trigger...
    triggers.forEach(trigger => {
        trigger.getIcon = _getIcon.bind(trigger);
    })

    return triggers;
}

exports.sendTrigger = function(triggerName){
    var retries=3;

    while(retries > 0){
        try{
            // Now lets send the trigger that we sould send.
            Bluetooth.println("");
            Bluetooth.println(JSON.stringify({
                t:"intent",
                action:"com.espruino.gadgetbridge.banglejs.HA",
                extra:{
                    trigger: triggerName
                }})
            );
            break;

        } catch(e){
            retries--;
        }
    }
}

exports.sendValue = function(trigger, value){
    Bluetooth.println(
        JSON.stringify({
            t: "intent",
            action: "com.espruino.gadgetbridge.banglejs.HA",
            extra: { trigger, value },
        })
    );
};
