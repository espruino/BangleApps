(function() {
  return {
    name: "qmsched",
    items: [
      { name : "Quiet Mode Toggle",
        get : function() { 
          const mode = require("qmsched").getMode()
          let txt="Off";
          let img=atob("GBgBAAAAAAAAAAAAABwAABwAAH8AAP+AAf/AA//gA//gA//gB//wA//gA//gA//gA//gA//gA//gABwAAD4AABwAAAgAAAAAAAAA");
          if(mode==1){
            txt="Alarms";
            img=atob("GBgBAAAAAAAAAAgAAP+AA//gB//wD//4D//4H//8H//8AAAAAAAAIADiAADgAADgH/nwH/nwD/P4D/P4B/hAA/zgAPnwAAjgAABA")
          }
          if(mode==2){
            txt="Silent"
            img=atob("GBgBAAAAAAAAAAgAAP+AA//gB//wD//4D//4H//8H//8GAAMGAAMOAAOGAAMH//8H//8H//8D//4D//4B//wA//gAP+AAAgAAAAA");
          }
          
          return { 
            text : txt,
            img : img}},
        show : function() {},
        hide : function() {},
        run : function() {
          mode=require("qmsched").getMode();
          mode=(mode+=1) % 3
          require("qmsched").setMode(mode);
          this.emit("redraw");
        }
        
      }
    ]
  };
}) 
