

if (require("Storage").read("messagegui")){ // "messagegui" module is installed
    require("messages").openGUI();
    console.log("Opened Messages UI");
    Bangle.load("messagegui");
}


function stop() {
    g.setBgColor(0, 1, 1);
    g.clear();
    g.reset();
    load();
}
var txt = 'No Messages';
try{
    console.log("try delete messages");
    var MESSAGES = require("messages").getMessages();
    MESSAGES = [];
    txt = 'Deleted all messages';
    console.log("worked");
}catch(e){}
g.setBgColor('#ffff00');
g.setColor('#000000');
g.clear();

g.setFont('6x8:3');
g.setFontAlign(0, 0);
g.setColor('#000000');
g.drawString(g.wrapString(txt, g.getWidth()).join("\n"), g.getWidth()/2, g.getHeight()/2);

Bangle.loadWidgets();
Bangle.drawWidgets();

//E.showMessage(txt,{
//    title:"XXL Messages",
//    img:atob("FBQBAfgAf+Af/4P//D+fx/n+f5/v+f//n//5//+f//n////3//5/n+P//D//wf/4B/4AH4A=") // (i)
//})

setTimeout(stop, 4000);

