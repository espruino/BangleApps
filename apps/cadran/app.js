// Code from Graphical Editor
var txt, largeur, hauteur, cum_cor, glyph, dizminpre, dizmin, dizheu, charge, dizdat, dizmoi, vit, d, nomjou, uniminpre, flash, uniheu, jou1, unidat, unimoi, BLE, gps, sec, jou, mode, recalage, vit_pre, jou2, min, z0, cor_int, interval_boucle, unimin, jou3, z1, chargeur, interval_cligno, z2, heu, dat, z3, chargeur_prec, moi, z4, z5, an, gps_listener, z6, z7, z8, z9, zA, zD, zE, zI, zJ, zL, zM, zN, zR, zS, zU, diff, zV, z2points, zBTon, zBTof, zAPPS, zSYNC, zGPS;

// Describe this function...
function bouton() {
  g.setBgColor(0,0,0);
  g.clear();
  if (mode == 'montre') {
    mode = 'menu';
    vit_pre = vit;
    eval("Bangle.on('touch', function(zone, e) {\n  if (e.x >= 0 && e.x < 83 && e.y >= 0 && e.y < 52) {\n    bluetooth();\n  }\n});");
    eval("Bangle.on('touch', function(zone, e) {\n  if (e.x >= 0 && e.x < 83 && e.y >= 62 && e.y < 114) {\n    lanceur();\n  }\n});");
    eval("Bangle.on('touch', function(zone, e) {\n  if (e.x >= 0 && e.x < 83 && e.y >= 124 && e.y < 176) {\n    GPS();\n  }\n});");
    eval("Bangle.on('touch', function(zone, e) {\n  if (e.x >= 94 && e.x < 176 && e.y >= 0 && e.y < 48) {\n    avance();\n  }\n});");
    eval("Bangle.on('touch', function(zone, e) {\n  if (e.x >= 94 && e.x < 176 && e.y >= 128 && e.y < 176) {\n    recule();\n  }\n});");
    aff_BLE();
    aff_lanceur();
    aff_GPS();
    moins();
    plus();
    aff_vit();
    g.setColor(1,1,0);
    g.setBgColor(0,0,0);
    g.setFont("Vector",32);g.setFontAlign(-1,-1);
    g.drawString('s/J',106,53,true);
  } else if (mode == 'menu') {
    mode = 'montre';
    coupure_GPS();
    eval("clearInterval(interval_cligno)");
    eval("Bangle.removeAllListeners('touch')");
    if (vit != vit_pre) {
      eval("require(\"Storage\").write(\"vit\", \"\" + vit)");
    }
    chargement();
    aff_ponct();
    aff_unimin();
    aff_dizmin();
    aff_heu();
    aff_jou();
    aff_dat();
    aff_moi();
  }
}

// Describe this function...
function initialisation() {
  cum_cor = 0;
  d = new Date();
  sec = d.getSeconds();
  min = d.getMinutes();
  dizmin = 'z' + String(String(Math.floor(min / 10)));
  unimin = 'z' + String(String(min).slice(-1));
  dizminpre = dizmin;
  uniminpre = unimin;
  heu = d.getHours();
  dizheu = 'z' + String(String(Math.floor(heu / 10)));
  uniheu = 'z' + String(String(heu).slice(-1));
  jou = d.getDay();
  dat = d.getDate();
  moi = d.getMonth();
  an = String(d.getFullYear()).slice(-2);
  an = parseInt(an);
  chargeur = Bangle.isCharging();
  aff_ponct();
  aff_dizmin();
  aff_unimin();
  aff_heu();
  jour();
  date();
  mois();
  chargement();
  recalage = true;
  diff = 62000 - sec * 1000;
  eval("interval_boucle = setInterval(horloge, diff)");
}

// Describe this function...
function creerGlyph(txt, largeur, hauteur) {
  eval("glyph = Graphics.createArrayBuffer(largeur, hauteur, 1, {msb:true});\nglyph.transparent = 0;\nglyph.setColor(1);\n\nvar polys = g.getVectorFontPolys(txt);\n\nvar xmin = 32767;\nvar xmax = -32767;\nvar ymin = 32767;\nvar ymax = -32767;\n\nfor (var n = 0; n < polys.length; n++) {\n  var poly = polys[n];\n\n  for (var i = 0; i < poly.length; i += 2) {\n    if (poly[i] < xmin) xmin = poly[i];\n    if (poly[i] > xmax) xmax = poly[i];\n    if (poly[i + 1] < ymin) ymin = poly[i + 1];\n    if (poly[i + 1] > ymax) ymax = poly[i + 1];\n  }\n}\n\nvar sx = largeur / (xmax - xmin);\nvar sy = hauteur / (ymax - ymin);\n\nfor (var n = 0; n < polys.length; n++) {\n  var poly = polys[n];\n  var p = new Int16Array(poly.length);\n\n  for (var i = 0; i < poly.length; i += 2) {\n    p[i] = Math.round((poly[i] - xmin) * sx);\n    p[i + 1] = Math.round((poly[i + 1] - ymin) * sy);\n  }\n\n  glyph.fillPoly(p);\n}");
  return glyph;
}

// Describe this function...
function nettoyage() {
  eval("Bangle.setHRMPower(false, \"cadran\");\nBangle.setGPSPower(false, \"cadran\");\nBangle.setCompassPower(false, \"cadran\");\nBangle.setBarometerPower(false, \"cadran\");\n\nBangle.accelWr(0x18, 0x0A);\n\ntry { NRF.sleep(); } catch (e) { }\nNRF.setServices({}, {uart:true, hid:undefined});\n\nBangle.setOptions({\n  wakeOnBTN1: true,\n  wakeOnFaceUp: false,\n  wakeOnTouch: false,\n  wakeOnDoubleTap: false,\n  wakeOnTwist: false,\n  twistThreshold: 819.2,\n  twistMaxY: -800,\n  twistTimeout: 1000\n});\n\nBangle.setLCDBrightness(0);\nBangle.setLocked(true);");
}

// Describe this function...
function nom_du_jour() {
  if (jou == 0) {
    nomjou = 'DIM';
  } else if (jou == 1) {
    nomjou = 'LUN';
  } else if (jou == 2) {
    nomjou = 'MAR';
  } else if (jou == 3) {
    nomjou = 'MER';
  } else if (jou == 4) {
    nomjou = 'JEU';
  } else if (jou == 5) {
    nomjou = 'VEN';
  } else if (jou == 6) {
    nomjou = 'SAM';
  }
}

// Describe this function...
function cree_caract() {
  glyph = '';
  hauteur = 53;
  largeur = 32;
  z0 = creerGlyph("0", largeur, hauteur);
  z1 = creerGlyph("1", largeur, hauteur);
  z2 = creerGlyph("2", largeur, hauteur);
  z3 = creerGlyph("3", largeur, hauteur);
  z4 = creerGlyph("4", largeur, hauteur);
  z5 = creerGlyph("5", largeur, hauteur);
  z6 = creerGlyph("6", largeur, hauteur);
  z7 = creerGlyph("7", largeur, hauteur);
  z8 = creerGlyph("8", largeur, hauteur);
  z9 = creerGlyph("9", largeur, hauteur);
  hauteur = 40;
  largeur = 52;
  zA = creerGlyph("A", largeur, hauteur);
  zD = creerGlyph("D", largeur, hauteur);
  zE = creerGlyph("E", largeur, hauteur);
  zI = creerGlyph("I", 26, hauteur);
  zJ = creerGlyph("J", largeur, hauteur);
  zL = creerGlyph("L", largeur, hauteur);
  zM = creerGlyph("M", largeur, hauteur);
  zN = creerGlyph("N", largeur, hauteur);
  zR = creerGlyph("R", largeur, hauteur);
  zS = creerGlyph("S", largeur, hauteur);
  zU = creerGlyph("U", largeur, hauteur);
  zV = creerGlyph("V", largeur, hauteur);
  z2points = creerGlyph(":", 10, 30);
  hauteur = 40;
  largeur = 70;
  zBTon = creerGlyph("BTon", largeur, hauteur);
  zBTof = creerGlyph("BTof", largeur, hauteur);
  zAPPS = creerGlyph("APPS", largeur, hauteur);
  zSYNC = creerGlyph("SYNC", largeur, hauteur);
  zGPS = creerGlyph("GPS", largeur, hauteur);
}

// Describe this function...
function aff_ponct() {
  if (mode == 'montre') {
    g.setColor(1,1,0);
    eval("g.drawImage(z2points, 84, 22);");
    eval("g.fillPoly([91,110,100,110,82,163,75,163]);");
  }
}

// Describe this function...
function horloge() {
  cum_cor = cum_cor + cor_int / 1000;
  if (recalage == true) {
    recalage = false;
    cor_int = Math.round(vit * 1000 * (1000 / (60 * 24))) / 1000;
    eval("changeInterval(interval_boucle, 60000 - cor_int)");
  }
  if (min != 59) {
    min = min + 1;
  } else {
    min = 0;
    if (heu != 23) {
      heu = heu + 1;
    } else {
      heu = 0;
      if (jou != 6) {
        jou = jou + 1;
      } else {
        jou = 0;
      }
      if (dat == 30 && (moi == 3 || moi == 5 || moi == 8 || moi == 10) || moi == 1 && (!(an % 4 === 0) && dat == 28 || an % 4 === 0 && dat == 29) || moi != 11 && dat == 31) {
        moi = moi + 1;
        dat = 1;
        mois();
      } else if (moi == 11 && dat == 31) {
        an = an + 1;
        moi = 0;
        dat = 1;
        mois();
      } else {
        dat = dat + 1;
      }
      jour();
      date();
    }
    MAJ_heu();
    chargement();
  }
  MAJ_min();
  chargeur = Bangle.isCharging();
  if (chargeur == true || chargeur != chargeur_prec) {
    chargement();
  }
  chargeur_prec = chargeur;
}

// Describe this function...
function aff_unimin() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    eval("g.fillRect(144, 0, 175, 52);");
    g.setColor(1,1,0);
    eval("g.drawImage(global[unimin],144,0);");
  }
}

// Describe this function...
function variables() {
  dizminpre = '';
  uniminpre = '';
  vit_pre = 0;
  interval_boucle = 0;
  interval_cligno = 0;
  flash = false;
  gps = false;
  chargeur = false;
  gps_listener = 0;
  BLE = 'BT off';
  cor_int = 0;
  chargeur_prec = false;
}

// Describe this function...
function aff_dizmin() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    eval("g.fillRect(104, 0, 135, 52);");
    g.setColor(1,1,0);
    eval("g.drawImage(global[dizmin],104,0);");
  }
}

// Describe this function...
function aff_BLE() {
  if (BLE == 'BT on') {
    eval("g.setColor(0,1,0)");
    eval("g.fillRect(0, 0, 82, 51)");
    eval("g.setBgColor(0,1,0)");
    g.setColor(1,1,0);
    eval("g.drawImage(zBTon, 6, 6)");
  } else if (BLE == 'BT off') {
    g.setColor(1,0,0);
    eval("g.fillRect(0, 0, 82, 51)");
    g.setBgColor(1,0,0);
    g.setColor(1,1,0);
    eval("g.drawImage(zBTof, 6, 6)");
  }
}

// Describe this function...
function aff_heu() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    eval("g.fillRect(0, 0, 71, 52);");
    g.setColor(1,1,0);
    eval("g.drawImage(global[dizheu],0,0);");
    eval("g.drawImage(global[uniheu],40,0);");
  }
}

// Describe this function...
function aff_jou() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    eval("g.fillRect(0, 62, 175, 101);");
    g.setColor(1,1,0);
    if (nomjou == 'DIM') {
      eval("g.drawImage(global[jou1], 13, 62);");
      eval("g.drawImage(global[jou2], 75, 62);");
      eval("g.drawImage(global[jou3], 111, 62);");
    } else {
      eval("g.drawImage(global[jou1], 0, 62);");
      eval("g.drawImage(global[jou2], 62, 62);");
      eval("g.drawImage(global[jou3], 124, 62);");
    }
  }
}

// Describe this function...
function aff_lanceur() {
  eval("g.setColor(0,0,1)");
  eval("g.fillRect(0, 62, 82, 113)");
  eval("g.setBgColor(0,0,1)");
  g.setColor(1,1,0);
  eval("g.drawImage(zAPPS, 6, 68)");
}

// Describe this function...
function aff_GPS() {
  if (gps == false) {
    eval("clearInterval(interval_cligno)");
    g.setColor(1,0,0);
    eval("g.fillRect(0, 124, 82, 175)");
    g.setBgColor(1,0,0);
    g.setColor(1,1,0);
    eval("g.drawImage(zSYNC, 6, 130)");
  } else if (gps == true) {
    eval("interval_cligno = setInterval(cligno, 500);");
  }
}

// Describe this function...
function aff_dat() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    eval("g.fillRect(0, 110, 71,  162);");
    g.setColor(1,1,0);
    eval("g.drawImage(global[dizdat], 0, 110);");
    eval("g.drawImage(global[unidat],40, 110);");
  }
}

// Describe this function...
function MAJ_min() {
  dizmin = 'z' + String(String(Math.floor(min / 10)));
  if (dizmin != dizminpre) {
    aff_dizmin();
  }
  dizminpre = dizmin;
  unimin = 'z' + String(String(min).slice(-1));
  if (unimin != uniminpre) {
    aff_unimin();
  }
  uniminpre = unimin;
}

// Describe this function...
function cligno() {
  if (flash == false) {
    flash = true;
    eval("g.setColor(0,1,0)");
    eval("g.fillRect(0, 124, 82, 175)");
    eval("g.setBgColor(0,1,0)");
    g.setColor(1,1,0);
    eval("g.drawImage(zSYNC, 6, 130)");
  } else if (flash == true) {
    flash = false;
    g.setColor(1,1,0);
    eval("g.fillRect(0, 124, 82, 175)");
    g.setBgColor(1,1,0);
    eval("g.setColor(0,1,0)");
    eval("g.drawImage(zGPS, 4, 130)");
  }
}

// Describe this function...
function aff_moi() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    eval("g.fillRect(104, 110, 175,  162);");
    g.setColor(1,1,0);
    eval("g.drawImage(global[dizmoi], 104, 110);");
    eval("g.drawImage(global[unimoi], 144, 110);");
  }
}

// Describe this function...
function MAJ_heu() {
  dizheu = 'z' + String(String(Math.floor(heu / 10)));
  uniheu = 'z' + String(String(heu).slice(-1));
  aff_heu();
}

// Describe this function...
function chargement() {
  charge = E.getBattery();
  charge = Math.round((charge / 100) * 176);
  if (mode == 'montre') {
    g.setColor(0,0,0);
    eval("g.fillRect(0, 171 , 175, 175);");
    if (chargeur == true) {
      g.setColor(1,0,0);
    } else {
      g.setColor(1,1,0);
    }
    eval("g.fillRect(-2, 171, charge-1, 175);");
  }
}

// Describe this function...
function jour() {
  nom_du_jour();
  jou1 = 'z' + String(nomjou.charAt(0));
  jou2 = 'z' + String(nomjou.charAt(1));
  jou3 = 'z' + String(nomjou.charAt(2));
  aff_jou();
}

// Describe this function...
function plus() {
  g.setColor(1,1,0);
  eval("g.fillRect(94, 0, 175, 47)");
  g.setColor(0,0,0);
  eval("g.fillRect(121, 19, 148, 28)");
  eval("g.fillRect(130, 10, 139, 37)");
}

// Describe this function...
function date() {
  dizdat = 'z' + String(String(Math.floor(dat / 10)));
  unidat = 'z' + String(String(dat).slice(-1));
  aff_dat();
}

// Describe this function...
function moins() {
  g.setColor(1,1,0);
  eval("g.fillRect(94, 128, 175, 175)");
  g.setColor(0,0,0);
  eval("g.fillRect(121, 147, 148, 156)");
}

// Describe this function...
function aff_vit() {
  g.setColor(0,0,0);
  eval("g.fillRect(94, 79, 175, 127);");
  g.setColor(1,1,0);
  g.setBgColor(0,0,0);
  g.setFont("Vector",43);g.setFontAlign(0,-1);
  g.drawString(vit,136,83,true);
  recalage = true;
}

// Describe this function...
function mois() {
  dizmoi = 'z' + String(String(Math.floor((moi + 1) / 10)));
  unimoi = 'z' + String(String(moi + 1).slice(-1));
  aff_moi();
}

// Describe this function...
function bluetooth() {
  if (BLE == 'BT off') {
    BLE = 'BT on';
    eval("try { NRF.wake(); } catch (e) { }\nBluetooth.setConsole(1);");
  } else if (BLE == 'BT on') {
    BLE = 'BT off';
    eval("try { NRF.sleep(); } catch (e) { }\nBluetooth.setConsole(0);");
  }
  aff_BLE();
}

// Describe this function...
function lanceur() {
  eval("clearInterval()");
  eval("Bangle.removeAllListeners('touch')");
  eval("Bangle.setGPSPower(false, \"cadran\")");
  eval("Bangle.removeListener('GPS', gps_listener)");
  d = new Date();
  eval("setTime((d.getTime() / 1000)+cum_cor)");
  eval("Bangle.showLauncher()");
}

// Describe this function...
function avance() {
  vit = Math.round((vit + 0.1) * 10) / 10;
  if (vit > 9.9) {
    vit = 9.9;
  }
  aff_vit();
}

// Describe this function...
function recule() {
  vit = Math.round((vit - 0.1) * 10) / 10;
  if (vit < -9.9) {
    vit = -9.9;
  }
  aff_vit();
}

// Describe this function...
function GPS() {
  if (gps == false) {
    gps = true;
    aff_GPS();
    eval("Bangle.setGPSPower(true, \"cadran\");\ngps_listener = Bangle.on('GPS', function(fix) {\nif (fix.time) {\nsetTime(fix.time.getTime() / 1000);\nvar d = new Date();\nif (Math.abs(d.getTime() - fix.time.getTime()) < 1000) {\nBangle.removeListener('GPS', gps_listener);\nfix_reussi();\n}\n}\n})");
  } else {
    coupure_GPS();
    aff_GPS();
  }
}

// Describe this function...
function coupure_GPS() {
  eval("Bangle.removeListener('GPS', gps_listener);\nBangle.setGPSPower(false, \"cadran\");");
  gps = false;
}

// Describe this function...
function fix_reussi() {
  coupure_GPS();
  eval("clearInterval(interval_cligno)");
  eval("clearInterval(interval_boucle)");
  mode = 'montre';
  eval("Bangle.removeAllListeners('touch')");
  g.setBgColor(0,0,0);
  g.clear();
  initialisation();
}


eval("Bluetooth.setConsole(true)");
eval("Bangle.removeAllListeners('lock');");
eval("clearWatch();");
g.setBgColor(1,1,0);
g.clear();
g.setColor(0,0,0);
g.setFont("Vector",35);g.setFontAlign(0,-1);
g.drawString('Cadran',90,10,true);
g.drawString('par',90,60,true);
g.drawString('Jeff Nash',90,110,true);
g.setFont("Vector",20);g.setFontAlign(0,1);
g.drawString('2026',90,170,true);
eval("Bangle.on('lock', function(on, reason) {\n  if (!on && reason == \"button\") {\n    Bangle.setLCDBrightness(1);\n  }\n});");
nettoyage();
vit = parseFloat(require("Storage").read("vit"));
eval("if (isNaN(vit)) vit = 0");
cree_caract();
setTimeout(function() {
  g.setBgColor(0,0,0);
g.clear();
mode = 'montre';
variables();
initialisation();
setWatch(function() {
  bouton();
 }, BTN1, {"repeat":true,"edge":"rising","debounce":10});
}, 1000*3);
