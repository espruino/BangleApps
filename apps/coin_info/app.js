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
var gridYValue = 5;
function renderGraph(l) {
    const bounds = ciLib.findMinMax(tknChrtData);
    // logFile.write("?. graphy: " + JSON.stringify(bounds) + "\n");
    require("graph").drawLine(g, tknChrtData, {
        axes: true,
        x: l.x, y: l.y, width: l.w, height: l.h,
        miny: bounds.min,
        maxy: bounds.max,
        // gridy: gridYValue
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
                    {type:"btn", label:"24h", cb: d=>getChart("24h")},
                    {type:"btn", label:"1w", cb: d=>getChart("1w")},
                    {type:"btn", label:"1m", cb: d=>getChart("1m")},
                    {type:"btn", label:"3m", cb: d=>getChart("3m")}
                ]
            }
        ]
    },
    { lazy:true });
layout.update();


//
var updateTimeout;
function getChart(period) {
    //
    timePeriod = period;
    currLoadMsg = `Load... ${period}`;
    //
    // const date = new Date();
    // logFile.write("Called:" + date.toISOString() + " -- " + timePeriod + " -- " + csTokens[ticker] + "\n");

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

            // just not readable
            // const oSpcOjb = ciLib.calculateOptimalYAxisSpacing(tknChrtData);
            // logFile.write("Y-Axis:" + JSON.stringify(oSpcOjb));
            // gridYValue = oSpcOjb.interval;

            //
            g.clearRect(layout.tknGraph.x, layout.tknGraph.y, layout.tknGraph.w, layout.tknGraph.h);
            layout.forgetLazyState(); // Force a full re-render
            layout.render(layout.tknGraph); // Render just the graph area

            //
            currLoadMsg = "";
            layout.render(layout.loadMsg);
        })
        .catch(err => {
            // logFile.write("API Error: " + JSON.stringify(err));
            tknChrtData = [1,2,3,4,5,6,7,8,9,8,7,6,5,4,];
        });

    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(function() {
        updateTimeout = undefined;
        getChart(period);
    }, 60000 - (Date.now() % 60000));
}

//
function setLoadMsg(x) {
    timePeriod = x;
    currLoadMsg = `Load... ${x}`;
}
function showDetails() {
    const token = csTokens[ticker];
    const url = `https://openapiv1.coinstats.app/coins/${token}`;
    Bangle.http(url, {
        method: 'GET',
        headers: {
            'X-API-KEY': db.csApiKey
        }
    })
        .then(data => {
            const tokenInfo = JSON.parse(data.resp);
            const msg = `
            Details for ${token.toUpperCase()}\n
            // Name: ${tokenInfo.name}\n
            Price: ${tokenInfo.price}\n
            Market Cap: ${tokenInfo.marketCap}\n
            // Add more fields as needed
        `;
            E.showAlert(msg, "Token Details").then(function() {
                // print("Ok pressed");
            });
        })
        .catch(err => {
            const msg = `Failed to fetch details for ${token.toUpperCase()}`;
            E.showAlert(msg, "Error").then(function() {
                // print("Ok pressed");
            });
        });
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
