(() => {
    function getFace(){

      const locale = require("locale");

      var W = g.getWidth();
      var H = g.getHeight();
      var scale = W/240;
        
        function drawClock(){
          var now=Date();
          let d=now.toString().split(' ');
          //var min=d[4].substr(3,2);
          //var sec=d[4].substr(-2);
          var tm=d[4].substring(0,5);
          //var hr=d[4].substr(0,2);
          //lastmin=min;
          g.reset();
          g.clearRect(0,24,W-1,H-1);
          g.setColor(g.theme.fg);
          g.setFontAlign(0,-1);
          g.setFontVector(80*scale);
          g.drawString(tm,4+W/2,H/2+24-80*scale);
          g.setFontVector(36*scale);
          g.setColor(g.theme.fg2);
          d[1] = locale.month(now,3);
          d[0] = locale.dow(now,3);    
          var dt=d[0]+" "+d[1]+" "+d[2];//+" "+d[3];
          g.drawString(dt,W/2,H/2+24);
        }


        return {init:drawClock, tick:drawClock, tickpersec:false};
     }

    return getFace;

})();

