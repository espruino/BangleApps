/*
 * Requirements and globals
 */
const locale = require('locale');
var alarm = -1;
var hrmValue = "-";

var backgroundImage =  {
  width : 176, height : 151, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("AAdx48cATsAg88+fPAS5ACyVJkgCdyEAgPnz15AS4cBg6AeQcEBQDyDhQECDEDrUCNAtIgAA4iBKFuBB5QY1AIPLOGQfSADAQRA5Qf6D6g/gQf8H/iD/n//wCD9gP/IJCD2h5BB+CD/IJCD5/yD8jl/IIP/GoKD5n4/CAAeAQe8B//8QYkf+PAQew+BgaBD4AFB/CD1j47BIgRBCgFx/6D1//wgCDEQAU/8CD0/iGDAAYHBg4LCQeI1DQYjCD/+AQeRBDQY4IBIIOChEgAQaDqfYZBFBAZBBAGM/PQaDI+BB2IAiDDgZBygJ6EIIn8IOqDKIIscuPHAQdwINkHIJEfIIPnz15AQeAINT+CHwcPAYI1Bj4CBnnz54CDZ1UHPQKDDgEBQfBBF/CMCQYQCCQe/ABAX/+ALCQeR3BHAJBEQAU/8AFBQeL7B//HIgIIE+P/AoSDygF/QQJBEAwP4AoSDygEBQYgFBQYLLDQecAn59BAAn+BgaDzIIP8ZAX/48cuAMDQevggE48YyCvyD3gP/BAxBEQek4A40OQe4ANQegAMQf6D/AAccQf8Ak6DFyCD/QfcDQYueIPMAuaDE+fAIPMOQYoCb8kAgnTps0AS8AgKDFATkAg2atOmAS6EBhKD/AAMcQf4A/AH4A/AA0QuPHjgCdgEHnnz54CXIIWSpMkATuQgEB8+evICXDgKAfQcEJQDyDhNA7OCADMBgkQoICXgRoFpBAcADjpGuBB5iSDFoCD/QfaADAQRA5Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf4A/AH4A/AH4A/AFkYsOGAQdAIPPTps0AQaD6zVp0wCDsCD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf4AjjFhwwCDoBC6AH4A/AH4A/AH4AInnz54CD+BB58+evICDwCD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/ADMcQf8Ag6DFyCD/QfcDQYueIPMAuaDE+fHjlxATLrBDrUAgSDFATfkgEkyVJATEAgPHQYgCcQboABQf4ABhhfZAQyDc"))
}

var iconPlanet = {
  width : 50, height : 50, bpp : 3,
  transparent : 5,
  buffer : require("heatshrink").decompress(atob("23btoCD6PHjlx9oLGAQuGiVJkmSpIRK2lxEYQCDCJOGjEhEYNBwUI5drEw/xEYwCB8oRGDoMhwmSsAFBkGM237NZICGj15OgnaDoOGI4cgwUa5dv332EwdHEZACB8+evYRCtAdBEAQpDscs3379+9HAW8EZPHz158+WSQQjFwUYsMs2QjBEwPrSRZuCJQN5TAJuCEYkhwUS5cvJQRxCNxZKDOIXgJQkh0mYtMk2XLJQXv1u0EZSVDOIWsJQsSpMkyVJljgB9gmB7YjLOgtq4BKEsIjCAQNLlgCBt+9EZwCCj8sJQpxB00aJoYCB5cBEZ4CB+RKFJoeGjAjCoOGzBKaAQeGJQQFBwJKSsAjIcweSBwRKRjojKOgYFCxZKRtAaBjHrlm4FJUN3hKQi3ShAjB2XLAQQmI7dHJR97tsh9gjEAQLpHlu2+PnExvF23an3794mF2BKFm3btsevImMjwRB23v3wmB3xNF5BuDCIPb8+eEwOeExIRCtojCJo5uEEwRxBEwRuJHAdI+YmCTYlgJQIREtrjCEwLdHCIiYBhF7OgnJSQgmFjhxCOgiSDAQvSX4QmB90IkQRIX4gmCEZICDvwmCBY3QA"))
}

var iconGps = {
  width : 50, height : 50, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQCFpH0BAwCJv/6CJ8l589CJ0kyf//wIDpVEChM8+/fBAdZ8QRIp++///0gIBlMkxI4IuZKB+/SKAPHzpKJ/YkB//pKAP2BYeXhIFDx88+fPvqYBnibEkmUAofv34lC/RQBBYdcmPCXIYjBEwPfvnzJoILBQoUlHAUuJQYmCDodw48cuBKGTA0WEYIEBJQ6YEQwMMuImBJQyYEkmZFAVkyVSJQ6YCyUcmPDjgmBTAJKETAlJiS4ETANPJQpxCJQtxTALgBEwnfvohBI4NZkmWpNlcAgAD/wzBEYaYCy8cJQiYEyIjCTAWS3wlGTAVIEwkerJKFTAkmOIclToK8GAAIPBIgImCufHyxxG59pEIS8DvfypMr968HEwOHEwfx8+cEYkpCIeSoiYByVf/uSkmTEQP7ZIiYDnl5AQNwBYgCGyOn38k2+2pIRKyVeuPPj1x4ccCJVKSgP/5cJA4NSExMps+cSoMMKAIVCCg7SBpd7TANZkmUHBMevPnjlwcwXCCJFEzYDBA4WWKIIRHpEw4+eNwUxEwKYIkVJk1IyIKFHA+DR4VcJQYCBJRBoCkxHBAgNkyyYKkmXEYaYMAQMSEYKYNAQOHEwnSfBYjBAgVaCJdJJSMkTAK8KYQyVKAQ4jBNxiYEcBCYJXIkgA="))
}

var iconCompass = {
  width : 50, height : 50, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQCDl//AAPSBYwCFv4RCAAOkCJNLCAgACCJm2rNn34FB+g1Jvny5cs2XPn///QRI9uWEYP2rNly5NHNYN82YjB/4mC5YmBOgkl//9y1bsuW/4CB/Nlz//9I4D3/8I4M8EAICB55NCL4g/BIgRKBAQtnL4lf+QdCI4YCD2Y4DSQPZtojHsuerI4Dv/flnzEZB3CHAJuB8ojIAQY4CNwJHI2XHTAY4B/4gJrGBAoSqBpf2EZMQmRxEv/5Nw9YyVCAoO+rf/0v/Nw/PjFB4ZxCn/+y7dBJQyNBkAIDz/6/7dBJQsYsMEhgsE//+7IjFsTYBwAIE/4ABEYs8uPEiFyF4gRBXIImEBAPSpAjDtuX//9+YmERgMcuODBAU9+xKCr68Ev4lBNwm//IJCnhxDDQPx4xuFJQhBDDQXwTwpKBSos8//HjlwYQyVG34aB2zCG//1Nw6SFAQTgD/JuD+wjFrbgCr/yMQI+B/lxEY08UgPpl4jCNwP+I4wCBUgOk3/8DoXxI44CBn/0yREDzx0EAQlndANJv4gJAQf3/VJkq8CJoZuGXIPpkg4BOIZuI5/9CII4BEZAmDNwIRBHAJxDNxH+CII4CSQW+NALgBtomBt5uCHAbjB2ZoCAQPyJQP/NwIRCkm//4gBIgP/SQn/CImSYALjDviSDQAYUDL4ImEEYYRGL4X/76PCI4P/SQYCFl4MBAAgRJEwYRPOgZrHpMgA"))
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

Graphics.prototype.setFontAntonioMedium = function(scale) {
  // Actual height 20 (19 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAA//mP/5gAAAAAAAAAAAAA/gAMAAAAAA/gAPAAAEIIBP+H/8D+IYBP+H/8D+IABCAAwIAfnwP8+PHh448eP3+B4fAAAAAAAH/AD/4AwGAMBgD/4Af8GAAPgAPgAfgAfAAfAA+AAOP/AH/4BgGAYBgH/4A/8AAAAAAAAAQAA/B+f4/+GMPhjv/4/h8Dg/gAcYwAAPwADgAAAAAAAAB//8///sAAaAACAAAMAAb//+f//AAAAAAAbAAGwAA4AA/wADgABsAAbAAAAAAAgAAMAAPwAD8AAMAADAAAAAAAAAAHAAB/AAOAAAAAAAAMAADAAAwAAMAACAAAAAAAAAABgAAYAAAAAAAAA4AD+AP+A/4A/gAOAAAAAAAAAH//j//8wADMAAz//8f/+AAAAAAAMAADAABgAA//+P//gAAAAAAAAAAAAAfgfP4fzAfswfDP/gx/gMAAAHgPj4D8wMDMHAz//8f3+AAEAAAAADwAH8APzA/AwP//j//4AAwAAAD/Hw/x+MwBjOAYz/+Mf/AAAAAAAH//j//8wYDMGAz9/8fP+AAcDAAAwAAMAfjB/4z/wP+AD4AAwAAAAOB/f4///MHAzBwM///H9/gAAAAAAH/Pj/78wGDMBgz//8f/+AAAAAAADhwA4cAAAAAAAAAAAAAADh/A4fgAAAAOAAHwABsAA7gAccAGDAAAAANgADYAA2AANgADYAA2AAAAAAAABgwAccADuAAbAAHwAA4AAAAHwAD8c4/POMHAD/wAfwAAAAAAAAD/wD//B4B4Y/HMf8zMBMyATMwczP+M4BzHwcgf+AA+AAAAAAD4A/+P/8D+DA/4wH/+AB/4AAeAAAAAAA//+P//jBgYwYGP//j//4PH4AAAAAAAf/+P//zgAcwADP4fz+P4Ph8AAAAAAA//+P//jAAYwAGPADj//4P/4AAAAAAA//+P//jBgYwYGMGBgAAAAAAP//j//4wYAMGADBgAAAAAAAA//w///PAHzAQM4MHP7/x+/8AAAAAAD//4//+AGAABgAAYAP//j//4AAAAAAAAAA//+P//gAAAAAAAAAAAHwAB+AABgAAY//+P//AAAAAAAAAAD//4//+APgAf+Afj8PgPjAAYAAAAAAD//4//+AABgAAYAAGAAAAAAA//+P//j/gAD/wAB/gAP4B/4P/AD//4//+AAAAAAAAAAP//j//4P4AAfwAA/g//+P//gAAAAAAAAAA//g//+PAHjAAY4AOP//h//wAAAAAAD//4//+MDADAwA4cAP/AB/gAAAAAAAA//g//+PAHjAAc4APv//5//yAAAAAAD//4//+MGADBgA48AP//h+f4AAAAAAB+Pw/z+MOBjBwY/P+Hx/AAHgwAAMAAD//4//+MAADAAAAAAP//D//4AAOAABgAA4//+P//AAAAwAAP8AD//AA/+AAfgP/4//gPwAAAAA+AAP/4Af/4AD+A//j/wA/wAD/+AA/4B/+P/+D+AAAAAMADj8P4P/4A/4B//w+A+MABgAAA4AAPwAB/gAB/+A//j/gA+AAMAAAAAYwB+MH/jf+Y/8GPwBjAAAAAAP//7//+wABsAAYAAAAAAPAAD/gAH/gAD/gAD4AACAAADAAGwABv//7//+AAAA=="), 32, atob("BQUHCAgVCQQFBQkHBQcFBwgICAgICAgICAgFBQcHBwgPCQkJCQcHCQoFCQkHDQoJCQkJCAYJCQ0ICAcGBwY="), 20+(scale<<8)+(1<<16));
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
    draw(true);
  }, 60000 - (Date.now() % 60000));
}


function draw(queue){
  g.reset();
  g.clearRect(0, 24, g.getWidth(), g.getHeight());

  // Draw background image
  g.drawImage(backgroundImage, 0, 24);

  // Draw raster
  // g.drawLine(112, 100, 112, 165);
  for(var x=1; x<7; x++){
    g.drawLine(110+x*10, 100, 110+x*10, 160);
  }

  for(var y=0; y<6; y++){
    g.drawLine(113, 105+y*10, 175, 105+y*10);
  }

  // Draw symbol
  var bat = E.getBattery();

  var iconImg =
    alarm >= 0 ? iconAlarm :
      Bangle.isCharging() ? iconCharging :
      bat < 30 ? iconNoBattery :
      Bangle.isGPSOn() ? iconGps :
      Bangle.isCompassOn() ? iconCompass :
      iconPlanet;
  g.drawImage(iconImg, 120, 107);

  // Alarm within symbol
  g.setFontAntonioSmall();
  if(alarm > 0){
    g.setFontAlign(0,0,0);
    g.drawString(alarm, 120+25, 107+25);
    g.setFontAlign(-1,-1,0);
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

  // HRM
  g.setFontAntonioMedium();
  g.setFontAlign(-1,-1,0);
  g.drawString("HRM:", 25, 98);
  g.drawString(hrmValue, 64, 98);

  // Draw steps
  var steps = getSteps();
  g.drawString("STEP:", 25, 121);
  g.drawString(steps, 64, 121);

  // Draw battery
  g.drawString("BAT:", 25, 144);
  g.drawString(bat+ "%", 64, 144);

  // Queue draw in one minute
  if(queue){
    queueDraw();
  }
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
 * HRM
 */
Bangle.on('HRM',function(hrm) {
  hrmValue = hrm.bpm;
});

/*
 * Handle alarm
 */
var alarmTimeout;
function queueAlarm() {
  if (alarmTimeout) clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(function() {
    alarmTimeout = undefined;
    handleAlarm();
  }, 60000 - (Date.now() % 60000));
}

function handleAlarm(){

    // Check each minute
    if(alarm > 0){
      alarm--;
      queueAlarm();
    }

    // After n minutes, inform the user
    if(alarm == 0){
      alarm = -1;

      var t = 300;
      Bangle.buzz(t, 1)
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1))
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1))
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1));
    }

    // Update UI
    draw(false);
}


/*
 * Swipe to set an alarm
 */
Bangle.on('swipe',function(dir) {
  // Increase alarm
  if(dir == -1){
    alarm = alarm < 0 ? 0 : alarm;
    alarm += 5;
    queueAlarm();
  }

  // Decrease alarm
  if(dir == +1){
    alarm -= 5;
    alarm = alarm <= 0 ? -1 : alarm;
  }

  // Update UI
  draw(false);
});


/*
 * Stop updates when LCD is off, restart when on
 */
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(true); // draw immediately, queue redraw
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
draw(true);

// After drawing the watch face, we can draw the widgets
Bangle.drawWidgets();