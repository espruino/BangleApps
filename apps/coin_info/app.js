{
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    var Layout = require("Layout");
    var layout = new Layout( {
        type:"v", c: [
            {type:"txt", font:"20%", label:"12:00", id:"time" },
            {type:"txt", font:"6x8", label:"The Date", id:"date" }
        ]
    });
    g.clear();
    layout.render();
    
    Bangle.setUI({
        mode : 'custom',
        back : Bangle.showClock,
    });
}