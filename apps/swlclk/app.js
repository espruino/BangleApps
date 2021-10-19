require("Font7x11Numeric7Seg").add(Graphics);
var locale = require("locale");
const xyCenter = g.getWidth()/2;

function drawTime(){
  let d = new Date();
  var da = d.toString().split(" ");
  let date = locale.dow(d,1)+" "+locale.date(d,1);
  var time = da[4].split(":");
  var hours = time[0],
    minutes = time[1],
    seconds = time[2];

  function getUTCTime(d) {
    return d.toUTCString().split(' ')[4].split(':').map(function(d){return Number(d);});
  }
  var utc  = getUTCTime(d);
  var beats = Math.floor((((utc[0] + 1) % 24) + utc[1] / 60 + utc[2] / 3600) * 1000 / 24);

  g.reset().setFont("Vector",10).setFontAlign(0,0);
  g.setColor("#ffffff");
  switch (utc[0]) {
    case 0:
      g.clearRect(0,25,240,80);
      g.drawString("00h00-00h30 Radio Havane Cuba\n15730\n00h00-01h00 Radio for Peace Int.\n9395\n00h30-01h00 Radio Havane Cuba\n5040",xyCenter,30);
      break;
    case 1:
      g.clearRect(0,25,240,80);
      g.drawString("01h00-02h00 Radio Roumanie Int.\n6040 7375\n01h00-01h30 R. Argentine vers le monde\n9395",xyCenter,30);
      break;
    case 2:
      g.clearRect(0,25,240,80);
      g.drawString("02h30-03h00 R. Argentine vers le monde\n5800",xyCenter,30);
      break;
    case 4:
      g.clearRect(0,25,240,80);
      g.drawString("04h00-05h00 R.F.I.\n9790 11700\n04h00-05h00 Voix de la Corée\n13650 15105\n04h30-05h00 A.W.R.\n6155",xyCenter,30);
      break;
    case 5:
      g.clearRect(0,25,240,80);
      g.drawString("05h00-05h30 Radio Roumanie Int.\n6015 15340 17520\n05h00-06h00 Radio Ndarason Int.\n5960\n05h30-06h00 Radio Japon\n11730 13840\n",xyCenter,30);
      break;
    case 6:
      g.clearRect(0,25,240,80);
      g.drawString("06h00-06h30 B.B.C.\n5875 9440 11620\n06h00-06h30 Voix de l'Amérique\n4960 6180 9885 13830\n06h30-06h45 Vatican News\n11935",xyCenter,30);
      break;
    case 7:
      g.clearRect(0,25,240,80);
      g.drawString("07h00-07h30 B.B.C.\n9440 13810?\n07h00-08h00 Radio Chine Int.\n17865\n07h00-08h00 R.F.I.\n11700 13695 15300 17850 21580?",xyCenter,30);
      break;
    case 8:
      g.clearRect(0,25,240,80);
      g.drawString("08h00-08h30 A.W.R.\n15145\n08h00-09h00 W.B.C.Q.\n9330\n08h30-09h00 Voix de l'Amérique\n9410 13830 17530",xyCenter,30);
      break;
    case 9:
      g.clearRect(0,25,240,80);
      g.drawString("09h00-10h00 R. Argentine vers le monde\n5950\n09h00-10h00 R.F.I.\n13695 15300 15320",xyCenter,30);
      break;
    case 10:
      g.clearRect(0,25,240,80);
      g.drawString("10h00-10h30 Voix du Nigéria\n11770\n10h00-11h00 Radio MiAmigo\n6085",xyCenter,30);
      break;
    case 11:
      g.clearRect(0,25,240,80);
      g.drawString("11h00-12h00 Voix de la Corée\n11710 11735 13650 15180\n11h30-12h00 Radio Slovaquie Int.\n6005",xyCenter,30);
      break;
    case 12:
      g.clearRect(0,25,240,80);
      g.drawString("12h00-12h30 Voix du Vietnam\n7285\n12h00-13h00 Radio MiAmigo\n6085",xyCenter,30);
      break;
    case 13:
      g.clearRect(0,25,240,80);
      g.drawString("13h00-14h00 Radio for Peace Int.\n15770\n13h30-14h00 Radio Slovaquie Int.\n6005",xyCenter,30);
      break;
    case 14:
      g.clearRect(0,25,240,80);
      g.drawString("14h00-16h00 Radio saoudienne Int.\n17660\n14h00-16h00 Radio Chine Int.\n11920 13670\n14h55-15h25 T.W.R. Swaziland\n9585",xyCenter,30);
      break;
    case 15:
      g.clearRect(0,25,240,80);
      g.drawString("15h00-15h30 Radio Tirana\n3985\n15h00-15h30 Radio Nationale Lao\n6130 567",xyCenter,30);
      break;
    case 16:
      g.clearRect(0,25,240,80);
      g.drawString("16h00-16h15 Vatican News\n11950\n16h30-17h15 Voix de l'Afrique\n9505",xyCenter,30);
      break;
    case 17:
      g.clearRect(0,25,240,80);
      g.drawString("17h00-18h00 R.F.I.\n13740 13770 17850\n17h30-18h25 Voix de la Turquie\n7360",xyCenter,30);
      break;
    case 18:
      g.clearRect(0,25,240,80);
      g.drawString("18h00-18h11 Radio Algérie Int.\n13820\n18h30-19h00 Radio Slovaquie Int.\n3985",xyCenter,30);
      break;
    case 19:
      g.clearRect(0,25,240,80);
      g.drawString("19h00-19h30 Radio Taiwan Int.\n6005\n19h23-20h23 Voix de la République\nIslamique d'Iran\n7235",xyCenter,30);
      break;
    case 20:
      g.clearRect(0,25,240,80);
      g.drawString("20h00-21h15 Radio Le Caire\n9810\n20h00-21h00 Voix de l'Indonésie\n3325 4750\n20h30-20h50 Radio Belarus\n3985",xyCenter,30);
      break;
    case 21:
      g.clearRect(0,25,240,80);
      g.drawString("21h00-21h30 Voix de l'Amérique\n5970 9490 9740 11900\n21h00-22h00 Radio for Peace Int.\n6070",xyCenter,30);
      break;
    case 22:
      g.clearRect(0,25,240,80);
      g.drawString("22h00-22h15 T.W.R. Bénin\n1566\n22h30-23h00 Radio Extérieure d'Espagne\n9690 11670 11940",xyCenter,30);
      break;
    case 23:
      g.clearRect(0,25,240,80);
      g.drawString("23h23-00h23 Voix de la République\nIslamique d'Iran\n7230\n23h30-00h00 R. Argentine vers le monde\n7780",xyCenter,30);
      break;
    default:
      g.clearRect(0,25,240,80);
      g.drawString("17h00-18h00 R.F.I.\n13740 15300 17850\n17h00-18h00 R.F.I.\n7205 9790",xyCenter,30);
      break;
  }

  // Local time
  g.setFont("6x8",1).setColor("#cccccc");
  g.drawString("Loc",10,85);

  g.setFont("7x11Numeric7Seg",4).setColor("#ffffff");
  g.drawString(`${hours}:${minutes}:${seconds}`, xyCenter, 115, true);

  // UTC time
  g.setFont("6x8",1).setColor("#cccccc");
  g.drawString("UTC",10,155);

  g.setFont("7x11Numeric7Seg",4).setColor("#ff0000");
  g.drawString(utc[0]+`:${minutes}:${seconds}`, xyCenter, 185,true);

  // footer date
  g.setFont("Vector",20);
  g.setColor("#ffffff");
  g.clearRect(180,220,240,240);
  g.drawString(date+" @"+beats,xyCenter,230);
}

function setGpsTime(){
  print("set GPS time");
  Bangle.setGPSPower(1);
  Bangle.on('GPS',function(fix) {
    if (fix.fix) {
    var curTime = fix.time.getTime()/1000;
    setTime(curTime);
        Bangle.setGPSPower(0);
        Bangle.buzz(100, 1);
        start();
      } else {
          stop();
          g.reset().setFont("Vector",10).setFontAlign(0,0);
          g.setColor("#cccccc");
          g.clearRect(0,25,240,80);
          g.drawString("Mise à l'heure\npar satellites\nen cours...",xyCenter,40);
      }
  });
}

function setButtons(){
  // Show launcher when button pressed
  Bangle.setUI("clockupdown", btn=>{
    if (btn!=-1) return;
    // if up pressed, turn GPS on and wait for new time
    setGpsTime();
    Bangle.beep(500, 4000);
  });
}

var intervalRef = null;
function start(){
  g.reset();
  g.clear();
  Bangle.drawWidgets();
  intervalRef = setInterval(drawTime, 1000);
  drawTime();
}

function stop(){
  clearInterval(intervalRef);
}

// ANCS Widget
var SCREENACCESS = {
  withApp:true,
  request:function(){
    this.withApp=false;
    stop();
    clearWatch();
  },
  release:function(){
    this.withApp=true;
    start();
    setButtons();
  }
};

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) {
    start();
  } else {
      stop();
  }
});

// clean app screen
Bangle.loadWidgets();
start();
setButtons();
