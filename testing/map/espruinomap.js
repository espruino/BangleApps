require("Storage").write('+map',{
  name:"Map",
  icon:"*map",
  src:"-map"
});
require("Storage").write('*map',require("heatshrink").decompress(atob("mEwghC/AH4AWh//mcwBZIWI/4ABmYABBZAgIC4oyDBYggIC4wABBYoX/C90imcykYXUkYBB+YyDC5E/F5EykQXKHwYVCL4YXNkQ+BC4wICHgIvJ+QVBC4oYBkUvO5QXCU4wXBF5INCCwqMDAYTXUC6xHNC5Z3LI5UyF6oADF9ZfL+fTAIIUCkUjR5397s9C4LxBC4MykfzDYYvI7vdC4cyDIciO5c97s/C4QABF4IBBC5QvEAAk/+ZdBC5JfEX6XzmaPEa7oX8+AGBgYXHBYQXHBAoXFCowXCEA4yCBZIA/AH4AO")));

require("Storage").write("-map",`
var s = require("Storage");
var hs = require("heatshrink");
var map = {
  imgx : 831,
  imgy : 656,
  tilesize : 64,
  scale : 20000,
  lat : 51.7075,
  lon : -1.2948
};


map.center = Bangle.project({lat:map.lat,lon:map.lon});
var lat = map.lat, lon = map.lon;
var fix = {};


function redraw() {
  var cx = g.getWidth()/2;
  var cy = g.getHeight()/2;
  var p = Bangle.project({lat:lat,lon:lon});
  var ix = (p.x-map.center.x)*4096/map.scale + (map.imgx/2) - cx;
  var iy = (map.center.y-p.y)*4096/map.scale + (map.imgy/2) - cy;
  //console.log(ix,iy);
  var tx = 0|(ix/map.tilesize);
  var ty = 0|(iy/map.tilesize);
  var ox = (tx*map.tilesize)-ix;
  var oy = (ty*map.tilesize)-iy;
  for (var x=ox,ttx=tx;x<g.getWidth();x+=map.tilesize,ttx++) {
    for (var y=oy,tty=ty;y<g.getHeight();y+=map.tilesize,tty++) {
      var img = s.read("t"+ttx+"x"+tty);
      //print(x,y,ttx,tty,"t"+ttx+"x"+tty,img?"ok":"-");
      if (img) g.drawImage(hs.decompress(img),x,y);
      else g.clearRect(x,y,x+map.tilesize-1,y+map.tilesize-1);
    }
  }
  g.setColor(1,0,0);
  /*g.fillRect(cx-10,cy-1,cx+10,cy+1);
  g.fillRect(cx-1,cy-10,cx+1,cy+10);*/
  if (fix.fix)
    g.fillRect(cx-2,cy-2,cx+2,cy+2);
}
redraw();

var fix;
Bangle.on('GPS',function(f) {
  fix=f;
  g.clearRect(0,0,240,8);
  g.setColor(1,1,1);
  g.setFont("6x8");
  g.setFontAlign(0,0);
  var txt = fix.satellites+" satellites";
  if (!fix.fix)
    txt += " - NO FIX";
  g.drawString(txt,120,4);
  if (fix.fix) {
    var p = Bangle.project({lat:lat,lon:lon});
    var q = Bangle.project(fix);
    var cx = g.getWidth()/2;
    var cy = g.getHeight()/2;
    var ix = (q.x-p.x)*4096/map.scale + cx;
    var iy = (q.y-p.y)*4096/map.scale + cy;
    g.fillRect(ix-2,iy-2,ix+2,iy+2);
  }
});
Bangle.setGPSPower(1);
redraw();

setWatch(function() {
  if (!fix.fix) return;
  lat = fix.lat;
  lon = fix.lon;
  redraw();
}, BTN2, {repeat:true});
`);