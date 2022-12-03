
//gestisco il messaggio a modo mio
exports.pushMessage = function(event) {

    //TODO: now i can't handle the music, so i call the real message app
    if( event.id=="music") return require_real("messages").pushMessage(event);

    //se l'app non è aperta
    if ("undefined"==typeof manageEvent)
    {
        if(event.t=="remove") return; //l'app non è aperta, non c'è nessun messaggio da rimuovere dalla queue -> non lancio l'app
        
        //la apro
        require_real("Storage").writeJSON("messages_light.NewEvent.json",event);
        load("messages_light.app.js");  
    }
    else
    {
        //altrimenti gli dico di gestire il messaggio
        manageEvent(event); 
    }
}


//Call original message library
exports.clearAll = function() { return require_real("messages").clearAll()}
exports.getMessages = function() { return require_real("messages").getMessages()}
exports.status = function() { return require_real("messages").status()}
exports.buzz = function() { return require_real("messages").buzz(msgSrc)} 
exports.stopBuzz = function() { return require_real("messages").stopBuzz()}