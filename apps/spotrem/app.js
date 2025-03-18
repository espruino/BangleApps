{
/*
* Bluetooth.println(JSON.stringify({t:"intent", target:"", action:"", flags:["flag1", "flag2",...], categories:["category1","category2",...], package:"", class:"", mimetype:"", data:"", extra:{someKey:"someValueOrString", anotherKey:"anotherValueOrString",...}}));
*/

let R;
let widgetUtils = require("widget_utils");
let backToMenu = false;
let isPaused = true;
let dark = g.theme.dark; // bool

// The main layout of the app
let gfx = function() {
  widgetUtils.hide();
  R = Bangle.appRect;
  const MARIGIN = 8;
  g.clearRect(R);
  g.reset();

  if (dark) {g.setColor(0x07E0);} else {g.setColor(0x03E0);} // Green on dark theme, DarkGreen on light theme.
  g.setFont("4x6:2");
  g.setFontAlign(1, 0, 0);
  g.drawString("->", R.x2 - MARIGIN, R.y + R.h/2);

  g.setFontAlign(-1, 0, 0);
  g.drawString("<-", R.x + MARIGIN, R.y + R.h/2);

  g.setFontAlign(-1, 0, 1);
  g.drawString("<-", R.x + R.w/2, R.y + MARIGIN);

  g.setFontAlign(1, 0, 1);
  g.drawString("->", R.x + R.w/2, R.y2 - MARIGIN);

  g.setFontAlign(0, 0, 0);
  g.drawString("Play\nPause", R.x + R.w/2, R.y + R.h/2);

  g.setFontAlign(-1, -1, 0);
  g.drawString("Menu", R.x + 2*MARIGIN, R.y + 2*MARIGIN);

  g.setFontAlign(-1, 1, 0);
  g.drawString("Wake", R.x + 2*MARIGIN, R.y + R.h - 2*MARIGIN);

  g.setFontAlign(1, -1, 0);
  g.drawString("Srch", R.x + R.w - 2*MARIGIN, R.y + 2*MARIGIN);

  g.setFontAlign(1, 1, 0);
  g.drawString("Saved", R.x + R.w - 2*MARIGIN, R.y + R.h - 2*MARIGIN);
};

// Touch handler for main layout
let touchHandler = function(_, xy) {
  let x = xy.x;
  let y = xy.y;
  let len = (R.w<R.h+1)?(R.w/3):(R.h/3);

  // doing a<b+1 seemed faster than a<=b, also using a>b-1 instead of a>b.
  if ((R.x-1<x && x<R.x+len) && (R.y-1<y && y<R.y+len)) {
    //Menu
    Bangle.removeListener("touch", touchHandler);
    Bangle.removeListener("swipe", swipeHandler);
    backToMenu = true;
    E.showMenu(spotifyMenu);
  } else if ((R.x-1<x && x<R.x+len) && (R.y2-len<y && y<R.y2+1)) {
    //Wake
    gadgetbridgeWake();
  } else if ((R.x2-len<x && x<R.x2+1) && (R.y-1<y && y<R.y+len)) {
    //Srch
    Bangle.removeListener("touch", touchHandler);
    Bangle.removeListener("swipe", swipeHandler);
    E.showMenu(searchMenu);
  } else if ((R.x2-len<x && x<R.x2+1) && (R.y2-len<y && y<R.y2+1)) {
    //Saved
    Bangle.removeListener("touch", touchHandler);
    Bangle.removeListener("swipe", swipeHandler);
    E.showMenu(savedMenu);
  } else if ((R.x-1<x && x<R.x+len) && (R.y+R.h/2-len/2<y && y<R.y+R.h/2+len/2)) {
    //Previous
    spotifyWidget("PREVIOUS");
  } else if ((R.x2-len+1<x && x<R.x2+1) && (R.y+R.h/2-len/2<y && y<R.y+R.h/2+len/2)) {
    //Next
    spotifyWidget("NEXT");
  } else if ((R.x-1<x && x<R.x2+1) && (R.y-1<y && y<R.y2+1)){
    //play/pause
    let playPause = isPaused?"play":"pause";
    Bangle.musicControl(playPause);
    isPaused = !isPaused;
  }
};

// Swipe handler for main layout, used for next previous track.
let swipeHandler = function(LR, _) {
  if (LR==-1) {
    spotifyWidget("NEXT");
  }
  if (LR==1) {
    spotifyWidget("PREVIOUS");
  }
};

// Navigation input on the main layout
let setUI = function() {
  Bangle.setUI(
    {mode : "updown",
     touch: touchHandler,
     swipe: swipeHandler,
     btn: ()=>load(),
     remove : ()=>widgetUtils.show(),
    },
      ud => {
        if (ud) Bangle.musicControl(ud>0 ? "volumedown" : "volumeup");
      }
  );
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

/*
The functions for interacting with Android and the Spotify app
*/

let createCommand = function(o) {
  let boilerplateO = {t:"intent", action:"android.intent.action.VIEW", categories:["android.intent.category.DEFAULT"], package:"com.spotify.music", target:"activity", flags:["FLAG_ACTIVITY_NEW_TASK", "FLAG_ACTIVITY_NO_ANIMATION"]};
  let assembledO = Object.assign(boilerplateO, o)
  return ()=>{
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify(assembledO));
  };
};

let assembleSearchString = function() {
  return (artist=="" ? "":("artist:\""+artist+"\"")) + ((artist!="" && track!="") ? " ":"") + (track=="" ? "":("track:\""+track+"\"")) + (((artist!="" && album!="") || (track!="" && album!="")) ? " ":"") + (album=="" ? "":(" album:\""+album+"\""));
};

let simpleSearch = "";
let simpleSearchTerm = function() { // input a simple search term without tags, overrides search with tags (artist and track)
  require("textinput").input({text:simpleSearch}).then(result => {simpleSearch = result;}).then(() => {E.showMenu(searchMenu);});
};

let artist = "";
let artistSearchTerm = function() { // input artist to search for
  require("textinput").input({text:artist}).then(result => {artist = result;}).then(() => {E.showMenu(searchMenu);});
};

let track = "";
let trackSearchTerm = function() { // input track to search for
  require("textinput").input({text:track}).then(result => {track = result;}).then(() => {E.showMenu(searchMenu);});
};

let album = "";
let albumSearchTerm = function() { // input album to search for
  require("textinput").input({text:album}).then(result => {album = result;}).then(() => {E.showMenu(searchMenu);});
};

let searchPlayWOTags = ()=>(createCommand({action:"android.media.action.MEDIA_PLAY_FROM_SEARCH", extra:{query:simpleSearch}, flags:["FLAG_ACTIVITY_NEW_TASK"]})());

let searchPlayWTags = createCommand({action:"android.media.action.MEDIA_PLAY_FROM_SEARCH", extra:{query:assembleSearchString()}, flags:["FLAG_ACTIVITY_NEW_TASK"]});

let playVreden = createCommand({data:"spotify:track:5QEFFJ5tAeRlVquCUNpAJY:play"});

//let searchPlayVreden = createCommand({action:"android.media.action.MEDIA_PLAY_FROM_SEARCH", extra:{query:'artist:"Sara Parkman" track:"Vreden"'}, flags:["FLAG_ACTIVITY_NEW_TASK"]});

let openAlbum = createCommand({data:"spotify:album:3MVb2CWB36x7VwYo5sZmf2", flags:["FLAG_ACTIVITY_NEW_TASK"]});

let spotifyWidget = (action)=>{
  createCommand({t:"intent", action:("com.spotify.mobile.android.ui.widget."+action), categories:[], target:"broadcastreceiver", flags:[]})();
};

let searchPlayAlbum = createCommand({action:"android.media.action.MEDIA_PLAY_FROM_SEARCH", extra:{query:'album:"The blue room" artist:"Coldplay"', "android.intent.extra.focus":"vnd.android.cursor.item/album"}, flags:["FLAG_ACTIVITY_NEW_TASK"]});

let gadgetbridgeWake = createCommand({flags:["FLAG_ACTIVITY_NEW_TASK", "FLAG_ACTIVITY_CLEAR_TASK", "FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS", "FLAG_ACTIVITY_NO_ANIMATION"], package:"gadgetbridge", class:"nodomain.freeyourgadget.gadgetbridge.activities.WakeActivity"});

let spotifyPlaylistDW = createCommand({data:"spotify:user:spotify:playlist:37i9dQZEVXcRfaeEbxXIgb:play"});

let spotifyPlaylistDM1 = createCommand({data:"spotify:user:spotify:playlist:37i9dQZF1E365VyzxE0mxF:play"});

let spotifyPlaylistDM2 = createCommand({data:"spotify:user:spotify:playlist:37i9dQZF1E38LZHLFnrM61:play"});

let spotifyPlaylistDM3 = createCommand({data:"spotify:user:spotify:playlist:37i9dQZF1E36RU87qzgBFP:play"});

let spotifyPlaylistDM4 = createCommand({data:"spotify:user:spotify:playlist:37i9dQZF1E396gGyCXEBFh:play"});

let spotifyPlaylistDM5 = createCommand({data:"spotify:user:spotify:playlist:37i9dQZF1E37a0Tt6CKJLP:play"});

let spotifyPlaylistDM6 = createCommand({data:"spotify:user:spotify:playlist:37i9dQZF1E36UIQLQK79od:play"});

let spotifyPlaylistDD = createCommand({data:"spotify:user:spotify:playlist:37i9dQZF1EfWFiI7QfIAKq:play"});

let spotifyPlaylistRR = createCommand({data:"spotify:user:spotify:playlist:37i9dQZEVXbs0XkE2V8sMO:play"});

// Spotify Remote Menu
let spotifyMenu = {
  "" : { title : " Menu ",
        back: backToGfx },
  "Controls" : ()=>{E.showMenu(controlMenu);},
  "Search and play" : ()=>{E.showMenu(searchMenu);},
  "Saved music" : ()=>{E.showMenu(savedMenu);},
  "Wake the android" : function() {gadgetbridgeWake();gadgetbridgeWake();},
  "Exit Spotify Remote" : ()=>{load();}
};

let menuBackFunc = ()=>{
  if (backToMenu) E.showMenu(spotifyMenu);
  if (!backToMenu) backToGfx();
};

let controlMenu = {
  "" : { title : " Controls ",
        back: menuBackFunc },
  "Play" : ()=>{Bangle.musicControl("play");},
  "Pause" : ()=>{Bangle.musicControl("pause");},
  "Previous" : ()=>{spotifyWidget("PREVIOUS");},
  "Next" : ()=>{spotifyWidget("NEXT");},
  "Play (widget, next then previous)" : ()=>{spotifyWidget("NEXT"); spotifyWidget("PREVIOUS");},
  "Messages Music Controls" : ()=>{load("messagesmusic.app.js");},
};

let searchMenu = {
  "" : { title : " Search ",
        back: menuBackFunc },
  "Search term w/o tags" : simpleSearchTerm,
  "Execute search and play w/o tags" : searchPlayWOTags,
  "Search term w tag \"artist\"" : artistSearchTerm,
  "Search term w tag \"track\"" : trackSearchTerm,
  "Search term w tag \"album\"" : albumSearchTerm,
  "Execute search and play with tags" : searchPlayWTags,
};

let savedMenu = {
  "" : { title : " Saved ",
        back: menuBackFunc },
  "Play Discover Weekly" : spotifyPlaylistDW,
  "Play Daily Mix 1" : spotifyPlaylistDM1,
  "Play Daily Mix 2" : spotifyPlaylistDM2,
  "Play Daily Mix 3" : spotifyPlaylistDM3,
  "Play Daily Mix 4" : spotifyPlaylistDM4,
  "Play Daily Mix 5" : spotifyPlaylistDM5,
  "Play Daily Mix 6" : spotifyPlaylistDM6,
  "Play Daily Drive" : spotifyPlaylistDD,
  "Play Release Radar" : spotifyPlaylistRR,
  "Play \"Vreden\" by Sara Parkman via uri-link" : playVreden,
  "Open \"The Blue Room\" EP (no autoplay)" : openAlbum,
  "Play \"The Blue Room\" EP via search&play" : searchPlayAlbum,
};

Bangle.loadWidgets();
setUI();
gfx();
}
