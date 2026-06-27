let bluewatch = require("bluewatch");

function findPhone() {
  bluewatch.sendData("FindPhone");
  E.showPrompt(/*LANG*/ "Finding phone...", {
    buttons: { Stop: false }
  }).then(function (v) {
    bluewatch.sendData("StopFindPhone");
    buildMenu();
  });
}

let buildMenu = function () {
  let text = /*LANG*/ "BlueWatch not connected";
  if (global.phoneConnected) {
    text = /*LANG*/ "BlueWatch Connected";
  } else if (NRF.getSecurityStatus().connected == false) {
    text = /*LANG*/ "No device connected";
  }

  var mainmenu = { "": { title: "BlueWatch" } };

  mainmenu[text] = true;
  mainmenu[/*LANG*/ "Messages"] = function () {
    load("messagegui.app.js");
  };
  if (global.phoneConnected) {
    mainmenu = Object.assign(mainmenu, {
      /*LANG*/ "Find phone": function () {
        findPhone();
      },

      /*LANG*/ "Send Health Data": function () {
        bluewatch.sendHealthData();
      },

      /*LANG*/ "Request Location": function () {
        bluewatch.sendData("Request Location");
      },
      /*LANG*/ "Request Weather": function () {
        bluewatch.sendData("Request Weather");
      }
    });
  }
  // Display the menu
  E.showMenu(mainmenu);
};

Bangle.loadWidgets();
Bangle.drawWidgets();
buildMenu();

NRF.on("connect", buildMenu);
NRF.on("disconnect", buildMenu);
Bangle.on("BlueWatchConnected", buildMenu);
