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

/* For example for maps:

// a message
{"t":"add","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"}
// maps
{"t":"add","id":1,"src":"Maps","title":"0 yd - High St","body":"Campton - 11:48 ETA","img":"GhqBAAAMAAAHgAAD8AAB/gAA/8AAf/gAP/8AH//gD/98B//Pg/4B8f8Afv+PP//n3/f5//j+f/wfn/4D5/8Aef+AD//AAf/gAD/wAAf4AAD8AAAeAAADAAA="}
// call
{"t":"add","id":"call","src":"Phone","name":"Bob","number":"12421312",positive:true,negative:true}
*/
{
  const B2 = process.env.HWVERSION>1, // Bangle.js 2?
    RIGHT = 1, LEFT = -1, // swipe directions
    UP = -1, DOWN = 1;    // updown directions
  const Layout = require("Layout");
  const debug = function() {
    if (global.DEBUG_MESSAGELIST) console.log.apply(console, ['messagelist:'].concat(arguments));
  }

  const settings = () => require("messagegui").settings();
  const fontTiny = "6x8"; // fixed size, don't use this for important things
  let fontNormal;
  // setFont() is also called after we close the settings screen
  const setFont = function() {
    const fontSize = settings().fontSize;
    if (fontSize===0) // small
      fontNormal = g.getFonts().includes("6x15") ? "6x15" : "6x8:2";
    else if (fontSize===2) // large
      fontNormal = g.getFonts().includes("6x15") ? "6x15:2" : "6x8:4";
    else // medium
      fontNormal = g.getFonts().includes("12x20") ? "12x20" : "6x8:3";
  };
  setFont();

  let active, back; // active screen, last active screen

  /// List of all our messages
  let MESSAGES;
  const saveMessages = function() {
    debug('saveMessages()');
    const noSave = ["alarm", "call", "music"]; // assume these are outdated once we close the app
    noSave.forEach(id => remove({id: id}));
    require("messages").write(MESSAGES
      .filter(m => m.id && !noSave.includes(m.id))
      .map(m => {
        delete m.show;
        return m;
      })
    );
  };
  const uiRemove = function() {
    debug('uiRemove()');
    if (musicTimeout) clearTimeout(musicTimeout);
    layout = undefined;
    Bangle.removeListener("message", onMessage);
    saveMessages();
    clearUnreadStuff();
    delete Bangle.appRect;
  };
  const quitApp = () => load(); // TODO: revert to Bangle.showClock after fixing memory leaks
  try {
    MESSAGES = require("messages").getMessages();
    // Apply fast loaded messages
    (Bangle.MESSAGES || []).forEach(m => require("messages").apply(m, MESSAGES));
    delete Bangle.MESSAGES;
    // Write them back to storage when we're done
    E.on("kill", saveMessages);
  } catch(e) {
    g.reset().clear();
    E.showPrompt(/*LANG*/"Message file corrupt, erase all messages?", {title:/*LANG*/"Delete All Messages"}).then(isYes => {
      // We are troubleshooting, so do a clean "load" in both cases (instead of Bangle.load)
      if (isYes) {    // OK: erase message file and reload this app
        require("messages").clearAll();
        load("messagelist.app.js");
      } else {
        load(); // well, this app won't work... let's go back to the clock
      }
    });
  }

  const setUI = function(options, cb) {
    debug('setUI(', options, cb?'<callback>':cb)
    delete Bangle.uiRemove; // don't clear out things when switching UI within the app
    options = Object.assign({mode:"custom", remove: () => uiRemove()}, options);
    // If options={} assume we still want `remove` to be called when leaving via fast load (so we must have 'mode:custom')
    Bangle.setUI(options, cb);
  };
  /**
   * Same as calling `new Layout(layout, options)`, except Bangle.uiRemove is not called
   * @param {object} layout 
   * @param {object} options 
   * @returns {Layout}
   */
  const makeLayout = function(layout, options) {
    const remove = Bangle.uiRemove;
    delete Bangle.uiRemove; // don't clear out things when setting up new Layout
    const result = new Layout(layout, options);
    if (remove) Bangle.uiRemove = remove;
    return result;
  }

  const remove = function(msg) {
    if (msg.id==="call") call = undefined;
    else if (msg.id==="map") map = undefined;
    else if (msg.id==="alarm") alarm = undefined;
    else if (msg.id==="music") music = undefined;
    else MESSAGES = MESSAGES.filter(m => m.id!==msg.id);
  };
  const buzz = function(msg) {
    return require("messages").buzz(msg.src);
  };
  const show = function(msg) {
    delete msg.show; // don't show this again
    if (msg.id==="call") showCall(msg);
    else if (msg.id==="map") showMap(msg);
    else if (msg.id==="alarm") showAlarm(msg);
    else if (msg.id==="music") showMusic(msg);
    else showMessage(msg);
  };

  const onMessage = function(type, msg) {
    debug(`onMessage(${type}`, msg);
    if (msg.handled) return;
    msg.handled = true;
    switch(type) {
      case "call":
        return onCall(msg);
      case "music":
        return onMusic(msg);
      case "map":
        return onMap(msg);
      case "alarm":
        return onAlarm(msg);
      case "text":
        return onText(msg);
      case "clearAll":
        MESSAGES = [];
        if (["messages", "menu"].includes(active)) showMenu();
        break;
      default:
        E.showAlert(/*LANG*/"Unknown message type:"+"\n"+type).then(goBack);
    }
  };
  Bangle.on("message", onMessage);

  const onCall = function(msg) {
    debug('onCall(', msg);
    if (msg.t==="remove") {
      call = undefined;
      return exitScreen("call");
    }
    // incoming call: show it
    call = msg;
    buzz(call);
    showCall();
  };
  const onAlarm = function(msg) {
    debug('onAlarm(', msg);
    if (msg.t==="remove") {
      alarm = undefined;
      return exitScreen("alarm");
    }
    alarm = msg;
    buzz(alarm);
    showAlarm();
  };
  let musicTimeout;
  const onMusic = function(msg) {
    debug('onMusic(', msg);
    const hadMusic = !!music;
    if (musicTimeout) clearTimeout(musicTimeout);
    musicTimeout = undefined;
    if (msg.t==="remove") {
      music = undefined;
      if (active==="main" && hadMusic) return showMain(); // refresh menu: remove "Music" entry (if not always visible)
      else return exitScreen("music");
    }

    music = Object.assign({}, music, msg);

    // auto-close after being paused
    if (music.state!=="play") musicTimeout = setTimeout(function() {
      musicTimeout = undefined;
      if (active==="music" && (!music || music.state!=="play")) quitApp();
    }, 60*1000); // paused for 1 minute
    // auto-close after "playing" way beyond song duration (because "stop" messages don't seem to exist)
    else musicTimeout = setTimeout(function() {
      musicTimeout = undefined;
      if (active==="music" && (!music || music.state==="play")) quitApp();
    }, 2*Math.max(music.dur || 0, 5*60)*1000); // playing: assume ended after twice song duration, or at least 10 minutes

    if (active==="music") showMusic(); // update music screen
    else if (active==="main" && !hadMusic) {
      if (settings().openMusic && music.state==="play" && music.track) showMusic();
      else showMain(); // refresh menu: add "Music" entry
    }
  };
  const onMap = function(msg) {
    debug('onMap(', msg);
    const hadMap = !!map;
    if (msg.t==="remove") {
      map = undefined;
      if (back==="map") back = undefined;
      if (active==="main" && hadMap) return showMain(); // refresh menu: remove "Map" entry
      else return exitScreen("map");
    }
    map = msg;
    if (["map", "music"].includes(active)) showMap(); // update map screen, or switch away from music (not other screens)
    else if (active==="main" && !hadMap) showMain(); // refresh menu: add "Map" entry
  };
  const onText = function(msg) {
    debug('onText(', msg);
    require("messages").apply(msg, MESSAGES);
    const mIdx = MESSAGES.findIndex(m => m.id===msg.id);
    if (!MESSAGES[mIdx]) if (back==="messages") back = undefined;
    if (active==="main") showMain(); // update message count
    if (MESSAGES.length===0) exitScreen("messages"); // removed last message
    else if (active==="messages") showMessage(messageNum);
    if (msg.new) buzz(msg);
    if (active!=="call") {// don't switch away from incoming call
      if (active!=="messages" || messageNum===mIdx) showMessage(mIdx);
    }
    if (active==="messages") drawFooter(); // update footer with new number of messages
  };

  const getImage = function(msg, def) {
    // app icons, provided by `messages` app
    return require("messageicons").getImage(msg);
  };
  const getImageColor = function(msg, def) {
    // app colors, provided by `messages` app
    return require("messageicons").getColor(msg, {default: def});
  };
  const getIcon = function(icon) {
    return require("messagegui").getIcon(icon);
  };
  const getIconColor = function(icon) {
    return require("messagegui").getColor(icon);
  };

  /*
  * icons should be 24x24px with 1bpp colors and transparancy
  */
  const getMessageImage = function(msg) {
    if (msg.img) return atob(msg.img);
    if (msg.id==="music") return getIcon("Music");
    if (msg.id==="back") return getIcon("Back");
    const s = (msg.src || "").toLowerCase();

    return getImage(s, "notification");
  };

  const showMap = function() {
    debug('showMap()');
    setActive("map");
    delete map.new;
    let m, distance, street, target, eta;
    m = map.title.match(/(.*) - (.*)/);
    if (m) {
      distance = m[1];
      street = m[2];
    } else {
      street = map.title;
    }
    m = map.body.match(/(.*) - (.*)/);
    if (m) {
      target = m[1];
      eta = m[2];
    } else {
      target = map.body;
    }
    let layout = makeLayout({
      type: "v", c: [
        {type: "txt", font: fontNormal, label: target, bgCol: g.theme.bg2, col: g.theme.fg2, fillx: 1, pad: 2},
        {
          type: "h", bgCol: g.theme.bg2, col: g.theme.fg2, fillx: 1, c: [
            {type: "txt", font: "6x8", label: "Towards"},
            {type: "txt", font: fontNormal, label: street},
          ]
        },
        {
          type: "h", fillx: 1, filly: 1, c: [
            map.img ? {type: "img", src: () => atob(map.img), scale: 2} : {},
            {
              type: "v", fillx: 1, c: [
                {type: "txt", font: fontNormal, label: distance || ""},
              ]
            },
          ]
        },
        {type: "txt", font: "6x8:2", label: eta}
      ]
    });
    layout.render();
    // go back on any input
    setUI({
      mode: "custom",
      back: goBack,
      btn: b => {
        if (B2 || b===2) goBack();
      },
      swipe: dir => {
        if (dir===RIGHT) showMain();
      },
    });
  };

  const toggleMusic = function() {
    const mc = cmd => {
      if (Bangle.musicControl) Bangle.musicControl(cmd);
    };
    if (!music) {
      music = {state: "play"};
      mc("play");
    } else if (music.state==="play") {
      music.state = "pause";
      mc("pause");
    } else {
      music.state = "play";
      mc("play");
    }
    if (layout && layout.musicIcon) {
      // musicIcon/musicToggle .src returns icon based on current music.state
      layout.update(layout.musicIcon);
      if (layout.musicToggle) layout.update(layout.musicToggle);
      layout.render();
    }
  };

  const doMusic = function(action) {
    if (!Bangle.musicControl) return;
    Bangle.buzz(50);
    if (action==="toggle") toggleMusic();
    else Bangle.musicControl(action);
  };
  const showMusic = function() {
    debug('showMusic()', music);
    if (active!==music) setActive("music");
    if (!music) music = {track: "<unknown>", artist: "<unknown>", album: "", state: "pause"};
    delete music.new;
    const w = Bangle.appRect.w-50; // title/album need to leave room for icon
    let artist, album;
    if (music.album && settings().showAlbum) {
      // max 2 lines for artist/album
      artist = g.setFont(fontNormal).wrapString(music.artist, w).slice(0, 2).join("\n");
      album = g.wrapString(music.album, w).slice(0, 2).join("\n");
    } else {
      // no album: artist gets 3 lines
      artist = g.setFont(fontNormal).wrapString(music.artist, w).slice(0, 3).join("\n");
      album = "";
    }
    // place (subtitle) on a new line
    let track = music.track.replace(/ \(/, "\n(");
    track = g.wrapString(track, Bangle.appRect.w).slice(0, 5).join("\n");
    // "unknown" n/c/dur can show up as -1
    let num, dur;
    if ("n" in music && music.n>0) {
      num = "#"+music.n;
      if ("c" in music && music.c>0) {
        num += "/"+music.c;
      }
      num = {type: "txt", font: fontTiny, bgCol: g.theme.bg, label: num};
    }
    if ("dur" in music && music.dur>0) {
      dur = Math.floor(music.dur/60)+":"+(music.dur%60).toString().padStart(2, "0");
      dur = {type: "txt", font: fontTiny, bgCol: g.theme.bg, label: dur};
    }
    let info;
    if (num && dur) info = {type: "h", fillx: 1, c: [{fillx: 1}, dur, {fillx: 1}, num, {fillx: 1},]};
    else if (num) info = num;
    else if (dur) info = dur;
    else info = {};

    layout = makeLayout({
      type: "v", c: [
        {
          type: "h", fillx: 1, bgCol: g.theme.bg2, col: g.theme.fg2, c: [
            {
              id: "musicIcon", type: "img", pad: 10, bgCol: g.theme.bg2, col: g.theme.fg2
              , src: () => getIcon((music.state==="play") ? "music" : "pause")
            },
            {
              type: "v", fillx: 1, c: [
                {type: "txt", font: fontNormal, col: g.theme.fg2, bgCol: g.theme.bg2, label: artist, pad: 2, id: "artist"},
                album ? {type: "txt", font: fontNormal, col: g.theme.fg2, bgCol: g.theme.bg2, label: album, pad: 2, id: "album"} : {},
              ]
            }
          ]
        },
        {type: "txt", halign: 0, font: fontNormal, bgCol: g.theme.bg, label: track, fillx: 1, filly: 1, pad: 2, id: "track"},
        settings().musicButtons ? {
          type: "h", fillx: 1, c: [
            B2 ? {} : {width: 4},
            {
              type: "btn", id: "previous", cb: () => doMusic("previous")
              , src: () => getIcon("previous")
            },
            {fillx: 1},
            {
              type: "btn", id: "musicToggle", cb: () => doMusic("toggle")
              , src: () => getIcon((music.state==="play") ? "pause" : "play")
            },
            {fillx: 1},
            {
              type: "btn", id: "next", cb: () => doMusic("next")
              , src: () => getIcon("next")
            },
            B2 ? {} : {width: 4},
          ]
        } : {},
        info,
      ]
    });
    layout.render();
    let options = {mode: "updown"};
    // B1 with buttons: left hand side of screen is used for "previous"
    if (B2 || !settings().musicButtons) options.back = goBack;
    setUI(options, ud => {
      if (ud) Bangle.musicControl(ud>0 ? "volumedown" : "volumeup");
      else {
        if (B2 || settings().musicButtons) goBack(); // B1 left-hand touch is "previous", so we need a way to go back
        else doMusic("toggle");
      }
    });

    Bangle.swipeHandler = dir => {
      if (dir!==0) doMusic(dir===RIGHT ? "previous" : "next");
    };
    Bangle.on("swipe", Bangle.swipeHandler);

    if (Bangle.touchHandler) Bangle.removeListener("touch", Bangle.touchHandler);
    if (settings().musicButtons) {
      // visible buttons
      // left = previous, middle = toggle, right = next
      if (B2) Bangle.touchHandler = (_side, xy) => {
        // accept touches on the whole bottom and pick the closest button
        if (xy.y<Bangle.appRect.y+Bangle.appRect.h/2) return; // ignore touches top half
        if (xy.x<Bangle.appRect.w/3) doMusic("previous");
        else if (xy.x>2*Bangle.appRect.w/3) doMusic("next");
        else doMusic("toggle");
      };
      else Bangle.touchHandler = (side) => {
        if (side===1) doMusic("previous");
        if (side===2) doMusic("next");
        if (side===3) doMusic("toggle");
      };
    } else {
      // no buttons: touch = toggle
      // B2 setUI sets touchHandler, override that (we only want up/down swipes from the UI)
      Bangle.touchHandler = (side, e) => {
        // B1: side 1 (left) = back, B2: only toggle for e outside widget area
        if ((!B2 && side>1) || (B2 && e.y>Bangle.appRect.y)) doMusic("toggle");
      };
    }
    Bangle.on("touch", Bangle.touchHandler);
  };

  let layout;

  const clearStuff = function() {
    debug('clearStuff()');
    delete Bangle.appRect;
    layout = undefined;
    setUI();
    g.reset().clearRect(Bangle.appRect);
  };
  const setActive = function(screen, args) {
    debug(`setActive(${screen}`, args);
    clearStuff();
    if (active && screen!==active) back = active;
    if (screen==="messages") messageNum = args;
    active = screen;
  };
  /**
   * Go back to previous screen, preserving history
   */
  const goBack = function() {
    if (back==="call" && call) showCall();
    else if (back==="map" && map) showMap();
    else if (back==="music" && music) showMusic();
    else if (back==="messages" && MESSAGES.length) showMessage();
    else if (back) showMain(); // previous screen was "main", or no longer valid
    else quitApp(); // no previous screen: go back to clock
  };
  /**
   * Leave screen, and make sure goBack() won't take us there anymore;
   * @param {string} screen
   */
  const exitScreen = function(screen) {
    if (back===screen) back = (active==="main") ? undefined : "main";
    if (active===screen) {
      active = undefined;
      goBack();
    }
  };
  const showMain = function() {
    debug('showMain()');
    setActive("main");
    let grid = {"": {title:/*LANG*/"Messages", align: 0, back: load}};
    if (call) grid[/*LANG*/"Incoming Call"] = {icon: "Phone", cb: showCall};
    if (alarm) grid[/*LANG*/"Alarm"] = {icon: "Alarm", cb: showAlarm};
    const unread = MESSAGES.filter(m => m.new).length;
    if (unread) {
      grid[unread+" "+/*LANG*/"New"] = {icon: "Unread", cb: () => showMessage(MESSAGES.findIndex(m => m.new))};
      grid[/*LANG*/"All"+` (${MESSAGES.length})`] = {icon: "Notification", cb: showMessage};
    } else {
      const allLabel = MESSAGES.length+" "+(MESSAGES.length===1 ?/*LANG*/"Message" :/*LANG*/"Messages");
      if (MESSAGES.length) grid[allLabel] = {icon: "Notification", cb: showMessage};
      else grid[/*LANG*/"No Messages"] = {icon: "Neg", cb: load};
    }
    if (unread<MESSAGES.length) {
      grid[/*LANG*/"Dismiss Read"] = {
        icon: "Trash", cb: () => {
          E.showPrompt(/*LANG*/"Are you sure?", {title:/*LANG*/"Dismiss Read Messages"}).then(isYes => {
            if (isYes) {
              MESSAGES.filter(m => !m.new).forEach(msg => {
                Bangle.messageResponse(msg, false);
                remove(msg);
              });
            }
            showMain();
          });
        }
      };
    }
    if (map) grid[/*LANG*/"Map"] = {icon: "Map", cb: showMap};
    if (music || settings().alwaysShowMusic) grid[/*LANG*/"Music"] = {icon: "Music", cb: showMusic};
    grid[/*LANG*/"settings"] = {icon: "settings", cb: showSettings};
    showGrid(grid);
  };
  const clamp = function(val, min, max) {
    if (val<min) return min;
    if (val>max) return max;
    return val;
  };
  /**
   * Show grid of labeled buttons,
   *
   * items:
   *   {
   *     cb: callback,
   *     img: button image,
   *     icon: icon name, // string, use getIcon(icon) instead of img
   *     col: icon color, // optional: defaults to getColor(icon)
   *   }
   * "" item is options:
   *   {
   *     title: string,
   *     back: callback,
   *     rows/cols: (optional) fit to this many columns/rows, omit for automatic fit
   *     align: bottom row alignment if items don't fit perfectly into a grid
   *            -1: left
   *             1: right
   *             0: left, but move final button to the right
   *             undefined: spread (can be unaligned with rest of grid!)
   *   }
   * @param items
   */
  const showGrid = function(items) {
    clearStuff();
    const options = items[""] || {},
      back = options.back || items["< Back"];
    const keys = Object.keys(items).filter(k => k!=="" && k!=="< Back");
    let cols;
    if (options.cols) {
      cols = options.cols;
    } else if (options.rows) {
      cols = Math.ceil(keys.length/options.rows);
    } else {
      const rows = Math.round(Math.sqrt(keys.length));
      cols = Math.ceil(keys.length/rows);
    }

    let l = {type: "v", c: []};
    if (options.title) {
      l.c.push({id: "title", type: "txt", label: options.title, font: (B2 ? "12x20" : "6x8:2"), fillx: 1});
    }
    const w = Bangle.appRect.w/cols, // set explicit width, because labels can stick out
      bgs = [g.theme.bgH, g.theme.bg2], // background colors used for buttons
      newRow = () => ({type: "h", filly: 1, c: []});
    let row = newRow(),
      cbs = [[]]; // callbacks for Bangle.js 2 touchHandler below
    keys.forEach(key => {
      const item = items[key],
        label = g.setFont(fontTiny).wrapString(key, w).join("\n");
      let color = "col" in item ? item.col : getIconColor(item.icon || "Unknown");
      if (color && bgs.includes(g.setColor(color).getColor())) color = undefined; // make sure button is not invisible
      row.c.push({
        type: "v", pad: 2, width: w, c: [
          {
            type: "btn",
            src: item.img || (() => getIcon(item.icon || "Unknown")),
            col: color,
            cb: B2
              ? undefined // We handle B2 touches below
              : () => setTimeout(item.cb), // prevent MEMORY error from running cb() inside the Layout touchHandler
          },
          {height: 2},
          {type: "txt", label: label, font: fontTiny},
        ]
      });
      if (B2) cbs[cbs.length-1].push(item.cb);
      if (row.c.length>=cols) {
        l.c.push(row);
        row = newRow();
        if (B2) cbs.push([]);
      }
    });
    if (row.c.length) {
      if (options.align!==undefined) {
        const filler = {width: w*(cols-row.c.length)};
        if (options.align=== -1) row.c.unshift(filler); // left
        else if (options.align===1) row.c.push(filler); // right
        else if (options.align===0) row.c.splice(row.c.length-1, 0, filler); // left, but final item on right
      }
      l.c.push(row);
    }
    layout = makeLayout(l, {back: back});
    layout.render();

    if (B2) {
      // override touchHandler: no need to hit buttons exactly, just pick the nearest
      if (Bangle.touchHandler) Bangle.removeListener("touch", Bangle.touchHandler);
      Bangle.touchHandler = (side, xy) => {
        if (xy.y<=Bangle.appRect.y) return; // widgetbar: ignore
        let rows = l.c.length,
          y = Bangle.appRect.y, h = Bangle.appRect.h;
        if (options.title) {
          rows--;
          y += layout.title.h;
          h -= layout.title.h;
        }
        const r = clamp(Math.floor(rows*(xy.y-y)/h), 0, rows-1); // row (0-indexed)
        let c; // column (0-indexed)
        if (r<rows-1) {
          // regular row
          c = clamp(Math.floor(cols*(xy.x-Bangle.appRect.x)/Bangle.appRect.w), 0, cols-1);
        } else {
          // bottom row: layout depends on align
          if (options.align=== -1) { // left
            c = clamp(Math.floor(cols*(xy.x-Bangle.appRect.x)/Bangle.appRect.w), 0, cols-1);
          } else if (options.align===1) { // right
            c = clamp(Math.floor(cols*(xy.x-Bangle.appRect.x)/Bangle.appRect.w)+(cols-cbs[r].length), 0, cols-1);
          } else if (options.align===0) { // left, but with final item on right
            c = clamp(Math.floor(cols*(xy.x-Bangle.appRect.x)/Bangle.appRect.w), 0, cols-1);
            if (c===cols-1) c = cbs[r].length-1; // final row=last item
            else if (c>cbs[r].length-2) return; // gap before final item
          } else { // spread
            c = clamp(Math.floor(cbs[r].length*(xy.x-Bangle.appRect.x)/Bangle.appRect.w), 0, cols-1);
          }
        }
        if (r<cbs.length && c<cbs[r].length) {// should always be true
          Bangle.buzz(50);
          cbs[r][c]();
        }
      };
      Bangle.on("touch", Bangle.touchHandler);
    }
  };

  const showSettings = function() {
    debug('showSettings()');
    setActive("settings");
    eval(require("Storage").read("messagelist.settings.js"))(() => {
      setFont();
      showMain();
    });
  };
  const showCall = function() {
    debug('showCall()');
    setActive("call");
    delete call.new;
    Bangle.setLocked(false);
    Bangle.setLCDPower(1);

    const w = g.getWidth()-48,
      lines = g.setFont(fontNormal).wrapString(call.title, w),
      title = (lines.length>2) ? lines.slice(0, 2).join("\n")+"..." : lines.join("\n");
    const respond = function(accept) {
      Bangle.buzz(50);
      Bangle.messageResponse(call, accept);
      remove(call);
      call = undefined;
      goBack();
    };
    let options = {};
    if (!B2) {
      options.btns = [
        {
          label:/*LANG*/"accept",
          cb: () => respond(true),
        }, {
          label:/*LANG*/"ignore",
          cb: goBack,
        }, {
          label:/*LANG*/"reject",
          cb: () => respond(false),
        }
      ];
    }

    layout = makeLayout({
      type: "v", c: [
        {
          type: "h", fillx: 1, bgCol: g.theme.bg2, col: g.theme.fg2, c: [
            {type: "img", pad: 10, src: () => getIcon("phone"), col: getIconColor("phone")},
            {
              type: "v", fillx: 1, c: [
                {type: "txt", font: fontTiny, label: call.src ||/*LANG*/"Incoming Call", bgCol: g.theme.bg2, col: g.theme.fg2, fillx: 1, pad: 2, halign: 1},
                title ? {type: "txt", font: fontNormal, label: title, bgCol: g.theme.bg2, col: g.theme.fg2, fillx: 1, pad: 2} : {},
              ]
            },
          ]
        },
        {type: "txt", font: fontNormal, label: call.body, fillx: 1, filly: 1, pad: 2, wrap: true},
        {
          type: "h", fillx: 1, c: [
            // button callbacks won't actually be used: setUI below overrides the touchHandler set by Layout
            {type: B2 ? "btn" : "img", src: () => getIcon("Neg"), cb: () => respond(false)},
            {fillx: 1},
            {type: B2 ? "btn" : "img", src: () => getIcon("Pos"), cb: () => respond(true)},
          ]
        }
      ]
    }, options);
    layout.render();
    setUI({
      mode: "custom",
      back: goBack,
      touch: (side, xy) => {
        if (B2 && xy.y<Bangle.appRect.y) return;
        if (side===1) respond(false);
        if (side===2) respond(true);
      },
      btn: b => {
        if (B2 || b===2) goBack();
        else if (b===1) respond(true);
        else respond(false);
      },
      swipe: dir => {
        if (dir===RIGHT) showMain();
      },
    });
  };
  const showAlarm = function() {
    debug('showAlarm()');
    // dismissing alarms doesn't seem to work, so this is simple */
    setActive("alarm");
    delete alarm.new;
    Bangle.setLocked(false);
    Bangle.setLCDPower(1);

    const w = g.getWidth()-48,
      lines = g.setFont(fontNormal).wrapString(alarm.title, w),
      title = (lines.length>2) ? lines.slice(0, 2).join("\n")+"..." : lines.join("\n");
    layout = makeLayout({
      type: "v", c: [
        {
          type: "h", fillx: 1, bgCol: g.theme.bg2, col: g.theme.fg2, c: [
            alarm.body ? {type: "img", pad: 10, src: () => getIcon("alarm"), col: getIconColor("alarm")} : {},
            {type: "txt", font: fontNormal, label: title ||/*LANG*/"Alarm", bgCol: g.theme.bg2, col: g.theme.fg2, fillx: 1, pad: 2, halign: 1},
          ]
        },
        alarm.body
          ? {type: "txt", font: fontNormal, label: alarm.body, fillx: 1, filly: 1, pad: 2, wrap: true}
          : {type: "img", pad: 10, scale: 3, src: () => getIcon("alarm"), col: getIconColor("alarm")},
      ]
    });
    layout.render();
    setUI({
      mode: "custom",
      back: goBack,
      btn: b => {
        if (B2 || b===2) goBack();
      },
      swipe: dir => {
        if (dir===RIGHT) showMain();
      },
    });
  };
  /**
   * Send message response, and delete it from list
   * @param {string|boolean} reply Response text, false to dismiss (true to open on phone)
   */
  const respondToMessage = function(reply) {
    const msg = MESSAGES[messageNum];
    if (msg) {
      Bangle.messageResponse(msg, reply);
      if (reply===false) remove(msg);
    }
    if (MESSAGES.length<1) goBack(); // no more messages
    else showMessage((msg && reply===false) ? messageNum : messageNum+1); // show next message
  };
  const showMessageActions = function() {
    let title = MESSAGES[messageNum].title || "";
    if (g.setFont(fontNormal).stringMetrics(title).width>Bangle.appRect.w-(B2 ? 0 : 20)) {
      title = g.wrapString("..."+title, Bangle.appRect.w-(B2 ? 0 : 20))[0].substring(3)+"...";
    }
    clearStuff();
    let grid = {
      "": {
        title: title ||/*LANG*/"Message",
        back: () => showMessage(messageNum),
        cols: 3, // fit all replies on first row, dismiss on bottom
      }
    };
    // Text replies don't work (yet)
    // grid[/*LANG*/"OK"] = {icon: "Ok", col: "#0f0", cb: () => respondToMessage("\u{1F44D}")}; // "Thumbs up" emoji
    // grid[/*LANG*/"Nak"] = {icon: "Nak", col: "#f00", cb: () => respondToMessage("\u{1F44E}")}; // "Thumbs down" emoji
    // grid[/*LANG*/"No Phone"] = {icon: "NoPhone", col: "#f0f", cb: () => respondToMessage("\u{1F4F5}")}; // "No Mobile Phones" emoji

    grid[/*LANG*/"Dismiss"] = {icon: "Trash", col: "#ff0", cb: () => respondToMessage(false)};
    showGrid(grid);
  };
  /**
   * Show message
   *
   * @param {number} [num=0] Message to show
   * @param {boolean} [bottom=false] Scroll message to bottom right away
   */
  let buzzing = false, moving = false, switching = false;
  let h, fh, offset;

  /**
   * draw (sticky) footer
   */
  const drawFooter = function() {
    // left hint: swipe from left for main menu
    g.reset().clearRect(Bangle.appRect.x, Bangle.appRect.y2-fh, Bangle.appRect.x2, Bangle.appRect.y2)
      .setFont(fontTiny)
      .setFontAlign(-1, 1) // bottom left
      .drawString(
        "\0"+atob("CAiBACBA/EIiAnwA")+ // back
        "\0"+atob("CAiBAEgkEgkSJEgA"), // >>
        Bangle.appRect.x+(B2 ? 1 : 28), Bangle.appRect.y2
      );
    // center message count+hints: swipe up/down for next/prev message
    const footer = `  ${messageNum+1}/${MESSAGES.length}  `,
      fw = g.stringWidth(footer);
    g.setFontAlign(0, 1); // bottom center
    if (B2 && messageNum>0 && offset<=0)
      g.drawString("\0"+atob("CAiBAABBIhRJIhQI"), Bangle.appRect.x+Bangle.appRect.w/2-fw/2, Bangle.appRect.y2); // ^ swipe to prev
    g.drawString(footer, Bangle.appRect.x+Bangle.appRect.w/2, Bangle.appRect.y2);
    if (B2 && messageNum<MESSAGES.length-1 && offset>=h-(Bangle.appRect.h-fh))
      g.drawString("\0"+atob("CAiBABAoRJIoRIIA"), Bangle.appRect.x+Bangle.appRect.w/2+fw/2, Bangle.appRect.y2); // v swipe to next
    // right hint: swipe from right for message actions
    g.setFontAlign(1, 1) // bottom right
      .drawString(
        "\0"+atob("CAiBABIkSJBIJBIA")+ // <<
        "\0"+atob("CAiBAP8AAP8AAP8A"), // = ("hamburger menu")
        Bangle.appRect.x2-(B2 ? 1 : 28), Bangle.appRect.y2
      );
  };
  const showMessage = function(num, bottom) {
    debug(`showMessage(${num}, ${!!bottom})`);
    if (num<0) num = 0;
    if (!num) num = 0; // no number: show first
    if (num>=MESSAGES.length) num = MESSAGES.length-1;
    setActive("messages", num);
    if (!MESSAGES.length) {
      // I /think/ this should never happen...
      return E.showPrompt(/*LANG*/"No Messages", {
        title:/*LANG*/"Messages",
        img: require("heatshrink").decompress(atob("kkk4UBrkc/4AC/tEqtACQkBqtUDg0VqAIGgoZFDYQIIM1sD1QAD4AIBhnqA4WrmAIBhc6BAWs8AIBhXOBAWz0AIC2YIC5wID1gkB1c6BAYFBEQPqBAYXBEQOqBAnDAIQaEnkAngaEEAPDFgo+IKA5iIOhCGIAFb7RqAIGgtUBA0VqobFgNVA")),
        buttons: {/*LANG*/"Ok": 1}
      }).then(showMain);
    }
    Bangle.setLocked(false);
    Bangle.setLCDPower(1);
    // only clear msg.new on user input
    const msg = MESSAGES[messageNum]; // message
    fh = 10; // footer height
    offset = 0;
    let oldOffset = 0;
    const move = (dy) => {
      offset = Math.max(0, Math.min(h-(Bangle.appRect.h-fh), offset+dy)); // clip at message height
      dy = oldOffset-offset; // real dy
      // move all elements to new offset
      const offsetRecurser = function(l) {
        if (l.y) l.y += dy;
        if (l.c) l.c.forEach(offsetRecurser);
      };
      offsetRecurser(layout.l);
      oldOffset = offset;
      draw();
    };
    const draw = () => {
      g.reset()
        .clearRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2-fh)
        .setClipRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2-fh);
      g.reset = () => g.setColor(g.theme.fg).setBgColor(g.theme.bg); // stop Layout resetting ClipRect
      layout.render();
      if (layout.button && h>Bangle.appRect.h-fh && offset<h-(Bangle.appRect.h-fh)) {
        // not yet at bottom: draw button "disabled", i.e. in fg+bg instead of fg2/fgH+bg2/bgH
        g.theme = Object.assign({}, g.theme); // allow overriding
        g.theme.fg2 = g.theme.fgH = g.theme.fg;
        g.theme.bg2 = g.theme.bgH = g.theme.bg;
        layout.render(layout.button);
        delete g.theme; // restore original
      }
      delete g.reset;
      // draw scrollbar (simply on top of everything)
      if (h>(Bangle.appRect.h-fh)) {
        const sbh = (Bangle.appRect.h-fh)/h*(Bangle.appRect.h-fh), // scrollbar height
          y1 = Bangle.appRect.y+offset/h*(Bangle.appRect.h-fh), y2 = y1+sbh;
        g.setColor(g.theme.bg).drawLine(Bangle.appRect.x2, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2-fh);
        g.setColor(g.theme.fg).drawLine(Bangle.appRect.x2, y1, Bangle.appRect.x2, y2);
      }
      drawFooter();
    };
    const buzzOnce = () => {
      if (buzzing) return;
      buzzing = true;
      Bangle.buzz(50).then(() => setTimeout(() => {buzzing = false;}, 500));
    };

    layout = getMessageLayout(msg);
    h = layout.l.h; // message height
    if (bottom) move(h); // scrolling backwards: jump to bottom of message
    else draw();
    const PAGE_SIZE = Bangle.appRect.h-fh;
    const // shared B1/B2 handlers
      back = () => {
        delete msg.new; // we mark messages as read on any input
        goBack();
      },
      swipe = dir => {
        delete msg.new;
        if (dir===RIGHT) showMain();
        else if (dir===LEFT) showMessageActions();
      },
      touch = (side, xy) => {
        delete msg.new;
        if (h<=Bangle.appRect.h-fh || offset>=h-(Bangle.appRect.h-fh)) { // already at bottom
          // B2: check for button-press
          //     setUI overrides Layout listeners, so we need to check for button presses ourselves
          if (B2 && layout.button) {
            const b = layout.button;
            // the button is at the bottom of the screen, so we accept touches all the way down
            if (xy.x>=b.x && xy.y>=b.y && xy.x<=b.x+b.w /*&& xy.y<=b.y+b.h*/) return b.cb();
          }
          if (B2 && xy.y<Bangle.appRect.y) return;
        }

        // first: pagedown until we reach the bottom
        if (h>Bangle.appRect.h-fh && offset<h-(Bangle.appRect.h-fh)) return move(+PAGE_SIZE);

        // B1: when scrolled all the way down, treat whole right-side as button
        if (!B2 && layout.button && side===2) return layout.button.cb();

        // touch anywhere else:
        switch(settings().onTap) {
          case 1: // Dismiss
            return respondToMessage(false);
          case 2: // Back
            return goBack();
          case 3: // Do nothing
            return;
          case 0: // Message Menu
          default:
            return showMessageActions();
        }
      };

    if (B2) { // Bangle.js 2
      setUI({
        mode: "custom",
        back: back,
        swipe: swipe,
        drag: e => {
          delete msg.new;
          if (!switching) {
            const dy = -e.dy;
            if (dy>0) { // up
              if (h>Bangle.appRect.h-fh && offset<h-(Bangle.appRect.h-fh)) {
                moving = true; // prevent scrolling right into next message
                move(dy);
              } else if (messageNum<MESSAGES.length-1) { // already at bottom: show next
                if (!moving) { // don't scroll right through to next message
                  Bangle.buzz(30);
                  switching = true; // don't process any more drag events until we lift our finger
                  showMessage(messageNum+1);
                }
              } else { // already at bottom of last message
                buzzOnce();
              }
            } else if (dy<0) { // down
              if (offset>0) {
                moving = true; // prevent scrolling right into prev message
                move(dy);
              } else if (messageNum>0) { // already at top: show prev
                if (!moving) { // don't scroll right through to previous message
                  Bangle.buzz(30);
                  switching = true; // don't process any more drag events until we lift our finger
                  showMessage(messageNum-1, true);
                }
              } else { // already at top of first message
                buzzOnce();
              }
            }
          }
          if (!e.b) {
            // touch end: we can swipe to another message (if we reached the top/bottom) or move the new message
            moving = false;
            switching = false;
          }
        },
        touch: touch,
      });
    } else { // Bangle.js 1
      setUI({
        mode: "updown",
        back: back,
      }, dir => {
        delete msg.new;
        if (dir===DOWN) {
          if (h>Bangle.appRect.h-fh && offset<h-(Bangle.appRect.h-fh)) {
            move(+PAGE_SIZE);
          } else if (messageNum<MESSAGES.length-1) { // bottom reached: show next
            Bangle.buzz(30);
            showMessage(messageNum+1);
          } else {
            buzzOnce(); // already at bottom of last message
          }
        } else if (dir===UP) {
          if (offset>0) {
            move(-PAGE_SIZE);
          } else if (messageNum>0) { // top reached: show previous
            Bangle.buzz(30);
            showMessage(messageNum-1, true);
          } else {
            buzzOnce(); // already at top of first message
          }
        } else { // button
          showMessageActions();
        }
      });
      Bangle.swipeHandler = swipe;
      Bangle.on("swipe", Bangle.swipeHandler);
      Bangle.touchHandler = touch;
      Bangle.on("touch", Bangle.touchHandler);
    } // Bangle.js 1/2
  };
  /**
   * Determine message layout information: size, fonts, and wrapped title/body texts
   *
   * @param msg
   * @returns {{h: number, w: number,
   *            src: (string),
   *            title: (string), titleFont: (string),
   *            body: (string), bodyFont: (string)}}
   */
  const getMessageLayoutInfo = function(msg) {
    // header: [icon][title]
    //         [ src]
    //
    // But: no title? -> use src as title
    let w, src = msg.src || "",
      title = msg.title || "",
      body = msg.body || "",
      h = 0, // total height
      th = 0, // title height
      ih = 46; // icon height: // icon(24) + internal padding(20) + icon<->src spacer(2)
    if (!title) {
      title = src;
      src = "";
    }

    // top bar
    if (title) {
      w = Bangle.appRect.w-59;  // icon(24) + padding:left(5) + padding:btn-txt(5) + internal btn padding(20) + padding:right(5)
      title = g.setFont(fontNormal).wrapString(title, w).join("\n");
      th += 2+g.stringMetrics(title).height; // 2px padding
    }
    if (src) {
      w = 59;  // icon(24) + padding:left(5) + padding:btn-txt(5) + internal btn padding(20) + padding:right(5)
      src = g.setFont(fontTiny).wrapString(src, w).join("\n");
      ih += g.stringMetrics(src).height;
    }

    h = Math.max(ih, th); // maximum of icon/title

    // body
    w = Bangle.appRect.w-4; // padding(2x2)
    body = g.setFont(fontNormal).wrapString(msg.body, w).join("\n");
    h += 4+g.stringMetrics(body).height; // padding(2x2)

    if (settings().button) h += 44; // icon(24) + padding(2x2) + internal btn padding(16)

    w = Bangle.appRect.w;
    // always expand to <full height>-<(10x)footer>
    h = Math.max(h, Bangle.appRect.h-10);

    return {
      src: src,
      title: title,
      body: body,
      h: h,
      w: w,
    };
  };

  const getMessageLayout = function(msg) {
    // Crafted so that on B2, with "medium" font, a message with
    //   icon + src + 2-line title + 2-line body + button
    // fits exactly, i.e. no need for scrolling
    const info = getMessageLayoutInfo(msg);
    const hCol = msg.new ? g.theme.fgH : g.theme.fg2,
      hBg = msg.new ? g.theme.bgH : g.theme.bg2;

    // lie to Layout library about available space
    Bangle.appRect = Object.assign({}, Bangle.appRect,
      {w: info.w, h: info.h, x2: Bangle.appRect.x+info.w-1, y2: Bangle.appRect.y+info.h-1});

    // make sure icon is not invisible
    let imageCol = getImageColor(msg);
    if (g.setColor(imageCol).getColor()==hBg) imageCol = hCol;

    layout = makeLayout({
      type: "v", c: [
        {
          type: "h", fillx: 1, bgCol: hBg, col: hCol, c: [
            {width: 3},
            {
              type: "v", c: [
                {type: "img", /*pad: 2,*/ src: () => getMessageImage(msg), col: imageCol},
                {height: 2},
                info.src ? {type: "txt", font: fontTiny, label: info.src, bgCol: hBg, col: hCol} : {},
              ]
            },
            info.title ? {type: "txt", font: fontNormal, label: info.title, bgCol: hBg, col: hCol, fillx: 1, pad: 2} : {},
            {width: 3},
          ]
        },
        {type: "txt", font: fontNormal, label: info.body, fillx: 1, filly: 1, pad: 2},
        {filly: 1},
        settings().button ? {
          type: "h", c: [
            B2 ? {} : {fillx: 1}, // Bangle.js 1: touching right side = press button
            {id: "button", type: "btn", pad: 2, src: () => getIcon("trash"), cb: () => respondToMessage(false)},
          ]
        } : {},
      ]
    });
    layout.update();
    delete Bangle.appRect;
    return layout;
  };

  /** this is a timeout if the app has started and is showing a single message
   but the user hasn't seen it (e.g. no user input) - in which case
   we should start a timeout for settings().unreadTimeout to return
   to the clock. */
  let unreadTimeout;
  /**
   * Stop auto-unload timeout and buzzing, remove listeners for this function
   */
  const clearUnreadStuff = function() {
    debug('clearUnreadStuff()');
    require("messages").stopBuzz();
    if (unreadTimeout) clearTimeout(unreadTimeout);
    unreadTimeout = undefined;
    ["touch", "drag", "swipe"].forEach(l => Bangle.removeListener(l, clearUnreadStuff));
    watches.forEach(w => clearWatch(w));
    watches = [];
  };

  let messageNum, // currently visible message
    watches = [], // button watches
    savedMusic = false; // did we find a stored "music" message when loading?
// special messages
  let call, music, map, alarm;
  /**
   * Find special messages, and remove them from MESSAGES
   */
  const findSpecials = function() {
    let idx = MESSAGES.findIndex(m => m.id==="call");
    if (idx>=0) call = MESSAGES.splice(idx, 1)[0];
    idx = MESSAGES.findIndex(m => m.id==="music");
    if (idx>=0) {
      music = MESSAGES.splice(idx, 1)[0];
      savedMusic = true;
    }
    idx = MESSAGES.findIndex(m => m.id==="map");
    if (idx>=0) map = MESSAGES.splice(idx, 1)[0];
    idx = MESSAGES.findIndex(m => m.src && m.src.toLowerCase().startsWith("alarm"));
    if (idx>=0) alarm = MESSAGES.splice(idx, 1)[0];
  };

  // Internal setUI suppresses Bangle.uiRemove between internal screens, so we
  // need to call setUI to run uiRemove from previous app when fast-loaded.
  // GW: This shouldn't be needed! When fast loading setUI() gets called automatically
  Bangle.setUI();
  Bangle.loadWidgets();
  require("messages").toggleWidget(false);
  Bangle.drawWidgets();
  findSpecials(); // sets global vars for special messages
  // any message we asked to show?
  const showIdx = MESSAGES.findIndex(m => m.show);
  // any new text messages?
  const newIdx = MESSAGES.findIndex(m => m.new);

  // figure out why the app was loaded
  if (showIdx>=0) show(showIdx);
  else if (call && call.new) showCall();
  else if (alarm && alarm.new) showAlarm();
  else if (map && map.new) showMap();
  else if (music && music.new && settings().openMusic) {
    if (settings().alwaysShowMusic===undefined) {
      // if not explicitly disabled, enable this the first time we see music
      let s = settings();
      s.alwaysShowMusic = true;
      require("Storage").writeJSON("messages.settings.json", s);
    }
    showMusic();
  }
  // check for new message last: Maybe we already showed it, but timed out before
  // if that happened, and we're loading for e.g. music now, we want to show the music screen
  else if (newIdx>=0) {
    showMessage(newIdx);
    // auto-loaded for message(s): auto-close after timeout
    let unreadTimeoutSecs = settings().unreadTimeout;
    if (unreadTimeoutSecs===undefined) unreadTimeoutSecs = 60;
    if (unreadTimeoutSecs) {
      unreadTimeout = setTimeout(load, unreadTimeoutSecs*1000);
    }
  } else if (MESSAGES.length) { // not autoloaded, but we have messages to show
    back = "main"; // prevent "back" from loading clock
    showMessage();
  } else showMain();

  // stop buzzing, auto-close timeout on input
  ["touch", "drag", "swipe"].forEach(l => Bangle.on(l, clearUnreadStuff));
  (B2 ? [BTN1] : [BTN1, BTN2, BTN3]).forEach(b => watches.push(setWatch(clearUnreadStuff, b, false)));
}
