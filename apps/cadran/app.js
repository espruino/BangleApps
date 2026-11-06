var xmin, xmax, ymin, ymax, cum_cor, dizminpre, dizmin, dizheu, dizdat, dizmoi, vit, recalage_temps, uniminpre, flash, uniheu, unidat, unimoi, BLE, gps, d, cor_int, vit_pre, mode, min, interval_boucle, unimin, chargeur, interval_cligno, heu, glyjou, xgly, dat, chargeur_prec, jour, tab, moi, an, gps_listener, z2points, zBTon, zBTof, zAPPS, zSYNC, zGPS;
var glyphes = {};

function bouton() {
  g.setBgColor(0,0,0);
  g.clear();
  if (mode == 'montre') {
    mode = 'menu';
    vit_pre = vit;
    Bangle.on('touch', function(zone, e) {
      if (e.x >= 0 && e.x < 83 && e.y >= 0 && e.y < 52) {
        bluetooth();
      }
    });
    Bangle.on('touch', function(zone, e) {
      if (e.x >= 0 && e.x < 83 && e.y >= 62 && e.y < 114) {
        lanceur();
      }
    });
    Bangle.on('touch', function(zone, e) {
      if (e.x >= 0 && e.x < 83 && e.y >= 124 && e.y < 176) {
        GPS();
      }
    });
    Bangle.on('touch', function(zone, e) {
      if (e.x >= 94 && e.x < 176 && e.y >= 0 && e.y < 48) {
        avance();
      }
    });
    Bangle.on('touch', function(zone, e) {
      if (e.x >= 94 && e.x < 176 && e.y >= 128 && e.y < 176) {
        recule();
      }
    });
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
    clearInterval(interval_cligno);
    Bangle.removeAllListeners('touch');
    if (vit != vit_pre) {
      require("Storage").write("vit", "" + vit);
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

function initialisation() {
  cum_cor = 0;
  recalage_temps = true;
  d = new Date();
  interval_boucle = setInterval(horloge, 60000 - d.getSeconds() * 1000);
  min = d.getMinutes();
  dizmin = 'z' + String(String(Math.floor(min / 10)));
  unimin = 'z' + String(String(min).slice(-1));
  dizminpre = dizmin;
  uniminpre = unimin;
  heu = d.getHours();
  dizheu = 'z' + String(String(Math.floor(heu / 10)));
  uniheu = 'z' + String(String(heu).slice(-1));
  jour = d.getDay();
  dat = d.getDate();
  moi = d.getMonth();
  an = String(d.getFullYear()).slice(-2);
  an = parseInt(an);
  chargeur = Bangle.isCharging();
  aff_ponct();
  aff_dizmin();
  aff_unimin();
  aff_heu();
  aff_jou();
  date();
  mois();
  chargement();
}

function creerGlyph(txt, largeur, hauteur) {
  var glyph = Graphics.createArrayBuffer(largeur, hauteur, 1, {msb:true});
  var polys = g.getVectorFontPolys(txt);
  var sx, sy;
  glyph.transparent = 0;
  glyph.setColor(1);
  bornes(polys);
  sx = largeur / (xmax - xmin);
  sy = hauteur / (ymax - ymin);
  for (var n = 0; n < polys.length; n++) {
    glyph.fillPoly(transformer(polys[n], xmin, ymin, sx, sy));
  }
  return glyph;
}

function nettoyage() {
  Bluetooth.setConsole(true);
  clearInterval();
  Bangle.setHRMPower(false, "cadran");
  Bangle.setGPSPower(false, "cadran");
  Bangle.setCompassPower(false, "cadran");
  Bangle.setBarometerPower(false, "cadran");
  Bangle.accelWr(0x18, 0x0A);
  NRF.setServices({}, {uart:true, hid:undefined});
  try { NRF.sleep(); } catch (e) { }
  Bangle.setOptions({wakeOnBTN1:true});
  Bangle.setOptions({wakeOnFaceUp:false});
  Bangle.setOptions({wakeOnTouch:false});
  Bangle.setOptions({wakeOnDoubleTap:false});
  Bangle.setOptions({wakeOnTwist:false});
  Bangle.setOptions({twistThreshold:819.2});
  Bangle.setOptions({twistMaxY:-800});
  Bangle.setOptions({twistTimeout:1000});
  Bangle.setLCDBrightness(0);
  Bangle.setLocked(true);
}

function bornes(polys) {
  xmin = 32767;
  xmax = -32767;
  ymin = 32767;
  ymax = -32767;
  for (var n = 0; n < polys.length; n++) {
    var poly = polys[n];
    for (var i = 0; i < poly.length; i += 2) {
      if (poly[i] < xmin) xmin = poly[i];
      if (poly[i] > xmax) xmax = poly[i];
      if (poly[i+1] < ymin) ymin = poly[i+1];
      if (poly[i+1] > ymax) ymax = poly[i+1];
    }
  }
}

function cree_caract() {
  var largeur, hauteur;
  hauteur = 53;
  largeur = 32;
  glyphes.z0 = creerGlyph("0", largeur, hauteur);
  glyphes.z1 = creerGlyph("1", largeur, hauteur);
  glyphes.z2 = creerGlyph("2", largeur, hauteur);
  glyphes.z3 = creerGlyph("3", largeur, hauteur);
  glyphes.z4 = creerGlyph("4", largeur, hauteur);
  glyphes.z5 = creerGlyph("5", largeur, hauteur);
  glyphes.z6 = creerGlyph("6", largeur, hauteur);
  glyphes.z7 = creerGlyph("7", largeur, hauteur);
  glyphes.z8 = creerGlyph("8", largeur, hauteur);
  glyphes.z9 = creerGlyph("9", largeur, hauteur);
  hauteur = 40;
  glyphes.zDIM = creerGlyph("DIM", 144, hauteur);
  glyphes.zLUN = creerGlyph("LUN", 156, hauteur);
  glyphes.zMAR = creerGlyph("MAR", 176, hauteur);
  glyphes.zMER = creerGlyph("MER", 176, hauteur);
  glyphes.zJEU = creerGlyph("JEU", 148, hauteur);
  glyphes.zVEN = creerGlyph("VEN", 164, hauteur);
  glyphes.zSAM = creerGlyph("SAM", 172, hauteur);
  z2points = creerGlyph(":", 10, 30);
  hauteur = 40;
  largeur = 70;
  zBTon = creerGlyph("BTon", largeur, hauteur);
  zBTof = creerGlyph("BTof", largeur, hauteur);
  zAPPS = creerGlyph("APPS", largeur, hauteur);
  zSYNC = creerGlyph("SYNC", largeur, hauteur);
  zGPS = creerGlyph("GPS", largeur, hauteur);
}

function transformer(poly, xmin, ymin, sx, sy) {
  var p = new Int16Array(poly.length);
  for (var i = 0; i < poly.length; i += 2) {
    p[i]   = Math.round((poly[i]   - xmin) * sx);
    p[i+1] = Math.round((poly[i+1] - ymin) * sy);
  }
  return p;
}

function horloge() {
  if (recalage_temps == true) {
    recalage_temps = false;
    cor_int = Math.round(vit * 1000 * (1000 / (60 * 24))) / 1000;
    changeInterval(interval_boucle, 60000 - cor_int);
  }
  cum_cor = cum_cor + cor_int / 1000;
  if (min != 59) {
    min = min + 1;
  } else {
    min = 0;
    if (heu != 23) {
      heu = heu + 1;
    } else {
      heu = 0;
      if (jour != 6) {
        jour = jour + 1;
      } else {
        jour = 0;
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
      aff_jou();
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

function aff_ponct() {
  if (mode == 'montre') {
    g.setColor(1,1,0);
    g.drawImage(z2points, 84, 22);
    g.fillPoly([91,110,100,110,82,163,75,163]);
  }
}

function aff_unimin() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    g.fillRect(144, 0, 175, 52);
    g.setColor(1,1,0);
    g.drawImage(glyphes[unimin],144,0);
  }
}

function aff_dizmin() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    g.fillRect(104, 0, 135, 52);
    g.setColor(1,1,0);
    g.drawImage(glyphes[dizmin],104,0);
  }
}

function aff_BLE() {
  if (BLE == 'BT on') {
    g.setColor(0,1,0);
    g.fillRect(0, 0, 82, 51);
    g.setBgColor(0,1,0);
    g.setColor(1,1,0);
    g.drawImage(zBTon, 6, 6);
  } else if (BLE == 'BT off') {
    g.setColor(1,0,0);
    g.fillRect(0, 0, 82, 51);
    g.setBgColor(1,0,0);
    g.setColor(1,1,0);
    g.drawImage(zBTof, 6, 6);
  }
}

function aff_heu() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    g.fillRect(0, 0, 71, 52);
    g.setColor(1,1,0);
    g.drawImage(glyphes[dizheu],0,0);
    g.drawImage(glyphes[uniheu],40,0);
  }
}

function aff_jou() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    g.fillRect(0, 62, 175, 101);
    g.setColor(1,1,0);
    if (jour == 0) {
      glyjou = 'zDIM';
      tab = 16;
    } else if (jour == 1) {
      glyjou = 'zLUN';
      tab = 10;
    } else if (jour == 2) {
      glyjou = 'zMAR';
      tab = 0;
    } else if (jour == 3) {
      glyjou = 'zMER';
      tab = 0;
    } else if (jour == 4) {
      glyjou = 'zJEU';
      tab = 14;
    } else if (jour == 5) {
      glyjou = 'zVEN';
      tab = 6;
    } else if (jour == 6) {
      glyjou = 'zSAM';
      tab = 2;
    }
    xgly = tab;
    g.drawImage(glyphes[glyjou], xgly, 62);
  }
}

function aff_lanceur() {
  g.setColor(0,0,1);
  g.fillRect(0, 62, 82, 113);
  g.setBgColor(0,0,1);
  g.setColor(1,1,0);
  g.drawImage(zAPPS, 6, 68);
}

function aff_GPS() {
  if (gps == false) {
    clearInterval(interval_cligno);
    g.setColor(1,0,0);
    g.fillRect(0, 124, 82, 175);
    g.setBgColor(1,0,0);
    g.setColor(1,1,0);
    g.drawImage(zSYNC, 6, 130);
  } else if (gps == true) {
    interval_cligno = setInterval(cligno, 500);
  }
}

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

function cligno() {
  if (flash == false) {
    flash = true;
    g.setColor(0,1,0);
    g.fillRect(0, 124, 82, 175);
    g.setBgColor(0,1,0);
    g.setColor(1,1,0);
    g.drawImage(zSYNC, 6, 130);
  } else if (flash == true) {
    flash = false;
    g.setColor(1,1,0);
    g.fillRect(0, 124, 82, 175);
    g.setBgColor(1,1,0);
    g.setColor(0,1,0);
    g.drawImage(zGPS, 4, 130);
  }
}

function MAJ_heu() {
  dizheu = 'z' + String(String(Math.floor(heu / 10)));
  uniheu = 'z' + String(String(heu).slice(-1));
  aff_heu();
}

function aff_dat() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    g.fillRect(0, 110, 71,  162);
    g.setColor(1,1,0);
    g.drawImage(glyphes[dizdat], 0, 110);
    g.drawImage(glyphes[unidat],40, 110);
  }
}

function plus() {
  g.setColor(1,1,0);
  g.fillRect(94, 0, 175, 47);
  g.setColor(0,0,0);
  g.fillRect(121, 19, 148, 28);
  g.fillRect(130, 10, 139, 37);
}

function date() {
  dizdat = 'z' + String(String(Math.floor(dat / 10)));
  unidat = 'z' + String(String(dat).slice(-1));
  aff_dat();
}

function aff_moi() {
  if (mode == 'montre') {
    g.setColor(0,0,0);
    g.fillRect(104, 110, 175,  162);
    g.setColor(1,1,0);
    g.drawImage(glyphes[dizmoi], 104, 110);
    g.drawImage(glyphes[unimoi], 144, 110);
  }
}

function moins() {
  g.setColor(1,1,0);
  g.fillRect(94, 128, 175, 175);
  g.setColor(0,0,0);
  g.fillRect(121, 147, 148, 156);
}

function mois() {
  dizmoi = 'z' + String(String(Math.floor((moi + 1) / 10)));
  unimoi = 'z' + String(String(moi + 1).slice(-1));
  aff_moi();
}

function chargement() {
  var charge = E.getBattery();
  charge = Math.round((charge / 100) * 176);
  if (mode == 'montre') {
    g.setColor(0,0,0);
    g.fillRect(0, 171 , 175, 175);
    if (chargeur == true) {
      g.setColor(1,0,0);
    } else {
      g.setColor(1,1,0);
    }
    g.fillRect(-2, 171, charge-1, 175);
  }
}

function aff_vit() {
  g.setColor(0,0,0);
  g.fillRect(94, 79, 175, 127);
  g.setColor(1,1,0);
  g.setBgColor(0,0,0);
  g.setFont("Vector",43);g.setFontAlign(0,-1);
  g.drawString(vit,136,83,true);
  recalage_temps = true;
}

function bluetooth() {
  if (BLE == 'BT off') {
    BLE = 'BT on';
    try { NRF.wake(); } catch (e) { }
    Bluetooth.setConsole(1);
  } else if (BLE == 'BT on') {
    BLE = 'BT off';
    try { NRF.sleep(); } catch (e) { }
    Bluetooth.setConsole(0);
  }
  aff_BLE();
}

function lanceur() {
  clearInterval();
  Bangle.removeAllListeners('touch');
  Bangle.setGPSPower(false, "cadran");
  Bangle.removeListener('GPS', gps_listener);
  Bangle.showLauncher();
}

function avance() {
  vit = Math.round((vit + 0.1) * 10) / 10;
  if (vit > 9.9) {
    vit = 9.9;
  }
  aff_vit();
}

function recule() {
  vit = Math.round((vit - 0.1) * 10) / 10;
  if (vit < -9.9) {
    vit = -9.9;
  }
  aff_vit();
}

function GPS() {
  if (gps == false) {
    gps = true;
    aff_GPS();
    Bangle.setGPSPower(true, "cadran");
    gps_listener = Bangle.on('GPS', function(fix) {
      if (fix.time) {
        setTime(fix.time.getTime() / 1000);
        fix_reussi();
      }
    });
  } else {
    coupure_GPS();
    aff_GPS();
  }
}

function coupure_GPS() {
  Bangle.removeListener('GPS', gps_listener);
  Bangle.setGPSPower(false, "cadran");
  gps = false;
}

function fix_reussi() {
  coupure_GPS();
  clearInterval(interval_cligno);
  clearInterval(interval_boucle);
  mode = 'montre';
  Bangle.removeAllListeners('touch');
  g.setBgColor(0,0,0);
  g.clear();
  initialisation();
}

Bangle.removeAllListeners('lock');
clearWatch();
Bangle.setOptions({btnLoadTimeout: 1500});
E.on('kill', function() {
  d = new Date();
  setTime((d.getTime() / 1000) + cum_cor);
});
g.setBgColor(1,1,0);
g.clear();
g.setColor(0,0,0);
g.setFont("Vector",35);g.setFontAlign(0,-1);
g.drawString('Cadran',90,10,true);
g.drawString('par',90,60,true);
g.drawString('Jeff Nash',90,110,true);
g.setFont("Vector",20);g.setFontAlign(0,1);
g.drawString('2026',90,170,true);
Bangle.on('lock', function(on, reason) {
  if (!on && reason == "button") {
    Bangle.setLCDBrightness(1);
  }
});
nettoyage();
vit = parseFloat(require("Storage").read("vit"));
if (isNaN(vit)) vit = 0;
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