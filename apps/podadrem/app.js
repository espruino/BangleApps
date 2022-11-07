/*
Bluetooth.println(JSON.stringify({t:"intent", action:"", flags:["flag1", "flag2",...], categories:["category1","category2",...], mimetype:"", data:"",  package:"", class:"", target:"", extra:{someKey:"someValueOrString"}}));

Podcast Addict is developed by Xavier Guillemane and can be downloaded on Google Play Store: https://play.google.com/store/apps/details?id=com.bambuna.podcastaddict&hl=en_US&gl=US

Podcast Addict can be controlled through the sending of remote commands called 'Intents'.
Some 3rd parties apps specialized in task automation will then allow you to control Podcast Addict. For example, you will be able to wake up to the sound of your playlist or to start automatically playing when some NFC tag has been detected.
In Tasker, you just need to copy/paste one of the following intent in the task Action field ("Misc" action type then select "Send Itent") .
If you prefer Automate It, you can use the Podcast Addict plugin that will save you some configuration time (https://play.google.com/store/apps/details?id=com.smarterapps.podcastaddictplugin )
Before using an intent make sure to set the following:
Package: com.bambuna.podcastaddict
Class (UPDATE intent only): com.bambuna.podcastaddict.receiver.PodcastAddictBroadcastReceiver
Class (every other intent): com.bambuna.podcastaddict.receiver.PodcastAddictPlayerReceiver
Here are the supported commands (Intents) :
com.bambuna.podcastaddict.service.player.toggle – Toggle the playlist
com.bambuna.podcastaddict.service.player.stop – Stop the player and release its resources
com.bambuna.podcastaddict.service.player.play – Start playing the playlist
com.bambuna.podcastaddict.service.player.pause – Pause the playlist
com.bambuna.podcastaddict.service.player.nexttrack – Start playing next track
com.bambuna.podcastaddict.service.player.previoustrack – Start playing previous track
com.bambuna.podcastaddict.service.player.jumpforward – Jump 30s forward
com.bambuna.podcastaddict.service.player.jumpbackward – Jump 15s backward
com.bambuna.podcastaddict.service.player.1xspeed - Disable the variable playback speed
com.bambuna.podcastaddict.service.player.1.5xspeed – Force the playback speed at 1.5x
com.bambuna.podcastaddict.service.player.2xspeed – Force the playback speed at 2.0x
com.bambuna.podcastaddict.service.player.stoptimer – Disable the timer
com.bambuna.podcastaddict.service.player.15mntimer – Set the timer at 15 minutes
com.bambuna.podcastaddict.service.player.30mntimer – Set the timer at 30 minutes
com.bambuna.podcastaddict.service.player.60mntimer – Set the timer at 1 hour
com.bambuna.podcastaddict.service.update – Trigger podcasts update
com.bambuna.podcastaddict.openmainscreen – Open the app on the Main screen
com.bambuna.podcastaddict.openplaylist – Open the app on the Playlist screen
com.bambuna.podcastaddict.openplayer – Open the app on the Player screen
com.bambuna.podcastaddict.opennewepisodes – Open the app on the New episodes screen
com.bambuna.podcastaddict.opendownloadedepisodes – Open the app on the Downloaded episodes screen
com.bambuna.podcastaddict.service.player.playfirstepisode – Start playing the first episode in the playlist
com.bambuna.podcastaddict.service.player.customspeed – Select playback speed
In order to use this intent you need to pass a float argument called "arg1". Valid values are within [0.1, 5.0]
com.bambuna.podcastaddict.service.player.customtimer – Start a custom timer
In order to use this intent you need to pass an int argument called "arg1" containing the number of minutes. Valid values are within [1, 1440]
com.bambuna.podcastaddict.service.player.deletecurrentskipnexttrack – Delete the current episode and skip to the next one. It behaves the same way as long pressing on the player >| button, but doesn't display any confirmation popup.
com.bambuna.podcastaddict.service.player.deletecurrentskipprevioustrack – Delete the current episode and skip to the previous one. It behaves the same way as long pressing on the player |< button, but doesn't display any confirmation popup.
com.bambuna.podcastaddict.service.player.boostVolume – Toggle the Volume Boost audio effect
You can pass a, optional boolean argument called "arg1" in order to create a ON or OFF button for the volume boost. Without this parameter the app will just toggle the current value
com.bambuna.podcastaddict.service.player.quickBookmark – Creates a bookmark at the current playback position so you can easily retrieve it later.
com.bambuna.podcastaddict.service.download.pause – Pause downloads
com.bambuna.podcastaddict.service.download.resume – Resume downloads
com.bambuna.podcastaddict.service. download.toggle – Toggle downloads
com.bambuna.podcastaddict.service.player.favorite – Mark the current episode playing as favorite.
com.bambuna.podcastaddict.openplaylist – Open the app on the Playlist screen
You can pass an optional string argument called "arg1" in order to select the playlist to open. Without this parameter the app will open the current playlist
Here's how it works:
##AUDIO## will open the Audio playlist screen
##VIDEO## will open the Video playlist screen
##RADIO## will open the Radio screen
Any other argument will be used as a CATEGORY name. The app will then open this category under the playlist CUSTOM tab
You can pass an optional boolean argument called "arg2" in order to select if the app UI should be opened. Without this parameter the playlist will be displayed
You can pass an optional boolean argument called "arg3" in order to select if the app should start playing the selected playlist. Without this parameter the playback won't start
Since v2020.3
com.bambuna.podcastaddict.service.full_backup – Trigger a full backup of the app data (relies on the app automatic backup settings for the folder and the # of backup to keep)
This task takes a lot of resources and might take up to a minute to complete, so please avoid using the app at the same time
Since v2020.15
com.bambuna.podcastaddict.service.player.toggletimer – This will toggle the Sleep Timer using the last duration and parameter used in the app.
Since v2020.16
com.bambuna.podcastaddict.service.player.togglespeed – This will toggle the Playback speed for the episode currently playing (alternate between selected speed and 1.0x).
*/

var R;
var backToMenu = false;
var dark = g.theme.dark; // bool

// The main layout of the app
function gfx() {
  //Bangle.drawWidgets();
  R = Bangle.appRect;
  marigin = 8;
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
}

// Touch handler for main layout
function touchHandler(_, xy) {
  x = xy.x;
  y = xy.y;
  len = (R.w<R.h+1)?(R.w/3):(R.h/3);
  
  // doing a<b+1 seemed faster than a<=b, also using a>b-1 instead of a>b.
  if ((R.x-1<x && x<R.x+len) && (R.y-1<y && y<R.y+len)) {
    //Menu
    Bangle.removeAllListeners("touch");
    Bangle.removeAllListeners("swipe");
    backToMenu = true;
    E.showMenu(paMenu);
  } else if ((R.x-1<x && x<R.x+len) && (R.y2-len<y && y<R.y2+1)) {
    //Wake 
    gadgetbridgeWake();
    gadgetbridgeWake();
  } else if ((R.x2-len<x && x<R.x2+1) && (R.y-1<y && y<R.y+len)) {
    //Srch
    Bangle.removeAllListeners("touch");
    Bangle.removeAllListeners("swipe");
    E.showMenu(searchMenu);
  } else if ((R.x2-len<x && x<R.x2+1) && (R.y2-len<y && y<R.y2+1)) {
    //Speed 
    Bangle.removeAllListeners("touch");
    Bangle.removeAllListeners("swipe");
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
}

// Swipe handler for main layout, used to jump backward and forward within a podcast episode.
function swipeHandler(LR, _) {
  if (LR==-1) {
    btMsg("service", standardCls, "player.jumpforward");
  }
  if (LR==1) {
    btMsg("service", standardCls, "player.jumpbackward");
  }
}

// Navigation input on the main layout
function setUI() {
  // Bangle.setUI code from rigrig's smessages app for volume control: https://git.tubul.net/rigrig/BangleApps/src/branch/personal/apps/smessages/app.js
  Bangle.setUI(
    {mode : "updown", back : load}, 
    ud => {
      if (ud) Bangle.musicControl(ud>0 ? "volumedown" : "volumeup");
    }
  );
  Bangle.on("touch", touchHandler);
  Bangle.on("swipe", swipeHandler);
}

/*
The functions for interacting with Android and the Podcast Addict app
*/

pkg = "com.bambuna.podcastaddict";
standardCls = pkg + ".receiver.PodcastAddictPlayerReceiver";
updateCls = pkg + ".receiver.PodcastAddictBroadcastReceiver";
speed = 1.0;

simpleSearch = "";

function simpleSearchTerm() { // input a simple search term without tags, overrides search with tags (artist and track)
  require("textinput").input({
    text: simpleSearch
  }).then(result => {
    simpleSearch = result;
  }).then(() => {
    E.showMenu(searchMenu);
  });
}

function searchPlayWOTags() { //make a search and play using entered terms
  searchString = simpleSearch;
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
}

function gadgetbridgeWake() {
  Bluetooth.println(JSON.stringify({
    t: "intent",
    target: "activity",
    flags: ["FLAG_ACTIVITY_NEW_TASK", "FLAG_ACTIVITY_CLEAR_TASK", "FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS", "FLAG_ACTIVITY_NO_ANIMATION"],
    package: "gadgetbridge",
    class: "nodomain.freeyourgadget.gadgetbridge.activities.WakeActivity"
  }));
}

// For stringing together the action for Podcast Addict to perform
function actFn(actName, activOrServ) {
  return "com.bambuna.podcastaddict." + (activOrServ == "service" ? "service." : "") + actName;
}

// Send the intent message to Gadgetbridge
function btMsg(activOrServ, cls, actName, xtra) {

  Bluetooth.println(JSON.stringify({
    t: "intent",
    action: actFn(actName, activOrServ),
    package: pkg,
    class: cls,
    target: "broadcastreceiver",
    extra: xtra
  }));
}

// Get back to the main layout
function backToGfx() {
  E.showMenu();
  g.clear();
  g.reset();
  Bangle.removeAllListeners("touch");
  Bangle.removeAllListeners("swipe");
  setUI();
  gfx();
  backToMenu = false;
}

// Podcast Addict Menu
var paMenu = {
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


var controlMenu = {
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

var speedMenu = {
  "": {
    title: " ",
    back: () => {if (backToMenu) E.showMenu(paMenu);
                 if (!backToMenu) backToGfx();
                }
  },
  "Regular Speed": () => {
    speed = 1.0;
    btMsg("service", standardCls, "player.1xspeed");
  },
  "1.5x Regular Speed": () => {
    speed = 1.5;
    btMsg("service", standardCls, "player.1.5xspeed");
  },
  "2x Regular Speed": () => {
    speed = 2.0;
    btMsg("service", standardCls, "player.2xspeed");
  },
  //"Faster" : ()=>{speed+=0.1; speed=((speed>5.0)?5.0:speed); btMsg("service",standardCls,"player.customspeed",{arg1:speed});},
  //"Slower" : ()=>{speed-=0.1; speed=((speed<0.1)?0.1:speed); btMsg("service",standardCls,"player.customspeed",{arg1:speed});},
};

var searchMenu = {
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

var navigationMenu = {
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
gfx();
