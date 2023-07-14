(function(back) {
  var storage = require("Storage");

  var settingsFile = "flashcards.settings.json";
  var dataFile = "flashcards.data.json";
  var trelloTimeout = 3000;
  var trelloURL = "https://api.trello.com/1/lists/$cardsListId/cards/?fields=name%2Cdesc%2Clist";

  var settings = Object.assign({
    listId: "",
    fontSize: 1,
    cardWidth: 9,
    swipeGesture: 1
  }, storage.readJSON(settingsFile, true) || {});

  function writeSettings() {
    storage.writeJSON(settingsFile, settings);
  }

  const fontSizes = [/*LANG*/"Small",/*LANG*/"Medium",/*LANG*/"Large"];
  const swipeGestures = [/*LANG*/"Stroke",/*LANG*/"Drag"];  
  var settingsMenu = {
    "" : { "title" : "Flash Cards" },
    "< Back" : () => back(),     
    /*LANG*/"Get from Trello": () => {
      if (!storage.read(settingsFile)) { writeSettings();}
      E.showPrompt(/*LANG*/"Download cards?").then((v) => {
        let delay = 500;
        if (v) {
          if (Bangle.http)
          {
            if (settings.listId)
            {
              delay = delay + trelloTimeout;
              E.showMessage(/*LANG*/"Downloading");
              Bangle.http(trelloURL.replace("$cardsListId", settings.listId),
              {
                timeout : trelloTimeout,
                method: "GET",
                headers: { "Content-Type": "application/json" }
              }).then(data=>{
                var cardsJSON = JSON.parse(data.resp);
                storage.write(dataFile, JSON.stringify(cardsJSON));
                E.showMessage(/*LANG*/"Downloaded");
              })
              .catch((e) => {
                  E.showMessage(/*LANG*/"Error:" + e);
              });
            } else {
              E.showMessage(/*LANG*/"List Id not found");
            }
          } else {
            E.showMessage(/*LANG*/"Gadgetbridge not found");
          }
        }
        setTimeout(() => E.showMenu(settingsMenu), delay);
      });
    },
    /*LANG*/"Font size": {
      value: settings.fontSize,
      min: 0, max: 2, wrap: true,
      format: v => fontSizes[v],
      onchange: v => { settings.fontSize = v; writeSettings(); }
    },
    /*LANG*/"Card width": {
      value: settings.cardWidth,
      min: 6, max: 12,
      onchange: v => { settings.cardWidth = v; writeSettings(); }
    },    
    /*LANG*/"Swipe gesture": {
      value: settings.swipeGesture,
      min: 0, max: 1, wrap: true,
      format: v => swipeGestures[v],
      onchange: v => { settings.swipeGesture = v; writeSettings(); }
    }
  }
  // Show the menu
  E.showMenu(settingsMenu);
})//(load)