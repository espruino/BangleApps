(function(back) {
  let settings = require("messagegui").settings();
  const inApp = (global.__FILE__ && __FILE__.startsWith("messagelist."));

  function updateSetting(setting, value) {
    settings[setting] = value;
    let file;
    switch(setting) {
      case "flash":
      case "showRead":
      case "iconColorMode":
      case "maxMessages":
      case "maxUnreadTimeout":
      case "openMusic":
      case "repeat":
      case "unlockWatch":
      case "unreadTimeout":
      case "vibrate":
      case "vibrateCalls":
      case "vibrateTimeout":
        // Default app has this setting: update that file
        file = "messages";
        break;
      default:
        // write to our own settings file
        file = "messagelist";
    }
    file += ".settings.json";
    let saved = require("Storage").readJSON(file, true) || {};
    saved[setting] = value;
    require("Storage").writeJSON(file, saved);
  }

  function toggler(setting) {
    return {
      value: !!settings[setting],
      onchange: v => updateSetting(setting, v)
    };
  }

  function showIfMenu() {
    const tapOptions = [/*LANG*/"Message menu",/*LANG*/"Dismiss",/*LANG*/"Back",/*LANG*/"Nothing"];
    E.showMenu({
      "": {"title": /*LANG*/"Interface"},
      "< Back": () => showMainMenu(),
      /*LANG*/"Font size": {
        value: 0|settings.fontSize,
        min: 0, max: 2,
        format: v => [/*LANG*/"Small",/*LANG*/"Medium",/*LANG*/"Large",/*LANG*/"Huge"][v],
        onchange: v => updateSetting("fontSize", v)
      },
      /*LANG*/"On Tap": {
        value: settings.onTap,
        min: 0, max: tapOptions.length-1, wrap: true,
        format: v => tapOptions[v],
        onchange: v => updateSetting("onTap", v)
      },
      /*LANG*/"Dismiss button": toggler("button"),
    });
  }

  function showBMenu() {
    E.showMenu({
      "": {"title": /*LANG*/"Behaviour"},
      "< Back": () => showMainMenu(),
      /*LANG*/"Vibrate": require("buzz_menu").pattern(settings.vibrate, v => updateSetting("vibrate", v)),
      /*LANG*/"Vibrate for calls": require("buzz_menu").pattern(settings.vibrateCalls, v => updateSetting("vibrateCalls", v)),
      /*LANG*/"Vibrate for alarms": require("buzz_menu").pattern(settings.vibrateAlarms, v => updateSetting("vibrateAlarms", v)),
      /*LANG*/"Repeat": {
        value: settings.repeat,
        min: 0, max: 10,
        format: v => v ? v+"s" :/*LANG*/"Off",
        onchange: v => updateSetting("repeat", v)
      },
      /*LANG*/"Vibrate timer": {
        value: settings.vibrateTimeout,
        min: 0, max: 240, step: 10,
        format: v => v ? v+"s" :/*LANG*/"Forever",
        onchange: v => updateSetting("vibrateTimeout", v)
      },
      /*LANG*/"Unread timer": {
        value: settings.unreadTimeout,
        min: 0, max: 240, step: 10,
        format: v => v ? v+"s" :/*LANG*/"Off",
        onchange: v => updateSetting("unreadTimeout", v)
      },
      /*LANG*/"Auto-open": toggler("autoOpen"),
    });
  }

  function showMusicMenu() {
    E.showMenu({
      "": {"title": /*LANG*/"Music"},
      "< Back": () => showMainMenu(),
      /*LANG*/"Auto-open": toggler("openMusic"),
      /*LANG*/"Always visible": toggler("alwaysShowMusic"),
      /*LANG*/"Buttons": toggler("musicButtons"),
      /*LANG*/"Show album": toggler("showAlbum"),
    });
  }

  function showWidMenu() {
    E.showMenu({
      "": {"title": /*LANG*/"Widget"},
      "< Back": () => showMainMenu(),
      /*LANG*/"Flash icon": toggler("flash"),
      // /*LANG*/"Show Read": toggler("showRead"),
    });
  }

  function showUtilsMenu() {
    E.showMenu({
      "": {"title": /*LANG*/"Utilities"},
      "< Back": () => showMainMenu(),
      /*LANG*/"Delete all": () => {
        E.showPrompt(/*LANG*/"Are you sure?",
          {title:/*LANG*/"Delete All Messages"})
          .then(isYes => {
            if (isYes) require("messages").write([]);
            showUtilsMenu();
          });
      }
    });
  }

  function showMainMenu() {
    E.showMenu({
      "": {"title": inApp ?/*LANG*/"Settings" :/*LANG*/"Messages"},
      "< Back": back,
      /*LANG*/"Interface": () => showIfMenu(),
      /*LANG*/"Behaviour": () => showBMenu(),
      /*LANG*/"Music": () => showMusicMenu(),
      /*LANG*/"Widget": () => showWidMenu(),
      /*LANG*/"Utils": () => showUtilsMenu(),
    });
  }

  showMainMenu();
})
