//OLD Code
//override require to filter require("message")
/*global.require_real=global.require;
global.require = (_require => file => {
    if (file==="messages") file = "messagesProxy";    
    return _require(file);
})(require);*/

//the file on the device is called "boot_messages_light.boot.js"
//it's NOT an error!
//it's for the boot order

Bangle.on("message", (type, msg) => require("messages_light.listener.js").listener(type, msg));
