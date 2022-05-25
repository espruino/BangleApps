var is12;
function getHours(d) {
  var h = d.getHours();
  if (is12===undefined) is12 = (require('Storage').readJSON('setting.json',1)||{})["12hour"];
  if (!is12) return h;
  return (h%12==0) ? 12 : h%12;
}

exports.drawClock = function(fontIndex) {
  var digits = [];
  fontFile=require("Storage").read("contourclock-"+Math.abs(parseInt(fontIndex+0.5))+".json");
  if (fontFile==undefined) return(false); //exit if font file not found
  var font = JSON.parse(fontFile);
  for (var n in font.characters) {
    digits.push({width: parseInt(font.characters[n].width),
      height: font.size,
      bpp: 2,
      transparent: 1,
      buffer:E.toArrayBuffer(atob(font.characters[n].buffer))});
    }
    if (n!=10) return (false); //font file seems to be invalid
    var x=0;
    var y = g.getHeight()/2-digits[0].height/2;
    var date = new Date();
    g.clearRect(0,38,g.getWidth()-1,138);
    d1=parseInt(getHours(date)/10);
    d2=parseInt(getHours(date)%10);
    d3=10;
    d4=parseInt(date.getMinutes()/10);
    d5=parseInt(date.getMinutes()%10);
    w1=digits[d1].width;
    w2=digits[d2].width;
    w3=digits[d3].width;
    w4=digits[d4].width;
    w5=digits[d5].width;
    squeeze=(g.getWidth()-w5)/(w1+w2+w3+w4);
    if (fontIndex<0) {
      fg=g.theme.fg;
      bg=g.theme.bg;
      g.setColor(bg);
      g.setBgColor(fg);
    }
    g.drawImage(digits[d1],x,y);
    x+=parseInt(w1*squeeze);
    g.drawImage(digits[d2],x,y);
    x+=parseInt(w2*squeeze);
    g.drawImage(digits[d3],x,y);
    x+=parseInt(w3*squeeze);
    g.drawImage(digits[d4],x,y);
    x+=parseInt(w4*squeeze);
    g.drawImage(digits[d5],x,y);
    if (fontIndex<0) {
      g.setColor(fg);
      g.setBgColor(bg);
    }
    return font.name;
  }
