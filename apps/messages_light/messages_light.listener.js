exports.listener = function(type, event) {

    /*
    //salva gli eventi che arrivano su file
    events=require("Storage").readJSON("events_log",true) || [];
    events.push ( event)
    require("Storage").writeJSON("events_log",events);*/
  
    //if (event.handled) return; // already handled/app open
    if( type=="music" || event.id=="music") return; //lo lascio gestire a qualcun altro

    //se arrivo qua gestisco io
    //non mi preoccupo di salvare ( a meno di problemi a mantenere tanti messaggi in queue nella ram...)
    event.handled=true;



    let callApp;
    //se l'app non è aperta
    if ("undefined"==typeof manageEvent)
    {
        if(event.t=="remove") return; //l'app non è aperta, non c'è nessun messaggio da rimuovere dalla queue -> non lancio l'app
        
        //chiamo la load dell'app
        callApp=function(event){
            require("Storage").writeJSON("messages_light.NewEvent.json",event);
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
     
 
    callApp(event);

}


