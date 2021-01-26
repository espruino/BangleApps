(() => {

  function getFace(){

    function draw() {
      let steps = "-";
      let show_steps = false;

      // only attempt to get steps if activepedom is loaded
      if (WIDGETS.activepedom !== undefined) {
        steps = WIDGETS.activepedom.getSteps();
      } else if (WIDGETS.wpedom !== undefined) {
        steps = WIDGETS.wpedom.getSteps();
      }
      
      var d = new Date();
      var da = d.toString().split(" ");
      var time = da[4].substr(0,5);
      
      g.reset();
      g.clearRect(0,24,239,239);
      g.setFont("Vector", 80);
      g.setColor(1,1,1);  // white
      g.setFontAlign(0, -1);
      g.drawString(time, g.getWidth()/2, 60);
      g.setColor(0,255,0);  // green
      g.setFont("Vector", 60);
      g.drawString(steps, g.getWidth()/2, 160);
    }

    function onSecond(){
      var t = new Date();
      if ((t.getSeconds() % 5) === 0) draw();
    }

    return {init:draw, tick:onSecond};
  }

  return getFace;

})();
