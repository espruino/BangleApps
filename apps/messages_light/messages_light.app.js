/* MESSAGES is a list of:
  {id:int,
    src,
    title,
    subject,
    body,
    sender,
    tel:string,
    new:true // not read yet
  }
*/




let LOG=function(){  
  //print.apply(null, arguments);
}


let settings= {
  NewEventFileName:"messages_light.NewEvent.json",
  fontSmall : "6x8",
  fontMedium : "Vector:16",
  fontBig : "Vector:20",
  fontLarge : "Vector:30",
  
  colHeadBg : g.theme.dark ? "#141":"#4f4",
  
  colBg : g.theme.dark ? "#000":"#fff",
  colLock : g.theme.dark ? "#ff0000":"#ff0000",

  quiet:!!((require('Storage').readJSON('setting.json', 1) || {}).quiet),
  timeOut:(require('Storage').readJSON("messages_light.settings.json", true) || {}).timeOut || "Off",
};




let EventQueue=[];    //in posizione 0, c'è quello attualmente visualizzato
let callInProgress=false;


//let justOpened=true;



//TODO: RICORDARSI DI FARE IL DELETE
var manageEvent = function(event) {

  event.new=true;

  LOG("manageEvent");
  LOG(event);

  if( event.id=="call"){
      showCall(event);
  }
  else if( event.id=="music"){
      //la musica non la gestisco più ( uso l'app standard o un altra app)
  }
  else{ 

    //-----------------
    //notification
    //-----------------
    if(event.t=="add"){
        EventQueue.unshift(event);
  
        if(!callInProgress)
          showMessage(event);
    }
    else if(event.t=="modify"){
        //cerco l'evento nella lista, se lo trovo, lo modifico, altrimenti lo pusho
        let find=false;
        EventQueue.forEach(element => {
          if(element.id == event.id)
          {
            find=true;
            Object.assign(element,event);
          }
        });
        if(!find)   //se non l'ho trovato, lo aggiungo in fondo
          EventQueue.unshift(event);
  
        if(!callInProgress)
          showMessage(event);
    }
    else if(event.t=="remove"){       
      

        //se non c'è niente nella queue e non c'è una chiamata in corso
        if( EventQueue.length==0 && !callInProgress)
          next();
  
        //se l'id è uguale a quello attualmente visualizzato  ( e non siamo in chiamata ) 
        if(!callInProgress &&  EventQueue[0] !== undefined && EventQueue[0].id == event.id)
          next();   //passo al messaggio successivo ( per la rimozione ci penserà la next ) 
  
        else{
          //altrimenti rimuovo tutti gli elementi con quell'id( creando un nuovo array )
          let newEventQueue=[];
          EventQueue.forEach(element => {
            if(element.id != event.id)
              newEventQueue.push(element);
          });

          //non sovrascrivo, cosi uso lo stesso oggetto in memoria e dovrei avere meno problemi di memory leak
          //EventQueue.length=0; // non più funzionante!
          EventQueue.splice(0,EventQueue.length);
          newEventQueue.forEach(element => {
            EventQueue.push(element);
          });
        }
    }
    //-----------------
    //notification
    //-----------------


  }
  
};






let showMessage = function(msg){
  LOG("showMessage");
  LOG(msg);

  updateTimeout();


  g.setBgColor(settings.colBg);


  if(typeof msg.CanScrollDown==="undefined")
    msg.CanScrollDown=false;
  if(typeof msg.CanScrollUp==="undefined")
    msg.CanScrollUp=false;





  // Normal text message display
  let title=msg.title, titleFont = settings.fontLarge, lines;
  if (title) {
    let w = g.getWidth()-48;
    if (g.setFont(titleFont).stringWidth(title) > w)
      titleFont = settings.fontMedium;
    if (g.setFont(titleFont).stringWidth(title) > w) {
      lines = g.wrapString(title, w);
      title = (lines.length>2) ? lines.slice(0,2).join("\n")+"..." : lines.join("\n");
    }
  }
  

 
  let Layout = require("Layout");
  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:settings.colHeadBg,  c: [
      { type:"btn", src:require("messageicons").getImage(msg), col:require("messageicons").getColor(msg), pad: 3},
      { type:"v", fillx:1, c: [
        {type:"txt", font:settings.fontSmall, label:msg.src||/*LANG*/"Message", bgCol:settings.colHeadBg, fillx:1, pad:2, halign:1 },
        title?{type:"txt", font:titleFont, label:title, bgCol:settings.colHeadBg, fillx:1, pad:2 }:{},
      ]},
    ]},
    {type:"v",fillx:1,filly:1,pad:2 ,halign:-1,c:[]},

   
   
    
  ]});
 

  if (!settings.quiet && msg.new)
  {
    msg.new=false;
    Bangle.buzz();
  }
    

  g.clearRect(Bangle.appRect);
  layout.render();

  PrintMessageStrings(msg);
  Bangle.setLCDPower(1);

  DrawLock();

};
let DrawLock=function()
{
  let w=8,h=8;
  let x = g.getWidth()-w;
  let y = 0;
  if(Bangle.isLocked())
    g.setBgColor(settings.colLock);
  else
    g.setBgColor(settings.colHeadBg);
  g.clearRect(x,y,x+w,y+h);
};






let showCall = function(msg)
{
  LOG("showCall");
  LOG(msg);
  // se anche prima era una call    PrevMessage==msg.id 
  //non so perchè prima era cosi
  if( msg.t=="remove")
  {
    LOG("hide call screen");
    next();    //dont shift
    return;
  }

  callInProgress=true;
  updateTimeout();


  //se è una chiamata ( o una nuova chiamata, diversa dalla precedente )
  //la visualizzo
  
  let title=msg.title, titleFont = settings.fontLarge, lines;
  if (title) {
    let w = g.getWidth()-48;
    if (g.setFont(titleFont).stringWidth(title) > w)
      titleFont = settings.fontMedium;
    if (g.setFont(titleFont).stringWidth(title) > w) {
      lines = g.wrapString(title, w);
      title = (lines.length>2) ? lines.slice(0,2).join("\n")+"..." : lines.join("\n");
    }
  }
  let Layout = require("Layout");
  layout = new Layout({ type:"v", c: [
    {type:"h", fillx:1, bgCol:settings.colHeadBg,  c: [
      { type:"btn", src:require("messageicons").getImage(msg), col:require("messageicons").getColor(msg), pad: 3},
      { type:"v", fillx:1, c: [
        {type:"txt", font:settings.fontSmall, label:msg.src||/*LANG*/"Message", bgCol:settings.colHeadBg, fillx:1, pad:2, halign:1 },
        title?{type:"txt", font:titleFont, label:title, bgCol:settings.colHeadBg, fillx:1, pad:2 }:{},
      ]},
    ]},
    {type:"txt", font:settings.fontMedium, label:msg.body,  fillx:1,filly:1,pad:2 ,halign:0}   
  ]});


  StopBuzzCall();
  if (  !settings.quiet  ) {
    if(msg.new)
    {
      msg.new=false;
      CallBuzzTimer = setInterval(function() {
          Bangle.buzz(500);
      }, 1000);
      
      Bangle.buzz(500);
    }
  }
  g.clearRect(Bangle.appRect);
  layout.render();
  PrintMessageStrings(msg);
  Bangle.setLCDPower(1);
  DrawLock();
};







  
let next=function(){
  LOG("next");
  StopBuzzCall();
  

  //se c'è una chiamata, non shifto
  if(!callInProgress)
    EventQueue.shift();    //passa al messaggio successivo, se presente - tolgo il primo

  callInProgress=false; 
  LOG(EventQueue.length);
  if( EventQueue.length == 0)
  {
    LOG("no element in queue - closing");
    setTimeout(_ => load());
    return;
  }

  
  showMessage(EventQueue[0]);

};



let CallBuzzTimer=undefined;
let StopBuzzCall=function()
{
  if (CallBuzzTimer){
    clearInterval(CallBuzzTimer);
    CallBuzzTimer=undefined;
  }
}
let DrawTriangleUp=function()
{
  g.fillPoly([169,46,164,56,174,56]);
}
let DrawTriangleDown=function()
{
  g.fillPoly([169,170,164,160,174,160]);
}




let ScrollUp=function()
{
  msg= EventQueue[0];

  if(typeof msg.FirstLine==="undefined")
    msg.FirstLine=0;
  if(typeof msg.CanScrollUp==="undefined")
    msg.CanScrollUp=false;

  if(!msg.CanScrollUp) return;
  
  msg.FirstLine = msg.FirstLine>0?msg.FirstLine-1:0;

  PrintMessageStrings(msg);
}
let ScrollDown=function()
{
  msg= EventQueue[0];
  if(typeof msg.FirstLine==="undefined")
    msg.FirstLine=0;
  if(typeof msg.CanScrollDown==="undefined")
    msg.CanScrollDown=false;

  if(!msg.CanScrollDown) return;
  
  msg.FirstLine = msg.FirstLine+1;
  PrintMessageStrings(msg);
}






let PrintMessageStrings=function(msg)
{
  let MyWrapString = function (str,maxWidth)
  {
    str=str.replace("\r\n","\n").replace("\r","\n");
    return g.wrapString(str,maxWidth);
  }


  if(typeof msg.FirstLine==="undefined")  msg.FirstLine=0;

  let bodyFont = typeof msg.bodyFont==="undefined"? settings.fontMedium : msg.bodyFont;
  let Padding=2;
  if(typeof msg.lines==="undefined")
  {
    g.setFont(bodyFont);
    msg.lines = MyWrapString(msg.body,g.getWidth()-(Padding*2))
    if ( msg.lines.length<=2)
    {
      bodyFont=  g.getFonts().includes("Vector")?"Vector:20":"6x8:3";
      g.setFont(bodyFont);
      msg.lines = MyWrapString(msg.body,g.getWidth()-(Padding*2))
      msg.bodyFont = bodyFont;
    }
  }

  

  //prendo le linee da stampare
  let NumLines=8;
  let linesToPrint = (msg.lines.length>NumLines) ? msg.lines.slice(msg.FirstLine,msg.FirstLine+NumLines):msg.lines;
  
    
  let yText=45;
  
  //invalido l'area e disegno il testo
  g.setBgColor(settings.colBg);
  g.clearRect(0,yText,176,176);
  let xText=Padding;
  yText+=Padding;
  g.setFont(bodyFont);
  let HText=g.getFontHeight();

  yText=((176-yText)/2)-(linesToPrint.length * HText / 2) + yText;

  if( linesToPrint.length<=2)
  {
    g.setFontAlign(0,-1);
    xText = g.getWidth()/2;
  }
  else
    g.setFontAlign(-1,-1);

  
  linesToPrint.forEach((line, i)=>{
    g.drawString(line,xText,yText+HText*i);
  });

  //disegno le freccie
  if(msg.FirstLine!=0)
  {
    msg.CanScrollUp=true;
    DrawTriangleUp();
  }
  else
    msg.CanScrollUp=false;

  if(msg.FirstLine+linesToPrint.length < msg.lines.length)
  {
    msg.CanScrollDown=true;
    DrawTriangleDown();
  }
  else
    msg.CanScrollDown=false;


}




let doubleTapUnlock=function(data) {
  updateTimeout();        
  if( data.double)  //solo se in double
  {
    Bangle.setLocked(false);
    Bangle.setLCDPower(1);
  }
}
let toushScroll=function(_, xy) { 
  updateTimeout();

  let height=176; //g.getHeight(); -> 176 B2
  height/=2;
  
  if(xy.y<height)
  {
    ScrollUp();
  }
  else
  {
    ScrollDown();
  }
}



let timeout;
const updateTimeout = function(){
if (settings.timeOut!="Off"){
    removeTimeout();
    if( callInProgress) return; //c'è una chiamata in corso -> no timeout
    //if( typeof music !== 'undefined'  && EventQueue.length==0 ) return; //ho aperto l'interfaccia della musica e non ho messaggi davanti -> no timeout


    let time=parseInt(settings.timeOut);  //the "s" will be trimmed by the parseInt
    timeout = setTimeout(next,time*1000); //next or Bangle.showClock/load()???
  }
};
const removeTimeout=function(){
  if (timeout) clearTimeout(timeout);
}


let main = function(){
  LOG("Main");

  g.clear();

  Bangle.on('lock', DrawLock);

  //se c'è una chiamata in corso NON devo togliere niente dal next ( in q)
  setWatch(_=> next(), BTN1,{repeat: true});

  //il tap è il tocco con l'accellerometro!
  Bangle.on('tap', doubleTapUnlock);
  Bangle.on('touch', toushScroll);

  //quando apro quest'app, do per scontato che c'è un messaggio da leggere posto in un file particolare ( messages_light.NewEvent.json )
  let eventToShow = require('Storage').readJSON(settings.NewEventFileName, true);
  require("Storage").erase(settings.NewEventFileName)
  if( eventToShow!==undefined)
    manageEvent(eventToShow);
  else
  {
    LOG("file event not found! -> ?? open debug text");
    setTimeout(_=>{      GB({"t":"notify","id":15754117198411,"src":"Hangouts","title":"A Name","body":"Debug notification \nmessage contents  demo demo demo demo"})    },0);
  }
  //justOpened=false;

};




main();