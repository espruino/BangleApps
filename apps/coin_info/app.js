const settings = require("Storage").readJSON("coin_info.settings.json", 1) || {};
const db = require("Storage").readJSON("coin_info.cmc_key.json", 1) || {};
const csTokens = db.csTokens.split(',');
var ticker = 0;
var timePeriod = "24h";
var tknChrtData = [0,1,3,8,10,12,12,10,8,3,1,0];


var Layout = require("Layout");
var layout = new Layout({
        type:"v", c: [
            {type:"h", valign:-1,
                c: [
                    {type:"txt", id:"tknName", font:"6x8:2", label:"", halign:-1, fillx:1},
                    {type:"btn", label:"...", halign:1, cb: d=>setLoadMsg("details")}
                ]
            },
            {type:"txt", id:"loadMsg", font:"6x8", label:"", fillx:1 },
            {type:"custom", render:renderGraph, id:"tknGraph", bgCol:g.theme.bg, fillx:1, filly:1 },
            {type:"h", valign:1,
                c: [
                    {type:"btn", label:"24h", cb: d=>setLoadMsg("24 h")},
                    {type:"btn", label:"1w", cb: d=>setLoadMsg("1 w")},
                    {type:"btn", label:"1m", cb: d=>setLoadMsg("1 m")},
                    {type:"btn", label:"3m", cb: d=>setLoadMsg("3 m")}
                ]
            }
        ]
    },
    { lazy:true });
layout.update();


//
function renderGraph(l) {
    require("graph").drawLine(g, tknChrtData, {
        axes : true,
        x:l.x, y:l.y, width:l.w, height:l.h
    });
}

//
// function makeHttpRequest() {
//     // Ensure Internet Access is enabled in Gadgetbridge settings
//     Bangle.http("https://example.com/your_api_endpoint")
//         .then(data => {
//             console.log("Got HTTP response:", data);
//             // Handle the response here
//         })
//         .catch(err => {
//             console.error("HTTP request failed:", err);
//         });
//
//     if (httpTimeout) clearTimeout(httpTimeout);
//     httpTimeout = setTimeout(makeHttpRequest, 300000); // Make HTTP request every 5 minutes
// }

//
function swipeHandler(lr, ud) {
    if (lr == 1) {
        ticker = ticker - 1;
        if (ticker < 0) ticker = 0;
    }
    if (lr == -1) {
        ticker = ticker + 1;
        if (ticker > csTokens.length - 1) ticker = csTokens.length - 1;
    }
}

//
var currLoadMsg = "...";
function setLoadMsg(x) {
    currentLabel = `Load... ${x}`;
}

// timeout used to update every minute
var drawTimeout;
// update the screen
function draw() {
    //
    layout.tknName.label = (csTokens[ticker]).toUpperCase();
    layout.loadMsg.label = currLoadMsg;
    layout.render();

    // schedule a draw for the next minute
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
        drawTimeout = undefined;
        draw();
    }, 1000 - (Date.now() % 1000));
}

// update time and draw
g.clear();
draw();

//
Bangle.on("swipe", swipeHandler);
Bangle.loadWidgets(); // loading widgets after drawing the layout in `drawMain()` to display the app UI ASAP.
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
// Bangle.setUI({
//     mode: 'custom',
//     back: Bangle.showClock,
//     btn: function() { // Handle button press
//         console.log("Button pressed");
//     }
// });
