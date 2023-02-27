exports.calibrate = () => {
  const max={x:-32000, y:-32000, z:-32000},
      min={x:32000, y:32000, z:32000};
  const ref = setInterval(()=>{
      const m = Bangle.getCompass();
      max.x = m.x>max.x?m.x:max.x;
      max.y = m.y>max.y?m.y:max.y;
      max.z = m.z>max.z?m.z:max.z;
      min.x = m.x<min.x?m.x:min.x;
      min.y = m.y<min.y?m.y:min.y;
      min.z = m.z<min.z?m.z:min.z;
  }, 100);
  return new Promise((resolve) => {
     setTimeout(()=>{
       if(ref) clearInterval(ref);
       const offset = {x:(max.x+min.x)/2,y:(max.y+min.y)/2,z:(max.z+min.z)/2};
       const delta  = {x:(max.x-min.x)/2,y:(max.y-min.y)/2,z:(max.z-min.z)/2};
       const avg = (delta.x+delta.y+delta.z)/3;
       const scale = {x:avg/delta.x, y:avg/delta.y, z:avg/delta.z};
       resolve({offset:offset,scale:scale});
     },20000);
  });
}

exports.tiltfix = (m,g,O,S) => {
  "ram"
  if (O & S) {
    m.dx =(m.x-O.x)*S.x; m.dy=(m.y-O.y)*S.y; m.dz=(m.z-O.z)*S.z;
  }
  let d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
  if (d<0) d+=360;
  const phi = Math.atan(-g.x/-g.z);
  const cosphi = Math.cos(phi), sinphi = Math.sin(phi);
  const theta = Math.atan(-g.y/(-g.x*sinphi-g.z*cosphi));
  const costheta = Math.cos(theta), sintheta = Math.sin(theta);
  const xh = m.dy*costheta + m.dx*sinphi*sintheta + m.dz*cosphi*sintheta;
  const yh = m.dz*sinphi - m.dx*cosphi;
  let psi = Math.atan2(yh,xh)*180/Math.PI;
  if (psi<0) psi+=360;
  return psi;
}

exports.tiltfixread = (O,S) => {
  "ram"
  const mag = Bangle.getCompass({noTiltComp: true});
  const acc = Bangle.getAccel();
  return exports.tiltfix(mag,acc,O,S);
}
