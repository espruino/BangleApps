/*
//OLD CODE -> backup purpose

let messageBootManager=function(type,event){
    //se l'app non è aperta
    if ("undefined"==typeof manageEvent)
    {
        if(event.t=="remove") return; //l'app non è aperta, non c'è nessun messaggio da rimuovere dalla queue -> non lancio l'app
        
        //la apro
        require("Storage").writeJSON("messages_light.NewEvent.json",{"event":event,"type":type});
        load("messages_light.app.js");  
    }
    else
    {
        //altrimenti gli dico di gestire il messaggio
        manageEvent(type,event); 
    }
}
Bangle.on("message", messageBootManager);
Bangle.on("call", messageBootManager);*/



//override require to filter require("message")
global.require_real=global.require;
global.require = (_require => file => {
    if (file==="messages") file = "messagesProxy";
    //else if (file==="messages_REAL") file = "messages";    //backdoor to real message
    
    return _require(file);
})(require);
  
