WIDGETS["recorder"]={area:"tl",width:0,draw:function() {
  if (!this.width) return;
  g.reset().drawImage(atob("DRSBAAGAHgDwAwAAA8B/D/hvx38zzh4w8A+AbgMwGYDMDGBjAA=="),this.x+1,this.y+2);
  require("recorder").activeRecorders.forEach((recorder,i)=>{
    recorder.draw(this.x+15+(i>>1)*12, this.y+(i&1)*12);
  });
},isRecording:function() {
  return !!(require("Storage").readJSON("recorder.json",1)||{}).recording;
},setRecording:function(isOn, options) {
  console.log('WIDGETS["recorder"].setRecording is deprecated. Use require("recorder").setRecording instead');
  return require("recorder").setRecording(isOn, options);
},plotTrack:function(m, options) { // m=instance of openstmap module
  console.log('WIDGETS["recorder"].plotTrack is deprecated. Use require("recorder").plotTrack instead');
  return require("recorder").plotTrack(m, options);
}};
// load settings, set correct widget width if recording
if (WIDGETS["recorder"].isRecording()) require("recorder").setWidgetWidth(WIDGETS["recorder"]);
