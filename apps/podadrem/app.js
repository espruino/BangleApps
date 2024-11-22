{
/*
  Bluetooth.println(JSON.stringify({t:"intent", action:"", flags:["flag1", "flag2",...], categories:["category1","category2",...], mimetype:"", data:"",  package:"", class:"", target:"", extra:{someKey:"someValueOrString"}}));

  Podcast Addict is developed by Xavier Guillemane and can be downloaded on Google Play Store: https://play.google.com/store/apps/details?id=com.bambuna.podcastaddict&hl=en_US&gl=US
  
  How to use intents to control Podcast Addict: https://podcastaddict.com/faq/130
*/

let R;
let widgetUtils = require("widget_utils");
let backToMenu = false;
let dark = g.theme.dark; // bool

// The main layout of the app
let gfx = function() {
  widgetUtils.hide();
  R = Bangle.appRect;
  const marigin = 8;
  // g.drawString(str, x, y, solid)
  g.clearRect(R);
  g.reset();
  
  if (dark) {g.setColor(0xFD20);} else {g.setColor(0xF800);} // Orange on dark theme, RED on light theme.
  g.setFont("4x6:2");
  g.setFontAlign(1, 0, 0);
  g.drawString("->", R.x2 - marigin, R.y + R.h/2);

  g.setFontAlign(-1, 0, 0);
  g.drawString("<-", R.x + marigin, R.y + R.h/2);

  g.setFontAlign(-1, 0, 1);
  g.drawString("<-", R.x + R.w/2, R.y + marigin);

  g.setFontAlign(1, 0, 1);
  g.drawString("->", R.x + R.w/2, R.y2 - marigin);

  g.setFontAlign(0, 0, 0);
  g.drawString("Play\nPause", R.x + R.w/2, R.y + R.h/2);

  g.setFontAlign(-1, -1, 0);
  g.drawString("Menu", R.x + 2*marigin, R.y + 2*marigin);

  g.setFontAlign(-1, 1, 0);
  g.drawString("Wake", R.x + 2*marigin, R.y + R.h - 2*marigin);

  g.setFontAlign(1, -1, 0);
  g.drawString("Srch", R.x + R.w - 2*marigin, R.y + 2*marigin);

  g.setFontAlign(1, 1, 0);
  g.drawString("Speed", R.x + R.w - 2*marigin, R.y + R.h - 2*marigin);
};

// Touch handler for main layout
let touchHandler = function(_, xy) {
  let x = xy.x;
  let y = xy.y;
  let len = (R.w<R.h+1)?(R.w/3):(R.h/3);
  
  // doing a<b+1 seemed faster than a<=b, also using a>b-1 instead of a>=b.
  if ((R.x-1<x && x<R.x+len) && (R.y-1<y && y<R.y+len)) {
    //Menu
    Bangle.removeListener("touch", touchHandler);
    Bangle.removeListener("swipe", swipeHandler);
    backToMenu = true;
    E.showMenu(paMenu);
  } else if ((R.x-1<x && x<R.x+len) && (R.y2-len<y && y<R.y2+1)) {
    //Wake 
    gadgetbridgeWake();
  } else if ((R.x2-len<x && x<R.x2+1) && (R.y-1<y && y<R.y+len)) {
    //Srch
    Bangle.removeListener("touch", touchHandler);
    Bangle.removeListener("swipe", swipeHandler);
    E.showMenu(searchMenu);
  } else if ((R.x2-len<x && x<R.x2+1) && (R.y2-len<y && y<R.y2+1)) {
    //Speed 
    Bangle.removeListener("touch", touchHandler);
    Bangle.removeListener("swipe", swipeHandler);
    E.showMenu(speedMenu);
  } else if ((R.x-1<x && x<R.x+len) && (R.y+R.h/2-len/2<y && y<R.y+R.h/2+len/2)) {
    //Previous 
    btMsg("service", standardCls, "player.previoustrack");
  } else if ((R.x2-len+1<x && x<R.x2+1) && (R.y+R.h/2-len/2<y && y<R.y+R.h/2+len/2)) {
    //Next
    btMsg("service", standardCls, "player.nexttrack");
  } else if ((R.x-1<x && x<R.x2+1) && (R.y-1<y && y<R.y2+1)){
    //play/pause
    btMsg("service", standardCls, "player.toggle");
  }
};

// Swipe handler for main layout, used to jump backward and forward within a podcast episode.
let swipeHandler = function(LR, _) {
  if (LR==-1) {
    btMsg("service", standardCls, "player.jumpforward");
  }
  if (LR==1) {
    btMsg("service", standardCls, "player.jumpbackward");
  }
};

// Navigation input on the main layout
let setUI = function() {
// Bangle.setUI code from rigrig's smessages app for volume control: https://git.tubul.net/rigrig/BangleApps/src/branch/personal/apps/smessages/app.js
  Bangle.setUI(
    {mode : "updown",
      remove : ()=>{
        Bangle.removeListener("touch", touchHandler);
        Bangle.removeListener("swipe", swipeHandler);
        clearWatch(buttonHandler);
        widgetUtils.show();
      }
    },
      ud => {
        if (ud) Bangle.musicControl(ud>0 ? "volumedown" : "volumeup");
      }
  );
  Bangle.on("touch", touchHandler);
  Bangle.on("swipe", swipeHandler);
  let buttonHandler = setWatch(()=>{load();}, BTN, {edge:'falling'});
};

/*
The functions for interacting with Android and the Podcast Addict app
*/

let pkg = "com.bambuna.podcastaddict";
let standardCls = pkg + ".receiver.PodcastAddictPlayerReceiver";
let updateCls = pkg + ".receiver.PodcastAddictBroadcastReceiver";
//let speed = 1.0;

let simpleSearch = "";

let simpleSearchTerm = function() { // input a simple search term without tags, overrides search with tags (artist and track)
  require("textinput").input({
    text: simpleSearch
  }).then(result => {
    simpleSearch = result;
  }).then(() => {
    E.showMenu(searchMenu);
  });
};

let searchPlayWOTags = function() { //make a search and play using entered terms
  const searchString = simpleSearch;
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify({
    t: "intent",
    action: "android.media.action.MEDIA_PLAY_FROM_SEARCH",
    package: pkg,
    target: "activity",
    extra: {
      query: searchString
    },
    flags: ["FLAG_ACTIVITY_NEW_TASK"]
  }));
};

let gadgetbridgeWake = function() {
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify({
    t: "intent",
    target: "activity",
    flags: ["FLAG_ACTIVITY_NEW_TASK", "FLAG_ACTIVITY_CLEAR_TASK", "FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS", "FLAG_ACTIVITY_NO_ANIMATION"],
    package: "gadgetbridge",
    class: "nodomain.freeyourgadget.gadgetbridge.activities.WakeActivity"
  }));
};

// For stringing together the action for Podcast Addict to perform
let actFn = function(actName, activOrServ) {
  return "com.bambuna.podcastaddict." + (activOrServ == "service" ? "service." : "") + actName;
};

// Send the intent message to Gadgetbridge
let btMsg = function(activOrServ, cls, actName, xtra) {

  Bluetooth.println("");
  Bluetooth.println(JSON.stringify({
    t: "intent",
    action: actFn(actName, activOrServ),
    package: pkg,
    class: cls,
    target: "broadcastreceiver",
    extra: xtra
  }));
};

// Get back to the main layout
let backToGfx = function() {
  E.showMenu();
  g.clear();
  g.reset();
  setUI();
  gfx();
  backToMenu = false;
};

// Podcast Addict Menu
let paMenu = {
  "": {
    title: " ",
    back: backToGfx
  },
  "Controls": () => {
    E.showMenu(controlMenu);
  },
  "Speed Controls": () => {
    E.showMenu(speedMenu);
  },
  "Search and play": () => {
    E.showMenu(searchMenu);
  },
  "Navigate and play": () => {
    E.showMenu(navigationMenu);
  },
  "Wake the android": () => {
    gadgetbridgeWake();
    gadgetbridgeWake();
  },
  "Exit PA Remote": ()=>{load();}
};


let controlMenu = {
  "": {
    title: " ",
    back: () => {if (backToMenu) E.showMenu(paMenu);
                 if (!backToMenu) backToGfx();
                }
  },
  "Toggle Play/Pause": () => {
    btMsg("service", standardCls, "player.toggle");
  },
  "Jump Backward": () => {
    btMsg("service", standardCls, "player.jumpbackward");
  },
  "Jump Forward": () => {
    btMsg("service", standardCls, "player.jumpforward");
  },
  "Previous": () => {
    btMsg("service", standardCls, "player.previoustrack");
  },
  "Next": () => {
    btMsg("service", standardCls, "player.nexttrack");
  },
  "Play": () => {
    btMsg("service", standardCls, "player.play");
  },
  "Pause": () => {
    btMsg("service", standardCls, "player.pause");
  },
  "Stop": () => {
    btMsg("service", standardCls, "player.stop");
  },
  "Update": () => {
    btMsg("service", updateCls, "update");
  },
  "Messages Music Controls": () => {
    load("messagesmusic.app.js");
  },
};

let speedMenu = {
  "": {
    title: " ",
    back: () => {if (backToMenu) E.showMenu(paMenu);
                 if (!backToMenu) backToGfx();
                }
  },
  "Regular Speed": () => {
    //speed = 1.0;
    btMsg("service", standardCls, "player.1xspeed");
  },
  "1.5x Regular Speed": () => {
    //speed = 1.5;
    btMsg("service", standardCls, "player.1.5xspeed");
  },
  "2x Regular Speed": () => {
    //speed = 2.0;
    btMsg("service", standardCls, "player.2xspeed");
  },
  //"Faster" : ()=>{speed+=0.1; speed=((speed>5.0)?5.0:speed); btMsg("service",standardCls,"player.customspeed",{arg1:speed});},
  //"Slower" : ()=>{speed-=0.1; speed=((speed<0.1)?0.1:speed); btMsg("service",standardCls,"player.customspeed",{arg1:speed});},
};

let searchMenu = {
  "": {
    title: " ",

    back: () => {if (backToMenu) E.showMenu(paMenu);
                 if (!backToMenu) backToGfx();}

  },
  "Search term": () => {
    simpleSearchTerm();
  },
  "Execute search and play": () => {
    btMsg("service", standardCls, "player.play");
    setTimeout(() => {
      searchPlayWOTags();
      setTimeout(() => {
        btMsg("service", standardCls, "player.play");
      }, 200);
    }, 1500);
  },
  "Simpler search and play" : searchPlayWOTags,
};

let navigationMenu = {
  "": {
    title: " ",
    back: () => {if (backToMenu) E.showMenu(paMenu);
                 if (!backToMenu) backToGfx();}
  },
  "Open Main Screen": () => {
    btMsg("activity", standardCls, "openmainscreen");
  },
  "Open Player Screen": () => {
    btMsg("activity", standardCls, "openplayer");
  },
};

Bangle.loadWidgets();
setUI();
widgetUtils.hide();
gfx();
}
