(() => {

  function getFace(){
      
  function drawTime(d) {    
      function convert(n){
          var t0 = [" ","one","two","three","four","five","six","seven","eight","nine"];
          var t1 = ["ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
          var t20= ["twenty","thirty","forty","fifty"];
          if(n<10) return {top:" ",bot:t0[n]};
          else if(n<20) return {top:" ",bot:t1[n-10]};
          else if(n<60) return {top:t20[Math.floor(n/10)-2],bot:t0[n%10]};
          return "error";     
      }
      g.reset();
      g.clearRect(0,40,239,210);
      g.setColor(1,1,1);
      g.setFontAlign(0,0);
      g.setFont("Vector",44);
      var txt = convert(d.getHours());
      g.drawString(txt.top,120,60);
      g.drawString(txt.bot,120,100);
      txt = convert(d.getMinutes());
      g.drawString(txt.top,120,140);
      g.drawString(txt.bot,120,180);
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