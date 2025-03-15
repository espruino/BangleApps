const settings = require("Storage").readJSON("coin_info.settings.json", 1) || {};
const db = require("Storage").readJSON("coin_info.cmc_key.json", 1) || {};
const csTokens = db.csTokens.split(',');
let ticker = 0;

var Layout = require("Layout");
var layout = new Layout({
        type:"v", c: [
            {type:"h", valign:-1,
                c: [
                    {type:"txt", id:"tknName", font:"6x8:2", label:"Load...", halign:-1},
                    {type:"btn", label:"...", halign:1, cb: d=>setDummy("dot-dot-dot")}
                ]
            },
            {type:"txt", id:"tknGraph", font:"6x8:2", label:"graph..." },
            {type:"h", valign:1,
                c: [
                    {type:"btn", label:"07", cb: d=>setDummy("seven")},
                    {type:"btn", label:"14", cb: d=>setDummy("fourteen")},
                    {type:"btn", label:"30", cb: d=>setDummy("thirty")},
                    {type:"btn", label:"60", cb: d=>setDummy("sixty")}
                ]
            }
        ]
    },
    { lazy:true });
layout.update();

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
var currentLabel = "loading...";
function setDummy(x) {
    currentLabel = x;
}

// timeout used to update every minute
var drawTimeout;
// update the screen
function draw() {
    g.clear();

    layout.tknGraph.label = currentLabel;
    layout.tknName.label = (csTokens[ticker]).toUpperCase();
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
