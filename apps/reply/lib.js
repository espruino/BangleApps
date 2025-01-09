exports.reply = function (options) {
  var keyboard = "textinput";
  try {
    keyboard = require(keyboard);
  } catch (e) {
    keyboard = null;
  }

  function constructReply(msg, replyText, resolve, reject) {
    if (!replyText) { 
      reject("");
      return;
    }

    var responseMessage = {msg: replyText};
    if (msg.id) {
      responseMessage = { t: "notify", id: msg.id, n: "REPLY", msg: replyText };
    }
    E.showMenu();
    if (options.sendReply == null || options.sendReply) {
      Bluetooth.println(JSON.stringify(responseMessage));
    }
    resolve(responseMessage);
  }

  return new Promise((resolve, reject) => {
    var menu = {
      "": {
        title: options.title || /*LANG*/ "Reply with:",
        back: function () {
          E.showMenu();
          reject("User pressed back");
        },
      }, // options
      /*LANG*/ "Compose": function () {
        keyboard.input().then((result) => {
          if (result)
            constructReply(options.msg ?? {}, result, resolve, reject);
          else
            E.showMenu(menu);
        });
      },
    };
    var replies =
      require("Storage").readJSON(
        options.fileOverride || "replies.json",
        true
      ) || [];

    replies.forEach((reply) => {
      var displayString = reply.disp ?? reply.text;
      var wrappedDisplayString = g.wrapString(displayString, 120);
      // Generally handles truncating nicely, but falls down in long runs of emoji since they count as one image
      if (wrappedDisplayString.length > 1) {
        displayString = wrappedDisplayString[0]+"...";
      }
      menu = Object.defineProperty(menu, displayString, {
        value: () => constructReply(options.msg ?? {}, reply.text, resolve, reject),
      });
    });

    if (!keyboard) delete menu[/*LANG*/ "Compose"];

    if (replies.length == 0) {
      if (!keyboard) {
        E.showPrompt(
          /*LANG*/ "Please install a keyboard app, or set a custom reply via the app loader!",
          {
            buttons: { Ok: true },
            remove: function () {
              reject(
                "Please install a keyboard app, or set a custom reply via the app loader!"
              );
            },
          }
        );
      } else {
        keyboard.input().then((result) => {
          constructReply(options.msg, result, resolve, reject);
        });
      }
    } else{
      E.showMenu(menu);
    }
  });
};
