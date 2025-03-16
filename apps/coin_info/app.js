const settings = require("Storage").readJSON("coin_info.settings.json", 1) || {};
const db = require("Storage").readJSON("coin_info.cmc_key.json", 1) || {};
const csTokens = db.csTokens.split(',');
var graph = require("graph");
//
var ticker = 0;
var currLoadMsg = "...";
var timePeriod = "24h";
var tknChrtData = [5,6,5,6,5,6,5,6,5,6,5,6,5,6,];


//
function renderGraph(l) {
    g.clearRect(l.x, l.y, l.w, l.h);

    if (tknChrtData.length > 0) {
        graph.drawLine(g, tknChrtData, {
            axes: true,
            x: l.x, y: l.y, width: l.w, height: l.h,
            miny: Math.min(...tknChrtData),
            maxy: Math.max(...tknChrtData),
            // gridy: 5
        });
    }
}

var Layout = require("Layout");
var layout = new Layout({
        type:"v", c: [
            {type:"h", valign:-1,
                c: [
                    {type:"txt", id:"tknName", font:"6x8:2", label:"", halign:-1, fillx:1},
                    {type:"btn", label:"...", halign:1, cb: d=>showDetails()}
                ]
            },
            {type:"txt", id:"loadMsg", font:"6x8", label:"", fillx:1 },
            {type:"custom", render:renderGraph, id:"tknGraph", bgCol:g.theme.bg, fillx:1, filly:1 },
            {type:"h", valign:1,
                c: [
                    {type:"btn", label:"24h", cb: d=>getChart("24h")},
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
function getChart(period) {
    const url = `https://openapiv1.coinstats.app/coins/${csTokens[ticker]}/charts?period=${period}`;
    Bangle
        .http(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': db.csApiKey
            }
        })
        .then(data => {
            // console.log("Got HTTP response:", data);
            // Handle the response here
            const apiData = JSON.parse(data.resp);
            tknChrtData = apiData.map(innerArray => innerArray[1]);
            currLoadMsg = "";
            //
            layout.render(layout.tknGraph)
        })
        .catch(err => {
            console.error("HTTP request failed:", err);
        });

    // if (repeatable == true) {
    //     if (httpTimeout) clearTimeout(httpTimeout);
    //     httpTimeout = setTimeout(getChart, 300000); // Make HTTP request every 5 minutes
    // }
}

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
function setLoadMsg(x) {
    currLoadMsg = `Load... ${x}`;
    timePeriod = x;
}
function showDetails() {
    currLoadMsg = `Details for ${(csTokens[ticker]).toUpperCase()}`;
}

// timeout used to update every minute
var drawTimeout;
// update the screen
function draw() {
    //
    layout.tknName.label = (csTokens[ticker]).toUpperCase();
    layout.loadMsg.label = currLoadMsg;
    //
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
getChart(false);

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
