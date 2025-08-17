(function() {
  var batt;
  //updates values


  function getHrsFormatted(hrsLeft){

    var daysLeft = hrsLeft / 24;
    daysLeft = Math.round(daysLeft);
    if(daysLeft >= 1) {
      return daysLeft+"d";
    }

    else {
      return Math.round(hrsLeft)+"h";
    }
  }

  //draws battery icon and fill bar
  function drawBatt(){
    batt =E.getBattery();
    var s=24,g=Graphics.createArrayBuffer(24,24,1,{msb:true});
    g.fillRect(0,6,s-3,18).clearRect(2,8,s-5,16).fillRect(s-2,10,s,15).fillRect(3,9,3+batt*(s-9)/100,15);
    g.transparent=0;
    return g.asImage("string");
  }

  //calls both updates for values and icons.
  //might split in the future since values updates once every five minutes so we dont need to call it in every minute while the battery can be updated once a minute.
  function updateDisplay(){
    drawBatt();
  }

  return {
    name: "SmartBatt",
    items: [
      { name : "BattStatus",
        get : () => {

          var img = drawBatt();
          var data=require("smartbatt").get();

          //update clock info according to batt state
          if (Bangle.isCharging()) {
            return { text: batt+"%", img };
          }
          else{
            return { text: getHrsFormatted(data.hrsLeft), img };
          }
        },

        show : function() {
            this.interval = setInterval(()=>{
                updateDisplay();
                this.emit('redraw');
              }, 300000);
          },

        hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      },
      { name : "AvgDrainage",
        get : () => {
          var img = drawBatt()
          var data=require("smartbatt").get();
          return { text: data.avgDrainage.toFixed(2)+"/h", img };
        },

        show : function() {
            this.interval = setInterval(()=>{
                this.emit('redraw');
              }, 300000);
          },

        hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      }
    ]
  };
})
