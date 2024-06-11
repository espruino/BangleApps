var Storage = require("Storage");
var Layout = require("Layout");

var font = g.getFonts().includes("6x15") ? "6x15" : "6x8:2";
var largeFont = g.getFonts().includes("12x20") ? "12x20" : "6x8:3";
var currentApp = 0;
var overscroll = 0;
var blankImage = Graphics.createImage(`\n \n`);
var rowHeight = g.getHeight()/3;

// Load apps list
var apps;

var launchCache = Storage.readJSON("launch.cache.json", true)||{};
var launchHash = require("Storage").hash(/\.info/);
if (launchCache.hash==launchHash) {
  apps = launchCache.apps;
} else {
  apps = Storage.list(/\.info$/).map(app=>{
    var a=Storage.readJSON(app,1);
    return a&&{
      name:a.name,
      type:a.type,
      icon:a.icon ? Storage.read(a.icon) : a.icon,
      sortorder:a.sortorder,
      src:a.src
    };
  }).filter(app=>app && (
    app.type=="app"
  //  || (app.type=="clock" && settings.showClocks)
    || !app.type
  ));
  apps.sort((a,b)=>{
    var n=(0|a.sortorder)-(0|b.sortorder);
    if (n) return n; // do sortorder first
    if (a.name<b.name) return -1;
    if (a.name>b.name) return 1;
    return 0;
  });

  launchCache = { apps, hash: launchHash };
  Storage.writeJSON("launch.cache.json", launchCache);
}

// Uncomment for testing in the emulator without apps:
// apps = [
//   {
//     name:"Test",
//     type:"app",
//     icon:blankImage,
//     sortorder:undefined,
//     src:""
//   },
//   {
//     name:"Test 2",
//     type:"app",
//     icon:blankImage,
//     sortorder:undefined,
//     src:""
//   },
// ];

// Initialize layout
var layout = new Layout({
  type:"v", c:[
    // A row for the previous app
    { type:"h", height:rowHeight, c:[
      {type: "img", id:"prev_icon", src:blankImage, width:48, height:48, scale:0.8, pad:8},
      {type: "txt", id:"prev_name", label:"", font:font, fillx:1, wrap:1},
    ]},
    // A row for the current app
    { type:"h", height:rowHeight, c:[
      {type: "img", id:"cur_icon", src:blankImage, width:48, height:48},
      {type: "txt", id:"cur_name", label:"", font:largeFont, fillx:1, wrap:1},
    ]},
    // A row for the next app
    { type:"h", height:rowHeight, c:[
      {type: "img", id:"next_icon", src:blankImage, width:48, height:48, scale:0.8, pad:8},
      {type: "txt", id:"next_name", label:"", font:font, fillx:1, wrap:1},
    ]},
  ]
});

// Drawing logic
function render() {
  if (!apps.length) {
    E.showMessage(/*LANG*/"No apps");
    return load();
  }

  // Previous app
  if (currentApp > 0) {
    layout.prev_icon.src = apps[currentApp-1].icon;
    layout.prev_name.label = apps[currentApp-1].name;
  } else {
    layout.prev_icon.src = blankImage;
    layout.prev_name.label = "";
  }

  // Current app
  layout.cur_icon.src = apps[currentApp].icon;
  layout.cur_name.label = apps[currentApp].name;

  // Next app
  if (currentApp < apps.length-1) {
    layout.next_icon.src = apps[currentApp+1].icon;
    layout.next_name.label = apps[currentApp+1].name;
  } else {
    layout.next_icon.src = blankImage;
    layout.next_name.label = "";
  }

  g.clear();
  layout.render();
}

// Launch the currently selected app
function launch() {
  var app = apps[currentApp];
  if (!app) return;
  if (!app.src || Storage.read(app.src)===undefined) {
    E.showMessage(/*LANG*/"App Source\nNot found");
    setTimeout(render, 2000);
  } else {
    E.showMessage(/*LANG*/"Loading...");
    load(app.src);
  }
}

// Select previous/next app
function move(step) {
  if ((currentApp == 0 && step < 0) || (currentApp >= apps.length-1 && step > 0)) {
    // When we hit the end of the list (top or bottom), the step is
    // counted towards the overscroll value. When the overscroll
    // threshold is exceeded, we return to the clock face.
    overscroll += step;
  } else {
    // This is the default case: the step is countedf towards the currentApp index
    currentApp += step;
    overscroll = 0;
    return render();
  }

  // Overscroll threshold reached, return to clock
  if (Math.abs(overscroll) > 3) {
    Bangle.buzz(500, 1);
    return load();
  }
}

// Wire up user input
Bangle.setUI('updown', dir => {
  if (!dir) launch();
  else {
    if (process.env.HWVERSION==2) dir *= -1; // "natural scrolling" on touch screen
    move(dir);
  }
});

render();
