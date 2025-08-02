(function() {
  var img;
  var v;
  var data;
  var hrLeft = 0;
  var daysLeft = 0;
  var showPercent=false;
  //updates values
  function updateValues(){
    v = E.getBattery();
    data = require("smartbatt").get();
    hrLeft = data.hrsLeft;
    daysLeft = hrLeft / 24;

    hrLeft = Math.round(hrLeft);
    daysLeft = Math.round(daysLeft);
  }

  
  //draws battery icon and fill bar
  function drawBatt(){
    v =E.getBattery();
    var s=24,g=Graphics.createArrayBuffer(24,24,1,{msb:true});
    g.fillRect(0,6,s-3,18).clearRect(2,8,s-5,16).fillRect(s-2,10,s,15).fillRect(3,9,3+v*(s-9)/100,15);
    g.transparent=0;
    img=g.asImage("string");
  }

  //calls both updates for values and icons.
  //might split in the future since values updates once every five minutes so we dont need to call it in every minute while the battery can be updated once a minute.
  function updateDisplay(){
    updateValues();
    drawBatt();
  }

  return {
    name: "SmartBatt",
    items: [
      { name : "BattStatus",
        get : () => {
          updateValues();
          drawBatt();
          
          //update clock info according to batt state
          if (Bangle.isCharging()) {
            return { text: v+"%", img : img};
          }
          else if(daysLeft >= 1) {
            return { text: daysLeft+"d", img : img};
          }

          else {
            return {text: hrLeft+"h", img: img};
          }
        },

        show : function() {
            this.interval = setInterval(()=>{
                updateDisplay();
                this.emit('redraw');
              }, 60000);
          },

        hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      },
      { name : "AvgDrainage",
        get : () => {
          drawBatt()
          var data=require("smartbatt").get();
          return { text: data.avgDrainage.toFixed(2)+"/h", img : img};
        },

        show : function() {
            this.interval = setInterval(()=>{
                this.emit('redraw');
              }, 60000);
          },

        hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      }
    ]
  };
})
