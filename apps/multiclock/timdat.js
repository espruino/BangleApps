(() => {
    var locale = require("locale");
    var dayFirst = ["en_GB", "en_IN", "en_NAV", "de_DE", "nl_NL", "fr_FR", "en_NZ", "en_AU", "de_AT", "en_IL", "es_ES", "fr_BE", "de_CH", "fr_CH", "it_CH", "it_IT", "tr_TR", "pt_BR", "cs_CZ", "pt_PT"];
    var withDot = ["de_DE", "nl_NL", "de_AT", "de_CH", "hu_HU", "cs_CZ", "sl_SI"];

    function getFace(){
        
        var lastmin=-1;
        function drawClock(){
          var d=Date();
          if (d.getMinutes()==lastmin) return;
          var tm=d.toString().split(' ')[4].substring(0,5);
          lastmin=d.getMinutes();
          g.reset();
          g.clearRect(0,24,239,239);
          var w=g.getWidth();
          g.setColor(0xffff);
          g.setFontVector(80);
          g.drawString(tm,4+(w-g.stringWidth(tm))/2,64);
          g.setFontVector(36);
          g.setColor(0x07ff);
          var dt=locale.dow(d, 1) + " ";
          if (dayFirst.includes(locale.name)) {
            dt+=d.getDate();
            if (withDot.includes(locale.name)) {
              dt+=".";
            }
            dt+=" " + locale.month(d, 1);
          } else {
            dt+=locale.month(d, 1) + " " + d.getDate();
          }
          g.drawString(dt,(w-g.stringWidth(dt))/2,160);
          g.flip();
        }

        function drawFirst(){
          lastmin=-1;
          drawClock();
        }

        return {init:drawFirst, tick:drawClock};
     }

    return getFace;

})();

