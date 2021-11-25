const filename = "lcars.setting.json";
const Storage = require("Storage");
let settings = Storage.readJSON(filename,1) || {
  alarm: -1,
};

/*
 * Requirements and globals
 */
const locale = require('locale');

var backgroundImage = {
  width : 176, height : 151, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("AAUEufPnnzATkAg4daIIXnz15ATvkwEDDrUAgPHQDyDghyAeQcNzJQ0cuPHATCDBDrUDJQ1AgAA3jjOF+BA4T4KDFyBB5Qf4ABQAaD9QAaD/QesH8CD/n/8Qf8//+AQfsB///GQ6D2h5BJQf6D7/yD8jl/IIIABjiD5n4/DAAWAQe8B//8QYfH//x4CD2HwMDQIf4AoP4Qesf/56BQYYFBuP/Qev//0AQYoKBn/gQecH/lwQwQADBYaDzGoZBHR4OAQehBKj5BBsuWrICDBAIAofYZBFBAZ6qIJJ6DQZBB3IAiDDgZBygJ6EIIn8IOqDKIIscuPHAQdwINkHIJEfIIPnz15AQeAINT+CHwcPAYI1BIIU8+fPAQbOqg56BQYcAgKD4IIv4RgSDCAQSD34AIC//wBYSDyO4P+IIoIB+E/8AFBQeL7B//HHYJKE+P/AoSDygF/QQJBF//4AoSDygEBQYgFBj/xZYaDzgE/PoIAE/wMDQeZBB/jICAAMcuAMDQevgQwR0CvyD3gP/BAxBEQek4A40OQe4ANQegAMQf6D/AAccQf8Ak6DFyCD/QfcDQYueIPMAuaDE+fBIPMOQYoCb8glB7dt2wCW2EAgKDFATkAg2atOmAS5eBhKDigyDZ2zHCjiD/AAMChEgwQCcQb4AiQb5BiQbscuPHATyDfyfPnnzATnwQbsBQD6DghKAeQcJoHiFBggCYQYVhdwQATgOmgVPNAnOECwAGQYIZXgM2dI1wIL2aoCDYibsF4CD/QcGYILGmyaDFwCD/QfaADQf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D4jCD/ADKDnILSD/Qf6DEHO6DJIP6D/Qf6D/QY8cuPHAQdAQfPz588AQeAQf8cuCD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6DqoCD5HO6DJIP6D/Qf6D/QY8cuPHAQdwE7sGzCDZ+fPngCDwBBe7aD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/QfcTQYvAQf6DgzVAQbECp6DE5yD5gCDFATqDCsOAIKtB00AhKDEATnwQYVt2wCXQwKDltOmAS6IC2aD82BBCQccaQbGAA=="))
}

var iconEarth = {
  width : 50, height : 50, bpp : 3,
  transparent : 5,
  buffer : require("heatshrink").decompress(atob("23btoCD6PHjlx9oLGAQuGiVJkmSpIRK2lxEYQCDCJOGjEhEYNBwUI5drEw/xEYwCB8oRGDoMhwmSsAFBkGM237NZICGj15OgnaDoOGI4cgwUa5dv332EwdHEZACB8+evYRCtAdBEAQpDscs3379+9HAW8EZPHz158+WSQQjFwUYsMs2QjBEwPrSRZuCJQN5TAJuCEYkhwUS5cvJQRxCNxZKDOIXgJQkh0mYtMk2XLJQXv1u0EZSVDOIWsJQsSpMkyVJljgB9gmB7YjLOgtq4BKEsIjCAQNLlgCBt+9EZwCCj8sJQpxB00aJoYCB5cBEZ4CB+RKFJoeGjAjCoOGzBKaAQeGJQQFBwJKSsAjIcweSBwRKRjojKOgYFCxZKRtAaBjHrlm4FJUN3hKQi3ShAjB2XLAQQmI7dHJR97tsh9gjEAQLpHlu2+PnExvF23an3794mF2BKFm3btsevImMjwRB23v3wmB3xNF5BuDCIPb8+eEwOeExIRCtojCJo5uEEwRxBEwRuJHAdI+YmCTYlgJQIREtrjCEwLdHCIiYBhF7OgnJSQgmFjhxCOgiSDAQvSX4QmB90IkQRIX4gmCEZICDvwmCBY3QA"))
}

var iconSaturn = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("kmSpICMwARQwO+/ESCJ33798hIRMxO//fv3AjPvv34ARLyM/EYO+/+CCJe3EYXfuBKGkEAkB8Bm//EYImB4IRGsOmzVpwkfuEBgYmBggREkVNmnTAQPbgAyBx/+8AjFtIjCAQN/4ALBo/fgRWEhIjDAQO/6ESpH//CMFEYgCCsEJkd9LgmQkgjEAQX8gmP/BuEowjGAQOegP3gARDpGTEYwCBv0n/ESJQc6EY4CB/nfsRcEEZACB+f8ZYmREZGmzBuFyRuIAQMP/DLEpEaJRFh+8YLgkjJRMn8fALgnJJRPct+BJQhuJjfhn2ECIdONxUm/hKN6VPwnT9BKE9JuI+2at6VFJQ9In8Tpu8JQiVIw/ctOneQsiJQ0g/wFB76VFwJKGj9xAoN5SosEJQuD/oFBp/wCIlHJQqSB4wFB3+ACIdJj+JSQvkAoM3+SnFDoYmBoP3FgXesBcEp/4RgImBoO+AoXb9kJCIeR+8EOIVh+/aFIRuGn6bBoi2Bm/4FIV/mAREp/fuFJkFhWwR0C80ENwkb9+JkmQgn/OgnACIkkvpKBTAPfuOGTAaAEkmP/34gUA//+kgjCwARFye379944CB4EAsOEgARFyVG/fv3///+ABYgCGj5KBEYQRLklv3wmB/B6FAQy5BEYJxCCJRKC/4jNAQM/vvGCJy2BgARQA"))
}

var iconUranus = {
  width : 50, height : 50, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQEByQFCARcAhoXDARdAuP37gRNpENn37/kSExkh4+evv2hImMwnYts++A4Njl5+/f+GQPYZKIpu+/f/wEAwUIsp5BJRHfvv/hkw4cM2XLhkEEwuA6eP3/ggQjBy1ZtuWEw1AJQPcgAjDln/5ZNGkE2/cAhEgw1ZEwNf8uQTwprCoZKBEYImCAQKeFpAjCwUJJQQmCsmEHAhHCNwgjCn+yoRKEhEkSQMlEYYCBz/ZgI4DwcMuIjGAQPPtiYDLgIjIAQNv20CSoZHCmRuGlm/OIdIWwKSEAQpxBHAUgNwQjHOIWwVQWASQlb9ojDvft31YLgSSFnnyEYc82X/lhcCJQRoDJo39wC5FEAPzJQ0t+XCHALdCjJuHXgaDBJQxxH55KDXIMhEZACBvuQJQ4mIJTxEBJRSVCXg6VBJSEvJQbgFJQ++7ARBySVM2f7gIRBpDgEEw9f8mEJQMkgYmB57+BEw082ARCyEAy1J9+2Ew1v+1CJQVIJQUyEAgmC/3ICIVJkC8Crf9EANnFIS5BkIRCXhJuC/65CHAZxJr/lNwY4COIRuFO4OwiQRDOITjBkrdFy0CCIg4BcZPACIrjKoARHyVAiCYF4EJCI4CBgAmEpARKEwMAoZNBoARLJoUAAAILGkA"))
}

var iconGps = {
  width : 50, height : 50, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQCFpH0BAwCJv/6CJ8l589CJ0kyf//wIDpVEChM8+/fBAdZ8QRIp++///0gIBlMkxI4IuZKB+/SKAPHzpKJ/YkB//pKAP2BYeXhIFDx88+fPvqYBnibEkmUAofv34lC/RQBBYdcmPCXIYjBEwPfvnzJoILBQoUlHAUuJQYmCDodw48cuBKGTA0WEYIEBJQ6YEQwMMuImBJQyYEkmZFAVkyVSJQ6YCyUcmPDjgmBTAJKETAlJiS4ETANPJQpxCJQtxTALgBEwnfvohBI4NZkmWpNlcAgAD/wzBEYaYCy8cJQiYEyIjCTAWS3wlGTAVIEwkerJKFTAkmOIclToK8GAAIPBIgImCufHyxxG59pEIS8DvfypMr968HEwOHEwfx8+cEYkpCIeSoiYByVf/uSkmTEQP7ZIiYDnl5AQNwBYgCGyOn38k2+2pIRKyVeuPPj1x4ccCJVKSgP/5cJA4NSExMps+cSoMMKAIVCCg7SBpd7TANZkmUHBMevPnjlwcwXCCJFEzYDBA4WWKIIRHpEw4+eNwUxEwKYIkVJk1IyIKFHA+DR4VcJQYCBJRBoCkxHBAgNkyyYKkmXEYaYMAQMSEYKYNAQOHEwnSfBYjBAgVaCJdJJSMkTAK8KYQyVKAQ4jBNxiYEcBCYJXIkgA="))
}

var iconAlarm = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("kmSpICEp//BAwCJn/+CJ8k//5CKAABCJs8uPH//x48EI5YjCAARNKEYUcv//jgFBExEnEYoAC+QmHIgIgC/gpCuPBCI2fIgU4AQXjA4P8CIuTEYZKBAolwHApXBEAWP//jxwpBAALaFDoYCIiQmDDIP4EAT+CEwnJEwYjLAQLaFEYomDKALmDNwoCIOIZuD8AkFgCYDHAQjMAQTdDNwOAEg0Dx0/cYeREZtxQYOTHgJuHOIvkXJy8DNwIACJQ8Ah4NDAAfxEZARHOIIkHg4jQAQb1CQ4KVJgEOnDIBSoIjNAQPBcAaVJcAKVBcDGOcD7OBMQM48BuH8f//JKCnhKNggRBkmfTQJxBEwhuD/gRCyVHJRlyCIVJXgYmB8ZQBAoIKBXIQmCOIt/NxAUCOIImCIgIpCBAJuDAQZEE/huIAQWTDgImBTYQGC8gRFcYpKFCI8kDwQAFCJBfBEAX/+IjBiQRIEw4jJAQc8v//NYwCIOgJrIJpA1OcwbaFAQWQA="))
}

var iconCharging =   {
  width : 50, height : 50, bpp : 3,
  transparent : 5,
  buffer : require("heatshrink").decompress(atob("23btugAwUBtoICARG0h048eODQYCJ6P/AAUCCJfbo4SDxYRLtEcuPHjlwgoRJ7RnIloUHoYjDAQfAExEAwUIkACEkSAIEYwCBhZKH6EIJI0CJRFHEY0BJRWBSgf//0AJRYSE4BKLj4SE8BKLv4RD/hK/JS2AXY0gXwRKG4cMmACCJQMAg8csEFJQsBAwfasEAm379u0gFbcBfHzgFBz1xMQZKBjY/D0E2+BOChu26yVEEYdww+cgAFCg+cgIfB6RKF4HbgEIkGChEAthfCJQ0eEAIjBBAMxk6GCJQtgtyVBwRKBAQMbHAJKGXIIFCgACBhl54qVG2E+EAJKBJoWAm0WJQ6SCXgdxFgMLJQvYjeAEAUwFIUitEtJQ14NwUHgEwKYZKGwOwNYX7XgWCg3CJQ5rB4MevPnAoPDJRJrCgEG/ECAoNsJRUwoEesIIBiJKI3CVDti/CJRKVDiJHBSo0YsOGjED8AjBcAcIgdhcAXAPIUAcAYIBcA4dBAQUG8BrBgBuCgOwcBEeXIK2BBAIFBgRqBGoYAChq8CcYUE4FbUYOACQsHzgjDgwFBCIImBAQsDtwYD7cAloRI22B86YBw5QBgoRJ7dAgYEDCJaeBJoMcsARMAQNoJIIRE6A"))
}

var iconNoBattery = {
  width : 50, height : 50, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQCoycMmHDhgLEqVECg1Bw0YsOGBAdKpMSEwwjCmHCBAYDBHA4jCjFpBAUpkmJJR0lkmRL49Fy1ZsuWBAWkyQRGxcs2XLAQe0ymSNw9t23bAQnSyVICI1IEYoCBqSAIkwjF7dupMiQA5KH/KSIJQ+5SRBKH2fkSRBKH8iSHJRHPSRBKIH4PSCJBKFn1JhYRIJQqSBkdtJRscSQLgBJRliAwONcAJKM9MkyAFBJRm/AwM2AoJKMUgNCFIJKM7A8BOgRKMmVJg8MJRqSBAwMGJRqSBzVpJRu5kmTpMhJRmz8mQ2emJRqABm3cyK/BJRWPSQUauRKMSQVmpFbJRdSpMLOIODX4JKJpVJkYgB+gCBJRQDBEAQCDJREpkmNEAQCDJQ8lkmQEYpKJ0mScAIjEJRGUyVEcAJKNSQLgBJRqSBiVIJRqSBkTgBJRoDBAIJKNSQOJAoJKN0mRAoJKOyQFCSp4CikAA="))
}

// Font to use:
// <link href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;700&display=swap" rel="stylesheet">
Graphics.prototype.setFontAntonioSmall = function(scale) {
  // Actual height 18 (17 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAf4Mf/sYAMAAAAAAfgAfAAAAAfgAeAAAAAAiAAj8H/4fyEAv8f/gfiAAgAAAAD54H98eOPHn8Hz8AhwAAAP8Af+AYGAYCAf+AP8MAB8AHwA+AD4AfAAcf4A/8AwMAwMA/8Af4AAAAAwGD8f/8f8MY/cfz4PD8AHMAAAfAAeAAAAAAAAP/+f//YADAAAQABYADf//P/+AAAAAANAAPAAfwAfgAPAANAAAAAAEAAEAA/AA/AAEAAEAAAAAAZAAfAAYAAAAIAAIAAIAAIAAAAAAAAAMAAMAAAAAAAAEAB8Af4H+AfwAcAAAAAP/4f/8YAMf/8f/8H/wAAAAAAEAAMAAf/8f/8f/8AAAAAAAAAHgcfh8cH8YPMf8MPwEAAAAAAOB4eB8YYMY4Mf/8Pn4AAAAAgAHwA/wPwwf/8f/8AAwAAgAAAf54f58ZwMZwMY/8Qf4AAAAAAP/4f/8YYMYYMff8HP4AAAQAAYAAYD8Y/8f/AfgAcAAAAAAAAPv4f/8YYMY8Mf/8Pn4AAAAAAP94f98YGMcMMf/8H/wAAAAAABgwBgwAAAAAABgABg/Bg8AAAAEAAOAAbAA7gAxgBwwASAAbAAbAAbAAbAASAAAAAxwA5gAbAAPAAOAAAAPAAfHcYPcf8Af4AHgAAAAAAAB/gH/wOA4Y/MZ/sbAsbBkb/MZ/sOBsH/AAAAAAMAP8f/4fwwf4wH/8AH8AAMAAAf/8f/8YYMYYMf/8P/4ADgAAAP/4f/8YAMYAMfj8Pj4AAAAAAf/8f/8YAMYAMf/8P/4B/AAAAf/8f/8YMMYMMYIMAAAAAAf/8f/8YYAYYAYYAAAAAAAP/4f/8YAMYIMfP8Pv8AAAAAAf/8f/8AMAAMAf/8f/8f/8AAAAAAf/8f/8AAAAAAAD4AB8AAMf/8f/4f/gAAAAAAf/8f/8A+AD/gfj4eA8QAEAAAf/8f/8AAMAAMAAMAAAf/8f/8f8AB/wAB8AP8P/Af/8f/8AAAAAAf/8f/8HwAA+AAPwf/8f/8AAAAAAP/4f/8YAMYAMf/8P/4AAAAAAf/8f/8YGAYGAf8AP8ABAAAAAf/w//4wAYwAc//+f/yAAAAAAf/8f/8YMAYMAf/8f/8DA8CAAPj4fz8Y4MeeMfP8HD4YAAYAAf/8f/8YAAQAAAAAf/4f/8AAMAAMf/8f/4AAAYAAf4AP/4AP8AP8f/4fwAQAAYAAf8AP/8AD8D/8f8Af8AD/8AD8f/8f8AAAAQAEeB8P/4B/AP/4fA8QAEYAAfAAP4AB/8H/8fwAcAAAAMYD8Y/8f/MfwMcAMAAAf/+f//YADYADAAAAAAfAAf8AB/wAH8AAMQACYADf//f//AAAAA"), 32, atob("BAUHCAcTCAQFBQgGBAYFBggICAgICAgICAgEBQYGBggNCAgICAcHCAkECAgGCwkICAgIBwYICAwHBwYGBgY="), 18+(scale<<8)+(1<<16));
}

Graphics.prototype.setFontAntonioLarge = function(scale) {
  // Actual height 34 (34 - 1)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAADwAAAAAeAAAAADwAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAD+AAAAH/wAAAP/+AAAf/+AAA//8AAB//4AAD//wAAD//gAAAf/AAAAD+AAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAB////gA/////AP////8D/////wfAAAA+DwAAADweAAAAeDwAAADwf////+D/////wP////8Af///+AAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAOAAAAADwAAAAAeAAAAAHgAAAAB/////wf////+D/////wf////+D/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAPwH/4AP+B//AH/wf/4D/+D4AB/9weAAf4ODwAP8BweAP/AOD///gBwP//wAOA//4ABwB/4AAOAAAAAAAAAAAAAAAAAAAAB8AA/gA/gAH/AP8AA/8D/gAH/wfAHAA+DwA4ADweAHgAeDwB8ADwf7/+H+D/////gP/9//8A//H/+AA/AH/AAAAAAAAAAAAAAAAAABwAAAAD+AAAAD/wAAAH/+AAAH/5wAAH/wOAAP/gBwAP/gAOAD/////wf////+D/////wf////+AAAABwAAAAAOAAAAABwAAAAAAAAAAAAAAAAAAeAD//4D/Af//Af8D//4D/wf//Af+DwPAADweB4AAeDwPAADweB///+DwP///weA///8DwD//+AAAA/8AAAAAAAAAAAAAAAAAAAAAA////AA/////AP////8D/////wfgPAB+DwB4ADweAOAAeDwBwADwf+PAA+D/x///wP+H//8A/wf//AAAA//gAAAAAAAAAAAAADgAAAAAeAAAAADwAAAAAeAAAD+DwAAP/weAA//+DwA///weB///8Dx//8AAf//wAAD//gAAAf/AAAAD/AAAAAfAAAAAAAAAAAAAAAAAAAAAAAAAD/wf/wB//v//AP////8D/////weAPwAeDwA8ADwcAHAAeDwB8ADwf////+D/////wP/9//8A//H//AA/AD/AAAAAAAAAAAAAAAAAAAAAD//gfAA///D/AP//8f8D///j/weAA8A+DwADgDweAAcAeDwAHgDwf////+B/////gP////8Af///+AAP//4AAAAAAAAAAAAAAAAAAAAAAD4AfAAAfAD4AAD4AfAAAfAD4AAD4AfAAAAAAAAAAAAAA=="), 46, atob("Cg4QEBAQEBAQEBAQCQ=="), 39+(scale<<8)+(1<<16));
}

/*
 * Draw watch face
 */
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function draw(){

  // First handle alarm to show this correctly afterwards
  handleAlarm();

  // Next draw the watch face
  g.reset();
  g.clearRect(0, 24, g.getWidth(), g.getHeight());

  // Draw background image
  g.drawImage(backgroundImage, 0, 24);

  // Draw symbol
  var bat = E.getBattery();
  var timeInMinutes = getCurrentTimeInMinutes();

  var iconImg =
      isAlarmEnabled() ? iconAlarm :
      Bangle.isCharging() ? iconCharging :
      bat < 30 ? iconNoBattery :
      Bangle.isGPSOn() ? iconGps :
      timeInMinutes % 3 == 0 ? iconUranus :
      timeInMinutes % 3 == 1 ? iconSaturn :
      iconEarth;
  g.drawImage(iconImg, 115, 115);

  // Alarm within symbol
  g.setFontAlign(0,0,0);
  g.setFontAntonioSmall();
  g.drawString("STATUS", 115+25, 102);
  if(isAlarmEnabled() > 0){
    g.drawString(getAlarmMinutes(), 115+25, 115+25);
  }

  // Write time
  var currentDate = new Date();
  var timeStr = locale.time(currentDate,1);
  g.setFontAlign(0,0,0);
  g.setFontAntonioLarge();
  g.drawString(timeStr, 60, 55);

  // Write date
  g.setFontAlign(-1,-1, 0);
  g.setFontAntonioSmall();

  var dayName = locale.dow(currentDate, true).toUpperCase();
  var day = currentDate.getDate();
  g.drawString(day, 100, 35);
  g.drawString(dayName, 100, 55);

  // Draw battery
  g.drawString("BAT:", 25, 98);
  g.drawString(bat+ "%", 62, 98);

  // Draw steps
  var steps = getSteps();
  g.drawString("STEP:", 25, 121);
  g.drawString(steps, 62, 121);

  // Temperature
  g.setFontAlign(-1,-1,0);
  g.drawString("TEMP:", 25, 144);
  g.drawString(Math.floor(E.getTemperature()) + "C", 62, 144);

  // Queue draw in one minute
  queueDraw();
}

/*
 * Step counter via widget
 */
function getSteps() {
  if (stepsWidget() !== undefined)
    return stepsWidget().getSteps();
  return "???";
}

function stepsWidget() {
  if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom;
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom;
  }
  return undefined;
}


/*
 * Handle alarm
 */
function getCurrentTimeInMinutes(){
  return Math.floor(Date.now() / (1000*60));
}

function isAlarmEnabled(){
 return settings.alarm > 0;
}

function getAlarmMinutes(){
  var currentTime = getCurrentTimeInMinutes();
  return settings.alarm - currentTime;
}

function handleAlarm(){
  if(!isAlarmEnabled()){
    return;
  }

  if(getAlarmMinutes() > 0){
    return;
  }

  // Alarm
  var t = 300;
  Bangle.buzz(t, 1)
  .then(() => new Promise(resolve => setTimeout(resolve, t)))
  .then(() => Bangle.buzz(t, 1))
  .then(() => new Promise(resolve => setTimeout(resolve, t)))
  .then(() => Bangle.buzz(t, 1))
  .then(() => new Promise(resolve => setTimeout(resolve, t)))
  .then(() => Bangle.buzz(t, 1));

  // Update alarm state to disabled
  settings.alarm = -1;
  Storage.writeJSON(filename, settings);
}


/*
 * Swipe to set an alarm
 */
Bangle.on('swipe',function(dir) {
  // Increase alarm
  if(dir == -1){
    if(isAlarmEnabled()){
      settings.alarm += 5;
    } else {
      settings.alarm = getCurrentTimeInMinutes() + 5;
    }
  }

  // Decrease alarm
  if(dir == +1){
    if(isAlarmEnabled() && (settings.alarm-5 > getCurrentTimeInMinutes())){
      settings.alarm -= 5;
    } else {
      settings.alarm = -1;
    }
  }

  // Update UI
  draw();

  // Update alarm state
  Storage.writeJSON(filename, settings);
});


/*
 * Stop updates when LCD is off, restart when on
 */
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets - needed by draw
Bangle.loadWidgets();

// Clear the screen once, at startup and draw clock
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
draw();

// After drawing the watch face, we can draw the widgets
Bangle.drawWidgets();