const logFile = require("Storage").open("coin_info_log.txt", "a");
// const settings = require("Storage").readJSON("coin_info.settings.json", 1) || {};
const db = require("Storage").readJSON("coin_info.cmc_key.json", 1) || {};
const csTokens = db.csTokens.split(',');
//
const ciLib = require("coin_info");
//
var ticker = 0;
var currLoadMsg = "...";
var timePeriod = "24h";
var tknChrtData = [5,6,5,6,5,6,5,6,5,6,5,6,5,6,];


//
Bangle.loadWidgets(); // loading widgets after drawing the layout in `drawMain()` to display the app UI ASAP.
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
// Bangle.setUI({
//     mode: 'custom',
//     back: Bangle.showClock
//     // btn: function() { // Handle button press
//     //     console.log("Button pressed");
//     // }
// });
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
Bangle.on("swipe", swipeHandler);


//
function renderGraph(l) {
    const bounds = ciLib.findMinMax(tknChrtData);
    // logFile.write("?. graphy: " + JSON.stringify(bounds) + "\n");
    require("graph").drawLine(g, tknChrtData, {
        axes: true,
        x: l.x, y: l.y, width: l.w, height: l.h,
        miny: bounds.min,
        maxy: bounds.max,
        // gridy: 5
    });
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
                    {type:"btn", label:"24h", cb: d=>setLoadMsg("24h")},
                    {type:"btn", label:"1w", cb: d=>setLoadMsg("1w")},
                    {type:"btn", label:"1m", cb: d=>setLoadMsg("1m")},
                    {type:"btn", label:"3m", cb: d=>setLoadMsg("3m")}
                ]
            }
        ]
    },
    { lazy:true });
layout.update();


//
var getChartTimeout;
function getChart(period) {
    //
    const date = new Date().toDateString();
    logFile.write("Called:" + date);
    //
    timePeriod = period;
    currLoadMsg = `Load... ${period}`;

    const url = `https://openapiv1.coinstats.app/coins/${csTokens[ticker]}/charts?period=${timePeriod}`;
    Bangle
        .http(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': db.csApiKey
            }
        })
        .then(data => {
            // logFile.write("HTTP resp:" + JSON.stringify(data));
            const apiData = JSON.parse(data.resp);
            tknChrtData = apiData.map(innerArray => innerArray[1]);
            // logFile.write("Chart data:" + JSON.stringify(tknChrtData));
            currLoadMsg = "";
            //
            g.clearRect(layout.tknGraph.x, layout.tknGraph.y, layout.tknGraph.w, layout.tknGraph.h);
            layout.forgetLazyState(); // Force a full re-render
            layout.render(layout.tknGraph); // Render just the graph area
        })
        .catch(err => {
            // logFile.write("API Error: " + JSON.stringify(err));
            tknChrtData = [1,2,3,4,5,6,7,8,9,8,7,6,5,4,];
        });

    if (getChartTimeout) clearTimeout(getChartTimeout);
    getChartTimeout = setTimeout(function() {
        getChartTimeout = undefined;
        getChart(period);
    }, 30000);
}

//
function setLoadMsg(x) {
    timePeriod = x;
    currLoadMsg = `Load... ${x}`;
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
    layout.render(layout.graph);
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
getChart("24h");
