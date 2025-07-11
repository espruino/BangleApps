//Learns by averaging power usage every time it is updated


(function(){
  
  
  const storage = require("Storage");
  const filename = "widsmartbatt.json";
  let runningAvg;
  var newJson=false;
  
  //check if json file exists;
  
  function CalcHoursRemaining (batt, usage) {
    
    var hrsLeft = 175000 * batt / (100 * usage);
    return hrsLeft;
    
  };
  
  function addValue(val) {
    let summary = storage.readJSON(filename, 1) || { total: 0, count: 0 };
    summary.total += val;
    summary.count++;
    storage.writeJSON(filename, summary); // SAVED!

    let avg = summary.total / summary.count;
    runningAvg=avg;
  }

  
  const intervalLow = 60000; // update time when not charging
  const intervalHigh = 2000; // update time when charging
  var showPercent=false;
  const width=40;
  const height=24;
  let COLORS = {
    'bg':    g.theme.bg,
    'fg':    g.theme.fg,
    'charging': "#08f",
    'high':     g.theme.dark ? "#fff" : "#000",
    'low':      "#f00",
  };

  const levelColor = (l) => {
    if (Bangle.isCharging()) return COLORS.charging;
    if (l >= 30) return COLORS.high;
    return COLORS.low;
  };

  function draw() {
    var _a = require("power_usage").get(), usage = _a.usage, batt = _a.batt;
    var s = 29;
    var x = this.x, y = this.y;
    var txt;
    
    //Add this to total and get the average
    addValue(usage)
      
    if(showPercent){
      txt=batt;
    }else{
      var hrsLeft=CalcHoursRemaining(batt,runningAvg);
      var days = hrsLeft / 24;
      txt = days >= 1 ? "".concat(Math.round(Math.min(days, 99)), "d") : "".concat(Math.round(hrsLeft), "h");
    }
    

    let xl = x+4+batt*(s-12)/100;

    g.setColor(COLORS.bg);
    g.fillRect(x+2,y+5,x+s-6,y+18);

    g.setColor(levelColor(batt));
    g.fillRect(x+1,y+3,x+s-5,y+4);
    g.fillRect(x+1,y+19,x+s-5,y+20);
    g.fillRect(x,y+4,x+1,y+19);
    g.fillRect(x+s-5,y+4,x+s-4,y+19);
    g.fillRect(x+s-3,y+8,x+s-2,y+16); // tip of the battery
    g.fillRect(x+4,y+15,xl,y+16); // charging bar

    g.setColor(COLORS.fg);
    g.setFontAlign(0,0);
    g.setFont('6x8');
    g.drawString(txt, x + 14, y + 10);

    if (Bangle.isCharging()) changeInterval(id, intervalHigh);
      else                   changeInterval(id, intervalLow);
  }


  Bangle.on('charging',function(charging) { draw(); });
  var id = setInterval(()=>WIDGETS["widsmartbatt"].draw(), intervalLow);
  Bangle.on("touch", function (_btn, xy) {
        if (WIDGETS["back"] || !xy)
            return;
        var oversize = 5;

        var w = WIDGETS["widsmartbatt"];
        var x = xy.x, y = xy.y;
        if (w.x - oversize <= x && x < w.x + width + oversize
            && w.y - oversize <= y && y < w.y + height + oversize) {
            E.stopEventPropagation && E.stopEventPropagation();
            showPercent = true;
            setTimeout(function () { return (showPercent = false, w.draw(w)); }, 3000);
            w.draw(w);
        }
    });
  WIDGETS["widsmartbatt"]={area:"tr",width:30,draw:draw};
})();
