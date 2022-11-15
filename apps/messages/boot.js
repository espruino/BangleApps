let f = function(type,event){
    require("messages").pushMessage(event);  
};
Bangle.on("message",f );
Bangle.on("call", f );