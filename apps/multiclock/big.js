(() => {

    function getFace(){

    function drawTime(d) {
        g.reset();
        var da = d.toString().split(" ");
        var time = da[4].substr(0, 5).split(":");
        var hours = time[0],
          minutes = time[1];
        g.clearRect(0,24,239,239);
        g.setColor(1,1,1);
        g.setFont("Vector",132);
        g.drawString(hours,50,24,true);
        g.drawString(minutes,50,132,true);
      }

    function onSecond(){
       var t = new Date();
       if (t.getSeconds() === 0) drawTime(t);
    }

    function drawAll(){
       drawTime(new Date());
    }

    return {init:drawAll, tick:onSecond};
    }

  return getFace;

})();