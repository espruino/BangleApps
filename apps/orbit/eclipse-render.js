/* tenkyu eclipse display / scheduling boundary. MIT.
 * Map: polar orthographic radius R*cos(geographic latitude), pixels.
 * Raster inverse uses WGS84 geodetic surface coordinates (km).
 * Uniform solar-disk obscuration is converted to 4x4 ordered black dithering:
 * average surface brightness decreases; umbra is solid black.
 * No RGB framebuffer, pixel readback, or per-pixel trigonometry.
 */
var UPDATE_MS=30000;
var BAYER=new Uint8Array([0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5]);
function create(engine){
  var state,bucket=NaN,lastOptions,gateBucket=NaN,possible=false;
  function update(date,options){
    var ms=date.getTime(),b=Math.floor(ms/UPDATE_MS);
    var key=options?String(options.deltaT)+"/"+String(options.moonK)+"/"+String(options.moonTerms)+"/"+String(options.sunMethod):"";
    if(bucket!==b||key!==lastOptions){
      if(key!==lastOptions)gateBucket=NaN;
      bucket=b;lastOptions=key;
      if(!engine.nearNewMoon(date)){state=undefined;gateBucket=NaN;return false;}
      var gb=Math.floor(ms/600000);
      if(gateBucket!==gb){
        gateBucket=gb;possible=options?true:engine.shadowPossible(date);
      }
      state=possible?engine.prepare(date,options):undefined;
    }
    return !!(state&&state.active);
  }
  function reset(){state=undefined;bucket=NaN;gateBucket=NaN;possible=false;lastOptions=undefined;}
  function draw(graphics,map){
    if(!state||!state.active)return;
    var r=map.radiusPx,cx=map.cx,cy=map.cy,dir=map.south?1:-1;
    var theta=map.longitudeDeg*Math.PI/180-dir*map.rotationRad;
    var ca=Math.cos(theta),sa=Math.sin(theta),r2=r*r;
    var a=engine.constants.equatorialRadiusKm,e2=engine.constants.eccentricitySquared;
    var sign=map.south?-1:1,dx,dy,sl2,n,x,y,z,f;
    graphics.setColor(0);
    for(dy=-r;dy<=r;dy++){
      var extent=Math.floor(Math.sqrt(Math.max(0,r2-dy*dy)));
      for(dx=-extent;dx<=extent;dx++){
        sl2=Math.max(0,1-(dx*dx+dy*dy)/r2);
        n=a/Math.sqrt(1-e2*sl2);
        x=n*(dx*ca-dir*dy*sa)/r;
        y=n*(dx*sa+dir*dy*ca)/r;
        z=sign*n*(1-e2)*Math.sqrt(sl2);
        f=engine.obscurationKm(state,x,y,z);
        if(f>=(BAYER[((dy+cy)&3)*4+((dx+cx)&3)]+0.5)/16)
          graphics.setPixel(cx+dx,cy+dy);
      }
    }
    // A total shadow smaller than a raster pixel still needs a visible center.
    // This is a one-pixel center marker, NOT an enlargement of the physical cone.
    var p=state.result;
    if(p.type==="total"&&(map.south?p.lat<=0:p.lat>=0)){
      var rr=r*Math.cos(p.lat*Math.PI/180);
      var ang=map.rotationRad+dir*(p.lon-map.longitudeDeg)*Math.PI/180;
      graphics.setPixel(Math.round(cx+rr*Math.cos(ang)),Math.round(cy+rr*Math.sin(ang)));
    }
  }
  return {update:update,draw:draw,reset:reset,getState:function(){return state;}};
}
exports.create=create;
exports.UPDATE_MS=UPDATE_MS;
