

let openMusic = function() {
    // only read settings file for first music message
    if ("undefined"==typeof exports._openMusic) {
        const SETTINGS_FILE_NAME="messages_light.settings.json";
        exports._openMusic = !!((require('Storage').readJSON(SETTINGS_FILE_NAME, true) || {}).openMusic);
    }
    return exports._openMusic;
}

//gestisco il messaggio a modo mio
exports.pushMessage = function(event) {

    //TODO: rimuovere questa riga per far funzionare la musica tramite l'app "message_light" 
    if( event.id=="music") return require_real("messages").pushMessage(event); 
    

    let callApp;
     //se l'app non è aperta
    if ("undefined"==typeof manageEvent)
    {
        if(event.t=="remove") return; //l'app non è aperta, non c'è nessun messaggio da rimuovere dalla queue -> non lancio l'app
        
        //chiamo la load dell'app
        callApp=function(event){
            require_real("Storage").writeJSON("messages_light.NewEvent.json",event);
            load("messages_light.app.js");
        }
    }
    else
    {
        //dico all'app di gestire l'evento
        callApp=function(event){
            manageEvent(event); 
        }
    }
    

    //se il messaggio è una notifica -> gestisco l'evento
    //oppure
    //se music è definita ( vuol dire che l'app è aperta e mi è arrivata prima una richiesta di apertura in modalità "musica" via notifica o via launcher ) -> gestisco l'evento
    //oppure
    //se se è una notifica di musica ( definito dal primo controllo ) e nei settings ho salvato di aprire l'app in musica -> gestisco l'evento

    if( event.id!="music"  ||   typeof music !== "undefined" ||   openMusic())
        callApp(event);

}


//Call original message library
exports.clearAll = function() { return require_real("messages").clearAll()}
exports.getMessages = function() { return require_real("messages").getMessages()}
exports.status = function() { return require_real("messages").status()}
exports.buzz = function() { return require_real("messages").buzz(msgSrc)} 
exports.stopBuzz = function() { return require_real("messages").stopBuzz()}