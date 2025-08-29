# Sched: Scheduling library for alarms and timers


This provides boot code, a library and tools for alarms and timers.

Other apps can use this to provide alarm functionality.

## App


The `Alarms & Timers` app allows you to add/modify any running alarms and timers.


### Snooze Menu

With sched version 0.35 or later, when an alarm or timer is triggered, and you have the latest cutting-edge firmware (will be 2v28 when released), you can long press on the snooze button that pops up to go to a snooze menu, for finer control over snooze amounts. If you do not have the latest firmware or use the code below, you will not notice any changes.

If you want the functionality, but don't want to use cutting-edge firmware, you can upload this code to the bangle from the Web IDE instead, as `2v28_sim.boot.js`:

```
E.showPrompt=(function(message,options) {
  if (!options) options={};
  if (!options.buttons)
    options.buttons = {"Yes":true,"No":false};
  var btns = Object.keys(options.buttons);
  if (btns.length>6) throw new Error(">6 buttons");
  var btnPos;
  function draw(highlightedButton) {
    g.reset().setFontAlign(0,0);
    var R = Bangle.appRect, Y = R.y, W = R.w;
    var title = g.findFont(options.title||"", {w:W-2,wrap:1,max:24});
    if (title.text) {
      g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).
        clearRect(0,Y,W-1,Y+4+title.h).
        drawString(title.text,W/2,Y+4+title.h/2);
      Y += title.h+4;
    } else Y+=4;
    var BX = 0|"0123233"[btns.length],
        BY = Math.ceil(btns.length / BX),
        BW = (W-1)/BX, BH = options.buttonHeight || ((BY>1 || options.img)?40:50);
    var H = R.y2-(Y + BY*BH);
    if (options.img) {
      var im = g.imageMetrics(options.img);
      g.drawImage(options.img,(W-im.width)/2, Y + 6);
      H -= im.height;
      Y += im.height;
    }
    var msg = g.findFont(message, {w:W-2,h:H,wrap:1,trim:1,min:16});
    g.setColor(g.theme.fg).setBgColor(g.theme.bg).
      drawString(msg.text,W/2,Y+H/2);
    btnPos = [];
    btns.forEach((btn,idx)=>{
      var ix=idx%BX,iy=0|(idx/BX),x = ix*BW + 2, y = R.y2-(BY-iy)*BH + 1,
          bw = BW-4, bh = BH-2, poly = [x+4,y,
                  x+bw-4,y,
                  x+bw,y+4,
                  x+bw,y+bh-4,
                  x+bw-4,y+bh,
                  x+4,y+bh,
                  x,y+bh-4,
                  x,y+4,
                  x+4,y];
      btnPos.push({x1:x-2, x2:x+BW-2,
                   y1:y, y2:y+BH});
      var btnText = g.findFont(btn, {w:bw-4,h:BH-4,wrap:1});
      g.setColor(idx===highlightedButton ? g.theme.bgH : g.theme.bg2).fillPoly(poly).
        setColor(idx===highlightedButton ? g.theme.fgH : g.theme.fg2).drawPoly(poly).drawString(btnText.text,x+bw/2,y+2+BH/2);
      if (idx&1) y+=BH;
    });
    Bangle.setLCDPower(1); // ensure screen is on
  }
  g.reset().clearRect(Bangle.appRect); // clear screen
  if (!message) {
    Bangle.setUI(); // remove watches
    return Promise.resolve();
  }
  draw();
  return new Promise(resolve=>{
    var ui = {mode:"custom", remove: options.remove, redraw: draw, back:options.back, touch:(_,e)=>{
      btnPos.forEach((b,i)=>{
        if (e.x >= b.x1 && e.x <= b.x2 &&
            e.y >= b.y1 && e.y <= b.y2 && !e.hit) {
          e.hit = true; // ensure we don't call twice if the buttons overlap
          draw(i); // highlighted button
          g.flip(); // write to screen
          E.showPrompt(); // remove
          if (e.type===2 /*long press*/ && options.buttonsLong && btns[i] in options.buttonsLong)
            resolve(options.buttonsLong[btns[i]]);
           else
            resolve(options.buttons[btns[i]]);
        }
      });
    }};
    if (btns.length==1 && !options.back) ui.btn = () => {
      draw(0); // highlighted button
      g.flip(); // write to screen
      E.showPrompt(); // remove
      resolve(options.buttons[btns[0]]);
    };
    Bangle.setUI(ui);
  });
})

```
That mimics the change in `E.showPrompt` needed to make the function work.

## Global Settings


- `Unlock at Buzz` - If `Yes` the alarm/timer will unlock the watch
- `Delete Expired Timers` - Default for whether expired timers are removed after firing.
- `Default Auto Snooze` - Default _Auto Snooze_ value for newly created alarms (_Alarms_ only)
- `Default Snooze` - Default _Snooze_ value for newly created alarms/timers
- `Buzz Count` - The number of buzzes before the watch goes silent, or "forever" to buzz until stopped.
- `Buzz Interval` - The interval between one buzz and the next
- `Default Alarm/Timer Pattern` - Default vibration pattern for newly created alarms/timers

## Internals / Library


Alarms are stored in an array in `sched.json`, and take the form:

```
{
  id : "mytimer",  // optional ID for this alarm/timer, so apps can easily find *their* timers
  appid : "myappid", // optional app ID for alarms that you set/use for your app
  on : true,       // is the alarm enabled?
  t : 23400000,    // Time of day since midnight in ms (if a timer, this is set automatically when timer starts)
  dow : 0b1111111, // Binary encoding for days of the week to run alarm on
    //  SUN = 1
    //  MON = 2
    //  TUE = 4
    //  WED = 8
    //  THU = 16
    //  FRI = 32
    //  SAT = 64

  date : "2022-04-04", // OPTIONAL date for the alarm, in YYYY-MM-DD format
                       // eg (new Date()).toISOString().substr(0,10)
  msg : "Eat food",    // message to display.
  last : 0,            // last day of the month we alarmed on - so we don't alarm twice in one day! (No change from 0 on timers)
  rp : true,           // repeat the alarm every day? If date is given, pass an object instead of a boolean,
                       // e.g. repeat every 2 months: { interval: "month", num: 2 }.
                       // Supported intervals: day, week, month, year
  vibrate : "...",     // OPTIONAL pattern of '.', '-' and ' ' to use for when buzzing out this alarm (defaults to '..' if not set)
  hidden : false,      // OPTIONAL if true, the widget should not show an icon for this alarm
  as : false,          // auto snooze
  timer : 5*60*1000,   // OPTIONAL - if set, this is a timer and it's the time in ms
  del : false,         // OPTIONAL - if true, delete the timer after expiration
  js : "load('myapp.js')" // OPTIONAL - a JS command to execute when the alarm activates (*instead* of loading 'sched.js')
                          // when this code is run, you're responsible for setting alarm.on=false (or removing the alarm)
  data : { ... }       // OPTIONAL - your app can store custom data in here if needed (don't store a lot of data here)
}
```

The [`sched` library](https://github.com/espruino/BangleApps/blob/master/apps/sched/lib.js) contains
a few helpful functions for getting/setting alarms and timers, but is intentionally sparse so as not to
use too much RAM.

It can be used as follows:

```
// Get a new alarm with default values
let alarm = require("sched").newDefaultAlarm();

// Get a new timer with default values
let timer = require("sched").newDefaultTimer();

// Add/update an existing alarm (using fields from the object shown above)
require("sched").setAlarm("mytimer", { // as a timer
  msg : "Wake up",
  timer : 10 * 60 * 1000 // 10 minutes
});
require("sched").setAlarm("myalarm", { // as an alarm
  msg : "Wake up",
  t : 9 * 3600000 // 9 o'clock (in ms)
});
require("sched").setAlarm("mydayalarm", { // as an alarm on a date
  msg : "Wake up",
  date : "2022-04-04",
  t : 9 * 3600000 // 9 o'clock (in ms)
});

// Ensure the widget and alarm timer updates to schedule the new alarm properly
require("sched").reload();

// Get the time to the next alarm for us
let timeToNext = require("sched").getTimeToAlarm(require("sched").getAlarm("mytimer"));
// timeToNext === undefined if no alarm or alarm disabled

// Delete an alarm
require("sched").setAlarm("mytimer", undefined);
// Reload after deleting
require("sched").reload();

// Or add an alarm that runs your own code - in this case
// loading the settings app. The alarm will not be removed/stopped
// automatically.
require("sched").setAlarm("customrunner", {
  appid : "myapp",
  js : "load('setting.app.js')",
  timer : 1 * 60 * 1000 // 1 minute
});

// If you have been specifying `appid` you can also find any alarms that
// your app has created with the following:
require("sched").getAlarms().filter(a => a.appid == "myapp");

// Get the scheduler settings
let settings = require("sched").getSettings();
```

If your app requires alarms, you can specify that the alarms app needs to
be installed by adding `"dependencies": {"scheduler":"type"},` to your app's
metadata.
