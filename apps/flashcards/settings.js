(function(back) {
  var storage = require("Storage");

  var settingsFile = "flashcards.settings.json";
  var dataFile = "flashcards.data.json";
  var trelloTimeout = 3000;
  var trelloURL = "https://api.trello.com/1/lists/$cardsListId/cards/?fields=name%2Cdesc%2Clist";

  var settings = Object.assign({
    listId: ""
  }, storage.readJSON(settingsFile, true) || {});

  function writeSettings() {
    storage.writeJSON(settingsFile, settings);
  }

  var settingsMenu = {
    "" : { "title" : "Flash Cards" },
    "< Back" : () => back(),
    /*"List ID": {
      value: settings.listId,
      onchange: v=> { settings.listId=v; writeSettings();}
     }
    ,*/
    "Get from Trello": () => {
      if (!storage.read(settingsFile)) { writeSettings();}
      E.showPrompt("Download cards?").then((v) => {
        let delay = 500;
        if (v) {
          if (Bangle.http)
          {
            if (settings.listId)
            {
              delay = delay + trelloTimeout;
              E.showMessage('i: downloading');
              Bangle.http(trelloURL.replace("$cardsListId", settings.listId),
              {
                timeout : trelloTimeout,
                method: "GET",
                headers: { "Content-Type": "application/json" }
              }).then(data=>{
                var cardsJSON = JSON.parse(data.resp);
                storage.write(dataFile, JSON.stringify(cardsJSON));
                E.showMessage('i: downloaded');
              })
              .catch((e) => {
                  E.showMessage("e: " + e);
              });
            } else {
              E.showMessage("e: list Id not found");
            }
          } else {
            E.showMessage("e: Gadgetbridge not found");
          }
        }
        setTimeout(() => E.showMenu(settingsMenu), delay);
      });
    }
  }
  // Show the menu
  E.showMenu(settingsMenu);
})//(load)