(() => {

function getFace(){

    var buf = Graphics.createArrayBuffer(240,92,1,{msb:true});
    function flip() {
      g.setColor(1,1,1);
      g.drawImage({width:buf.getWidth(),height:buf.getHeight(),buffer:buf.buffer},0,85);
    }
    
    function drawTime() {
      buf.clear();
      buf.setColor(1);
      var d = new Date();
      var da = d.toString().split(" ");
      var time = da[4];
      buf.setFont("Vector",54);
      buf.setFontAlign(0,-1);
      buf.drawString(time,buf.getWidth()/2,0);
      buf.setFont("6x8",2);
      buf.setFontAlign(0,-1);
      var date = d.toString().substr(0,15);
      buf.drawString(date, buf.getWidth()/2, 70);
      flip();
    }  
    return {init:drawTime, tick:drawTime};
}

return getFace;

})();