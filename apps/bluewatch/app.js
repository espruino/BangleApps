let bluewatch=require("bluewatch")

function findPhone(){
  bluewatch.sendData("FindPhone")
    E.showPrompt("Finding phone...",{
      buttons:{"Stop":false}
    }).then(function(v){
      bluewatch.sendData("StopFindPhone")
      E.showMenu(mainmenu)
    })
}
let buildMenu=function(){
  var mainmenu = {
    "": { "title": "BlueWatch" }, 
    "Connected? ":global.phoneConnected||false,
    "Messages":function(){load("messagegui.app.js")},
    "Find phone": function() { 
      findPhone();
    },

    "Send Health Data": function() { 
      bluewatch.sendHealthData()
    },

    "Request Location": function() { 
      bluewatch.sendData("Request Location")
    },
    "Request Weather": function() { 
      bluewatch.sendData("Request Weather")
    }

  };

  // Display the menu
  E.showMenu(mainmenu);
}

Bangle.loadWidgets()
Bangle.drawWidgets()
buildMenu()