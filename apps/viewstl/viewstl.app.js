// globals
var u = [0, 1, 0]; // axis of rotation
var aux = new Float32Array(12);
var p_aux = E.getAddressOf(aux, true);
var a = 0.5;       // angle of rotation
var light = new Float32Array(12);
var p_light = E.getAddressOf(light, true);
light[0] = 1/Math.sqrt(2);
light[1] = 1/Math.sqrt(2);
light[2] = 0;
var filex = new Float32Array(6);
var p_filex = E.getAddressOf(filex, true);
var addr = new Int32Array(12);
var p_addr = E.getAddressOf(addr, true);
var polyp = new Int32Array(6);
var p_polyp = E.getAddressOf(polyp, true);
var polyedge = new Int32Array(8);
var p_polyedge = E.getAddressOf(polyedge, true);
var edges;
var p_edges;
var zbuf;
var p_zbuf;
var zDist;
var points;
var p_points;
var rpoints;
var p_rpoints;
var npoints = 0;
var faces;
var p_faces;
var vpoints;
var p_vpoints;
var normals;
var p_normals;
var rnormals;
var p_rnormals;
var lastTime;
var nFrames = 0;
var interv;
var qZrot = 0;
var qWireframe = 0;
var zBeta = 0;

const c05 = Math.cos(0.05);
const s05 = Math.sin(0.05);

var c = E.compiledC(`
// void rotatePoints(int, int, int, int)
// void projectPoints(int, int, int, int)
// void popZBuf(int, int, int, int)
// int processFace(int, int, int)
// void initEdges(int, int)
// int findSlot(int, int, int)
void rotatePoints(float *p, float *res, int len, float *u) {
  float c = u[3];
  float s = u[4];
  for (int i=0; i<len; ++i) {
    res[3*i  ] = p[3*i]*(c+u[0]*u[0]*(1-c)) + p[3*i+1]*(u[0]*u[1]*(1-c)-u[2]*s) + p[3*i+2]*(u[0]*u[2]*(1-c)+u[1]*s);
    res[3*i+1] = p[3*i]*(u[1]*u[0]*(1-c)+u[2]*s) + p[3*i+1]*(c+u[1]*u[1]*(1-c)) + p[3*i+2]*(u[1]*u[2]*(1-c)-u[0]*s);
    res[3*i+2] = p[3*i]*(u[2]*u[0]*(1-c)-u[1]*s) + p[3*i+1]*(u[2]*u[1]*(1-c)+u[0]*s) + p[3*i+2]*(c+u[2]*u[2]*(1-c));
  }
}
void projectPoints(float *p, short *res, int len, int zd) {
  float zdist = zd/100.0;
  for (int i=0; i<len; ++i) {
    float dz = p[3*i+2]-zdist;
    res[2*i+0] = (short)(120.0+320.0*p[3*i+0]/dz);
    res[2*i+1] = (short)(80.0+320.0*p[3*i+1]/dz);
  }
}
void quick_sort(int *base, unsigned int nel)
{
  int *pivot;
  int tmp;
  unsigned int left, right;
  if (nel < 2) return;
  pivot = base;
  left  = 0;
  right = nel-1;
  while (left < right) {
    while (*(base+left)>*pivot && left<right) left++;
	while (*(base+right)<*pivot && left<right) right--;
	if (left<right && *(base+left)!=*(base+right)) {
	  if (base+left==pivot) {
		pivot = base+right;
	  } else if (base+right==pivot) {
		pivot = base+left;
	  }
      tmp = *(base+left); *(base+left) = *(base+right); *(base+right) = tmp;
	} else {
	  left++;
    }
  }
  quick_sort(base, left-1);
  quick_sort(base+left, nel-left);
}
void popZBuf(float *p, unsigned short *f, int *zb, int len) {
  for (int i=0; i<len; ++i) {
    int z = int(1000.0*(p[f[i*3]*3+2]+p[f[i*3+1]*3+2]+p[f[i*3+2]*3+2]));
    zb[i] = (z<<10) | i;
  }
  quick_sort(zb, len);
}
int processFace(int *p, int z, int qWire) {
  short *faces    = (short *)p[0];
  float *rnormals = (float *)p[1];
  short *vpoints  = (short *)p[2];
  int *polyp      = (int *)p[3];
  float *light    = (float *)p[4];
  char *edges     = (char *)p[5];
  int *polyedge   = (int *)p[6];
  int shade;
  z = z & 0x3ff;
  if (rnormals[z*3+2]>0) {
    for (int j=0; j<3; ++j) {
      polyp[j*2+0] = vpoints[faces[z*3+j]*2];
      polyp[j*2+1] = vpoints[faces[z*3+j]*2+1];
    }
    if (qWire) {
      char e = edges[z];
      switch(e) {
        case 1:
          polyedge[0]=polyp[0];polyedge[1]=polyp[1];
          polyedge[2]=polyp[2];polyedge[3]=polyp[3];
          polyedge[4]=polyp[0];polyedge[5]=polyp[1];
          polyedge[6]=polyp[2];polyedge[7]=polyp[3];
          break;
        case 2:
          polyedge[0]=polyp[2];polyedge[1]=polyp[3];
          polyedge[2]=polyp[4];polyedge[3]=polyp[5];
          polyedge[4]=polyp[2];polyedge[5]=polyp[3];
          polyedge[6]=polyp[4];polyedge[7]=polyp[5];
          break;
        case 4:
          polyedge[0]=polyp[4];polyedge[1]=polyp[5];
          polyedge[2]=polyp[0];polyedge[3]=polyp[1];
          polyedge[4]=polyp[4];polyedge[5]=polyp[5];
          polyedge[6]=polyp[0];polyedge[7]=polyp[1];
          break;
        case 7:
          for (int k=0; k<6; ++k) polyedge[k] = polyp[k];
          polyedge[6] = polyp[0]; polyedge[7] = polyp[1];
          break;
        case 3:
          for (int k=0; k<6; ++k) polyedge[k] = polyp[k];
          polyedge[6]=polyp[4]; polyedge[7]=polyp[5];
          break;
        case 5:
          polyedge[0]=polyp[4];polyedge[1]=polyp[5];
          polyedge[2]=polyp[0];polyedge[3]=polyp[1];
          polyedge[4]=polyp[2];polyedge[5]=polyp[3];
          polyedge[6]=polyp[2];polyedge[7]=polyp[3];
          break;
        case 6:
          polyedge[0]=polyp[2];polyedge[1]=polyp[3];
          polyedge[2]=polyp[4];polyedge[3]=polyp[5];
          polyedge[4]=polyp[0];polyedge[5]=polyp[1];
          polyedge[6]=polyp[0];polyedge[7]=polyp[1];
          break;
        default:
          for (int k=0; k<8; ++k) polyedge[k]=-1;
      }
    }
    float s = 0.2+(1.0+rnormals[3*z+0]*light[0]+rnormals[3*z+1]*light[1]+rnormals[3*z+2]*light[2])/2.9;
    shade = int(s*31) | (int(s*63)<<5) | (int(s*31)<<11);
    return shade;
  }
  else return 0;
}
void initEdges(int *p, int len) {
  short *faces   = (short *)p[0];
  char *edges    = (char *)p[5];
  float *normals = (float *)p[7];
  for (int i=0; i<len; ++i) {
    char r=0;
    for (int j=0; j<3; ++j) {
      short e1=faces[j+i*3];
      short e2=faces[((j+1) % 3)+i*3];
      int k = len;
      while (k--) {
        if (i!=k && ((faces[k*3+1]==e1 && faces[k*3]==e2) || (faces[k*3+2]==e1 && faces[k*3+1]==e2) || (faces[k*3]==e1 && faces[k*3+2]==e2))) {
          if (normals[k*3]*normals[i*3]+normals[k*3+1]*normals[i*3+1]+normals[k*3+2]*normals[i*3+2] < 0.95) r |= (1<<j);
          k=0;
        }
      }
    }
    edges[i] = r;
  }
}
int findSlot(float *p, float *x, int len) {
  for (int i=0; i<len; ++i) 
    if (p[3*i]-x[0]<0.0001 && p[3*i]-x[0]>-0.0001 && p[3*i+1]-x[1]<0.0001 && p[3*i+1]-x[1]>-0.0001 && p[3*i+2]-x[2]<0.0001 && p[3*i+2]-x[2]>-0.0001) return i;
  p[3*len] = x[0];
  p[3*len+1] = x[1];
  p[3*len+2] = x[2];
  return len;
}
`);

function initNormals() {
  var i = faces.length/3;
  while (i--) {
    normals[i*3+0] = (points[faces[3*i+1]*3+1]-points[faces[3*i+0]*3+1])*(points[faces[3*i+2]*3+2]-points[faces[3*i+0]*3+2]) - (points[faces[3*i+1]*3+2]-points[faces[3*i+0]*3+2])*(points[faces[3*i+2]*3+1]-points[faces[3*i+0]*3+1]);
    normals[i*3+1] = (points[faces[3*i+1]*3+2]-points[faces[3*i+0]*3+2])*(points[faces[3*i+2]*3+0]-points[faces[3*i+0]*3+0]) - (points[faces[3*i+1]*3+0]-points[faces[3*i+0]*3+0])*(points[faces[3*i+2]*3+2]-points[faces[3*i+0]*3+2]);
    normals[i*3+2] = (points[faces[3*i+1]*3+0]-points[faces[3*i+0]*3+0])*(points[faces[3*i+2]*3+1]-points[faces[3*i+0]*3+1]) - (points[faces[3*i+1]*3+1]-points[faces[3*i+0]*3+1])*(points[faces[3*i+2]*3+0]-points[faces[3*i+0]*3+0]);
    var n = Math.sqrt(normals[i*3]*normals[i*3]+normals[i*3+1]*normals[i*3+1]+normals[i*3+2]*normals[i*3+2]);
    if (n>0) {
      normals[i*3] /= -n;
      normals[i*3+1] /= -n;
      normals[i*3+2] /= -n;
    }
  }
}

function readSTL(fn) {
  var fb = require("Storage").read(fn);
  var nverts=0,i=0; while((i=fb.indexOf("vertex",i)+1)!=0) nverts++;
  points = new Float32Array(nverts);
  p_points = E.getAddressOf(points, true);
  faces = new Uint16Array(nverts);
  p_faces = E.getAddressOf(faces, true);
  edges = new Uint8Array(Math.max(faces.length/3,24))
  p_edges = E.getAddressOf(edges, true);
  var fp=0, p=0;
  g.setColor(0.9, 0.9, 0.9);
  g.drawRect(20, 140, 220, 160);
  g.setColor(0.6, 0.6, 0.9);
  while (p<fb.length) {
    var line = '';
    while (fb[p]!="\n") line += fb[p++];
    p++;
    if (line.toLowerCase().includes("vertex")) {
      var v = line.trim().split(/\s+/);
      filex[0] = v[1];
      filex[1] = v[3];
      filex[2] = v[2];
      var slot = 0|c.findSlot(p_points, p_filex, npoints);
      if (slot==npoints) npoints++;
      faces[fp++] = slot;
      if (fp%3 == 0) g.fillRect(21, 141, 21+198*fp/nverts, 159);
    }
  }
  vpoints = new Uint16Array(Math.max(12,2*npoints));
  p_vpoints = E.getAddressOf(vpoints, true);
  normals = new Float32Array(faces.length);
  p_normals = E.getAddressOf(normals, true);
  initNormals();
  rnormals = new Float32Array(faces.length);
  p_rnormals = E.getAddressOf(rnormals, true);
  rpoints = new Float32Array(points.length);
  p_rpoints = E.getAddressOf(rpoints, true);
  zbuf = new Int32Array(Math.max(12,faces.length/3));
  p_zbuf = E.getAddressOf(zbuf, true);
  addr[0] = p_faces;
  addr[1] = p_rnormals;
  addr[2] = p_vpoints;
  addr[3] = p_polyp; 
  addr[4] = p_light; 
  addr[5] = p_edges;
  addr[6] = p_polyedge;
  addr[7] = p_normals;
  c.initEdges(p_addr, faces.length/3);
}

function rotV(v, u, c, s) { 
  "ram"
  return [v[0]*(c+u[0]*u[0]*(1-c)) + v[1]*(u[0]*u[1]*(1-c)-u[2]*s) + v[2]*(u[0]*u[2]*(1-c)+u[1]*s),
          v[0]*(u[1]*u[0]*(1-c)+u[2]*s) + v[1]*(c+u[1]*u[1]*(1-c)) + v[2]*(u[1]*u[2]*(1-c)-u[0]*s),
          v[0]*(u[2]*u[0]*(1-c)-u[1]*s) + v[1]*(u[2]*u[1]*(1-c)+u[0]*s) + v[2]*(c+u[2]*u[2]*(1-c))]; 
}

function largestExtent(pts) {
  var x = 0;
  var i = pts.length/3;
  while (i--) {
    var e = pts[3*i]*pts[3*i]+pts[3*i+1]*pts[3*i+1]+pts[3*i+2]*pts[3*i+2];
    if (e>x) x = e;
  }
  return Math.sqrt(x);
}

function draw() {
  "ram"
  const n = [1, 0, 0];
  if (qZrot>0) {
    var ca, sa, cb, sb;
    if (qZrot==2) {
      var acc = Bangle.getAccel();
      zBeta = -Math.atan2(acc.z, -acc.y);
      var comp = Bangle.getCompass();
      if (!isNaN(comp.heading)) {
        var m = [comp.dx, comp.dy, comp.dz];
        //console.log(m);
        var rm = rotV(m, [1, 0, 0], Math.cos(zBeta), Math.sin(zBeta));
        a = -Math.atan2(rm[0], rm[2]);
        //console.log("heading="+a*180/Math.PI, "zBeta="+zBeta);
      }
      else a = 0;
    }
    ca=Math.cos(a); sa=Math.sin(a); cb=Math.cos(zBeta); sb=Math.sin(zBeta);
    var ul = Math.sqrt(sb*sb+ca*ca*sb*sb+2*sa*sa*cb+2*ca*sb*sb+2*sa*sa);
    u = [(sb+ca*sb)/ul, (-sa-sa*cb)/ul, (-sa*sb)/ul];
    var ra = Math.acos((ca+cb+ca*cb-1)/2);
    if (ra<0) ra += Math.PI;
    aux[3] = Math.cos(ra);
    aux[4] = Math.sin(ra);
  }
  else{
    u = rotV(u, n, c05, s05);
    aux[3] = Math.cos(a);
    aux[4] = Math.sin(a);
  }
  a += 0.08;
  aux[0] = u[0]; aux[1]=u[1]; aux[2]=u[2];
  c.rotatePoints(p_points, p_rpoints, npoints, p_aux);
  c.rotatePoints(p_normals, p_rnormals, faces.length/3, p_aux);
  c.projectPoints(p_rpoints, p_vpoints, npoints, 0|zDist*100);
  c.popZBuf(p_rpoints, p_faces, p_zbuf, faces.length/3);
  g.clear();
  var z, shade;
  if (qWireframe>0) {
    var i = faces.length/3;
    while (i--) {
      z = zbuf[i];
      shade = 0|c.processFace(p_addr, z, 1);
      if (shade > 0) {
        if (qWireframe==1) g.setColor(shade).fillPoly(polyp).setColor(0).drawPoly(polyedge);
        else {
          g.setColor(0).fillPoly(polyp).setColor(shade);
          if (qWireframe==2) g.drawPoly(polyedge);
          else g.drawPoly(polyp, true);
        }
      }
    } 
  }
  else {
    var i = faces.length/3;
    while (i--) {
      z = zbuf[i];
      shade = 0|c.processFace(p_addr, z, 0);
      if (shade > 0) g.setColor(shade).fillPoly(polyp);
    }
  }
  nFrames++;
  var fps = Math.round(nFrames*100000/(Date.now()-lastTime))/100;
  g.setColor(0.7, 0.7, 0.7);
  g.setFont("6x8", 1);
  g.drawString("fps:"+fps.toString(), 20, 0);
  g.flip();
}

function loadFile(fn) {
  Bangle.setLCDMode("direct");
  g.clear();
  E.showMenu();
  E.showMessage(/*LANG*/"Loading...", fn);
  readSTL(fn);
  zDist = 5*largestExtent(points);
  g.clear();
  g.setColor(1, 1, 1);
  g.setFont("6x8", 2);
  g.setFontAlign(-1, -1);
  g.setColor(1, 0.5, 0.5);
  g.drawString("Model info",15, 40);
  g.setColor(1, 1, 1);
  g.drawString("# faces: "+faces.length/3, 15, 80);
  g.drawString("# vertices: "+npoints, 15, 110);
  g.drawString("max extent: "+Math.round(100*(zDist/5))/100, 15, 140);
  g.flip();
  setWatch(function() {
    if (interv) { 
      interv = clearInterval(interv);
      load();
    }
    else {
      Bangle.setLCDMode("doublebuffered");
      lastTime = Date.now();
      nFrames = 0;
      interv = setInterval(function() { draw();}, 30);
    } }, BTN2, {repeat:true, debounce:50});
  setWatch(function() {
    if (qZrot==1) {
      if (zBeta<2*Math.PI/2-0.08) zBeta += 0.08;
    } else zDist *= 0.9;
  }, BTN1, {repeat:true});
  setWatch(function() {
    if (qZrot==1) {
      if (zBeta>-2*Math.PI/2-0.08) zBeta -= 0.08;
    } else zDist /= 0.9;
  }, BTN3, {repeat:true});
  Bangle.on('swipe', function(direction){
    switch(direction){
      case 1:
        qZrot = (qZrot+1)%3;
        break;
      case -1:
        qWireframe = (qWireframe+1)%4;
        break;
  }});
}

function drawMenu() {
  const menu = {
    '': { 'title': 'STL files' }
  };
  var files = require("Storage").list(".stl");
  for (var i=0; i<files.length; ++i) {
    menu[files[i]] = loadFile.bind(null, files[i]);
  }
  menu['Exit'] = function() { load(); };
  E.showMenu(menu);
}

Bangle.on('kill',()=>{Bangle.setCompassPower(0);});
Bangle.setCompassPower(1);
drawMenu();
