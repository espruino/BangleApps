/*
Intentional
Send Android intents via Gadgetbridge
*/

const storage = require("Storage");

// Load Data Safely
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
let menuStack = [];
function showMenu(items,title){

  let menu = {
    "":{title:title},
    "< Back": () => {
  if (menuStack.length) {
    let prev = menuStack.pop();
    showMenu(prev.items, prev.title);
  } else {
    load();
  }
}
  };

  let sepCount = 0;

  items.forEach(item=>{

    // TASK
    if(item.type==="task"){

      let label = item.name || "Task";

      menu[label] = ()=>sendIntent(item.intent);

    }

    // APP
    if(item.type==="app"){

      let label = item.name || "App";

      menu[label] = () =>load(item.app);
    }

    // FOLDER
    if(item.type==="folder"){

      let label = "+" + (item.name || "Folder");

      menu[label] = ()=>{

        menuStack.push({
        items: items,
        title: title
      });

      showMenu(
        item.items || [],
        item.name || "Folder"
  );

};

    }

    // SEPARATOR
    if(item.type==="separator"){

      sepCount++;

      let label = "------------" + " ".repeat(sepCount);

      menu[label] = {value:""};

    }

  });

  E.showMenu(menu);
}


// ---------- Init ----------
Bangle.loadWidgets();
Bangle.drawWidgets();

showMenu(data.items,"Intentional");

// ---------- To handle gadgetbridge not ready ----------
  setTimeout(() => {
    Bluetooth.println("");
  }, 500);