{
    const settings = require("Storage").readJSON("coin_info.settings.json", 1) || {};
    const db = require("Storage").readJSON("coin_info.cmc_key.json", 1) || {};
    let ticker = 0;

    var Layout = require("Layout");
    var layout = new Layout({
        type:"v", c: [
            {type:"h",
                c: [
                    {type:"txt", id:"tknName", label:"Load...", halign:"left"},
                    {type:"btn", label:"...", halign:"right", cb: l=>{}}
                ]
            },
            {type:"txt", id:"tknGraph", font:"20%", label:"12:00" },
            {type:"h",
                c: [
                    {type:"btn", label:"07", cb: l=>{}},
                    {type:"btn", label:"14", cb: l=>{}},
                    {type:"btn", label:"30", cb: l=>{}},
                    {type:"btn", label:"60", cb: l=>{}}
                ]
            }
        ]
    },
    { lazy:true });
    layout.update();

    // timeout used to update every minute
    var drawTimeout;
    // update the screen
    function draw() {
        //
        layout.tknName.label = settings.tokenSelected[ticker];
        layout.render();

        // schedule a draw for the next minute
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = setTimeout(function() {
            drawTimeout = undefined;
            draw();
        }, 60000 - (Date.now() % 60000));
    }

    // update time and draw
    g.clear();
    draw();

    //
    Bangle.loadWidgets(); // loading widgets after drawing the layout in `drawMain()` to display the app UI ASAP.
    require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
}