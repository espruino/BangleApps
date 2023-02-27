//override require to filter require("message")
global.require_real=global.require;
global.require = (_require => file => {
    if (file==="messages") file = "messagesoverlay";
    return _require(file);
})(require);
  
