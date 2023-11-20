
let overlayTimeout=undefined;
exports.listener = function(type, event) {

    
    //salva gli eventi che arrivano su file TOREMOVE
    /*events=require("Storage").readJSON("events_log",true) || [];
    events.push ( event)
    require("Storage").writeJSON("events_log",events);*/
  
    //if (event.handled) return; // already handled/app open
    if( type=="clearAll" || type=="music" || event.id=="music") return; //lo lascio gestire a qualcun altro

    //se arrivo qua gestisco io
    //non mi preoccupo di salvare ( a meno di problemi a mantenere tanti messaggi in queue nella ram...)
    event.handled=true;


    if( Bangle.CLOCK || global.__FILE__ === undefined || global.__FILE__ === ".bootcde" ||  global.__FILE__.startsWith("messages_light."))
    {
        //se non ci sono app aperte ( clock oppure c'è  messages_light)
        //continuo con la visualizzazione dell messaggio

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
    else{
        //TODO: BHOO!!!
        //vibro e basta?
        //faccio comparire un overlay veloce? 
        //uso l'overlay sempre? ( gestione di tutti gli eventi smadonnosa... )
        //salvo lo stato dell'app attuale( NON SO COME ), lancio la mia app e alla chiusura torno allo stato precedente?
        
        console.log(event);
        let ovr=undefined;
        let palette;
        let timeout;
        
        if(event.id=="call" && event.t!="remove")
        {
            let count=3;
            let idInter= setInterval(()=>{
              if(--count<=0)
                clearInterval(idInter);

              Bangle.buzz(100,1);
            },200);

            ovr = Graphics.createArrayBuffer(136,136,2,{msb:true});
            ovr.setColor(1).fillRect({x:0,y:0,w:135,h:135,r:8});
            ovr.setColor(2).setFont("Vector:30").setFontAlign(0,0).drawString("Call",68,20);
            var lines=ovr.wrapString(event.title,136);
            for(let i=0;i< lines.length;i++)
            ovr.setColor(2).setFont("Vector:20").setFontAlign(0,0).drawString(lines[i],68,50+i*15);
          
            palette=[0,g.toColor("#141"),g.toColor("#fff"),g.toColor("#FFF")];
            timeout=4000;
        }
        else if(event.t=="add" ||  event.t=="modify")
        {
            Bangle.buzz();
            ovr = Graphics.createArrayBuffer(136,136,2,{msb:true});
            ovr.setColor(1).fillRect({x:0,y:0,w:135,h:135,r:8});
            ovr.setColor(2).setFont("Vector:20").setFontAlign(0,0).drawString(event.src,68,15);
            ovr.setColor(2).setFont("Vector:15").setFontAlign(0,0).drawString(event.title,68,35);
            var lines=ovr.wrapString(event.body,136);
            for(let i=0;i< lines.length;i++)
            ovr.setColor(2).setFont("Vector:15").setFontAlign(0,0).drawString(lines[i],68,60+i*15);
          
          
            palette=[0,g.toColor("#09c"),g.toColor("#fff"),g.toColor("#FFF")];
            timeout=5000;
        }
      
      
        if(ovr===undefined)
          return;
      
      
        Bangle.setLCDPower(true);
      
        Bangle.setLCDOverlay({
        width:ovr.getWidth(), height:ovr.getHeight(),
        bpp:2, transparent:0,
        palette:new Uint16Array(palette),  
        buffer:ovr.buffer
        },20,20);

        Bangle.setLCDPower(true);

        if(overlayTimeout) clearTimeout(overlayTimeout);
          overlayTimeout=setTimeout(()=>{
            Bangle.setLCDOverlay();
            overlayTimeout=undefined;
          },timeout);
    }

}


