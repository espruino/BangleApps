(() => {

function getBLECurrentTimeData(d) {
  var updateReason = 0; // unknown update reason
  return [
      d.getFullYear()&0xFF,
      d.getFullYear()>>8,
      d.getMonth()+1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getDay() ? d.getDay() : 7/*sunday*/,
      Math.floor(d.getMilliseconds()*255/1000),
      updateReason
    ];
}

NRF.setServices({
  0x1805 : {
    0x2A2B : {
      value : getBLECurrentTimeData(new Date()),
      readable : true,
      notify : true
    }
  }
}, {  advertise: [ '1805' ] });

Bangle.on('GPS', function(fix) {
  if (fix.time !== undefined) {
    NRF.updateServices({
      0x1805 : {
        0x2A2B : {
          value : getBLECurrentTimeData(fix.time),
          notify : true
        }
      }
    });
  }
});
Bangle.setGPSPower(1);


  function draw() {
    g.reset();
    g.drawImage(require("heatshrink").decompress(atob("i0XxH+CR0HhEHEyEOi1AAAMWhAUNisW6/XwICBi0PHpgUC69WAYUWIpcVxAVGsgsLi2sCAOsg4EDiwVPlZYCCoUzss6IwxBE68rDYJBBldlAAVeNpIADNoNdxIWDssrCYMJgKZDF4SZCxGtCollmcJAALFDnTFE1utxNdrtXq9WqwVDeJAVB1tdrwABFgM6maOKwQWCIQgbBmQVJmQVCCwlXF4LoKCoaHDCoSgFAAldCwYtCqxbCLRQVECwNWr4VBr4VJmYWFrpcDCpM6neJC4pdCChEsss7C4+IFRI4DC4LBKCpBQLAAgA=")), this.x, this.y);
  }
    WIDGETS["gpstimeserver"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: 24, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()
