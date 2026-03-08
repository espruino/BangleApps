/*
Intentional
Send Android intents via Gadgetbridge
*/

const storage = require("Storage");

// ---------- Load Data Safely ----------
let data = storage.readJSON("intentional.json",1);

if (!data || !data.items) {
  data = {items:[]};
}


// ---------- Send Intent ----------
function sendIntent(action) {

  Bluetooth.println(JSON.stringify({
    t:"intent",
    action:action
  }));

  Bangle.buzz(40);
}


// ---------- Menu Builder ----------
function showMenu(items,title){

  let menu = {
    "":{title:title},
    "< Back":()=>load()
  };

  let sepCount = 0;

  items.forEach(item=>{

    // TASK
    if(item.type==="task"){

      let label = item.name || "Task";

      menu[label] = ()=>sendIntent(item.intent);

    }


    // FOLDER
    if(item.type==="folder"){

      let label = "▶ " + (item.name || "Folder");

      menu[label] = ()=>{
        showMenu(item.items || [], item.name || "Folder");
      };

    }


    // SEPARATOR
    if(item.type==="separator"){

      sepCount++;

      let label = "────────────"+("\u200B".repeat(sepCount));

      menu[label] = {value:""};

    }

  });

  E.showMenu(menu);
}


// ---------- Init ----------
Bangle.loadWidgets();
Bangle.drawWidgets();

showMenu(data.items,"Intentional");