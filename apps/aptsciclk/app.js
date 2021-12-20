const big = g.getWidth()>200;
const timeFontSize = big?5:4;
const dateFontSize = big?3:2;
const gmtFontSize = 2;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = xyCenter*0.73;
const yposDate = xyCenter*1.44;
const yposYear = xyCenter*1.8;

const buttonTolerance = 20;
const buttonX = 88;
const buttonY = 104;

function getImg(img){
  if (img == "w0"){//drink
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOZFIQOD4EABwnwgEDBwf8g/4h4ODwYQBv4OC+AbDAIP+j/HAQIOC4Hwj4RBBwP8o8B/+PBwWOkEP/l/BwP4+JCB44OCj+Ih/+n4OB+PEoP38YOB/0YkUXGgIOB8cBi9f+IOCkEI+XvBwXigFG64OEg0/t4OEuP7BwkHx/PBwWigF8voOC+Uwg/ig4OCkMgv8QsIOB+cfSoOGLIUR/E/4ljBwPxx/B/0kO4UI/0P+J3C/HHVQOISoWEn+D/iPBBwIwC8IOCwcP84IBBwU4TAMHBwfAv+AcARBBgD3CBwX8gDnBBwfwewIODAgIABBwYHDB3oAEBwIHFByyDBABg"))
}
  }
  else if (img == "w1"){//cube
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOI/3/+fvBwYEBnwO/By3APgN/O6IeBh4OF8AOcwADCBwX8g4dM/8fBwt774OE+/9Bwt/BxodH3oOcFgyVG8BhCBwX8hRwCBwXA0C6BBwc/w4OE41MBwtEo6VF84sE/1/54OLDo4sHHYxKHLIxoGO44AD/kAABo"))
    }
  }
  else if (img == "w2"){//acid
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOF+IOGngOF8/D8YGD/wdBB4nv4fzAwf4BwOfGQd/4f7/+//+f74OB4PwHIJKDx8P/4BBBwP8BwIBBBwXvh+Hw5ZD+Pwnl/NAcegJOBBwfgj0fBwvhBxcPgYEBBwXw/F+FghIB84OC/BfBOYQOBk/w/0f4f4nkGgFgh0hwED4H4jOBuF8hk/v/Hzlnx/zFgQZBGYLCD4EHaIn8gAOF8EDBwn+dgQOK/8AN4IOD+EABww0BBwqGEBwIWBBwk8CwIODg/gv4OEv4OD+4OBBAIOBRYIFBh+PcAQdC+gOCDoN+h/vBwPP/wOB/wOBwJCBBwP2oa3BLALgBiA7BOwIvB/+DQoV/d4hPBBwQsB/wJB8ZoEAAZoDAAQOPRQIAM"))
    }
  }
  else if (img == "w3"){//turret
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOi+IOGh4OF8AOF/UNBwthx4OE+0YBwtBh4OE6mQBwn7rEfBwl22IOE99gBwn99UzBwUc/+90YsC8HH+++n98n/+g0++2Z+4OB4Fz73T74OCg877d8/YdC+d7u/v3gsBjEvt/+O4X+gvtIgI7CwG934OD8E326kD/0A+yzEwEO74OD/EArYOEgEDv4OD+PAl4OEnkBaInz0EPBwk3iAdE+XwSIYDBj2Oj4OD/fYvIOEvdHz4OD99unIOD/vt44OE3u4Dou3h4OE+3x/IOE70/Bwn78/9Bwl4LAQ7Dx75DBwP4Awb+EBwgAEBz0AABo="))
    }
  }
  else if (img == "w4"){//cake
    return {
  width : 60, height : 60, bpp : 1,
  buffer : require("heatshrink").decompress(atob("AB0//4AE4YGF/gOY/oOG94OF/1/Bwv3FgwKCBwfnFhn8HY0LAQPwvgOB8EP/5uBBwP2gF4j+PBwP+sEEj/x44OB90Ao/8Dodwg8/nkH4ZXBgHnx8ABwPv/k98+ABwZEB+EAJQPj/3+nkAv4OB5+fz0Aj4OB98Ag+Ah/nBwJXB4EDHYSTB/EA/wsCSoJfBwAODNIPgBwgcBHYQOCC4QODn8Ah4ODGgMH+47D8EB/A7KTYMf4A7Eg/wHYgcBHZx3DcAPggbRBFgQcBcAQOB/iUBBwgcBBwgcCd4V/HYL+D/YOBDgIOC8/+DgIOC/+HfwIOD/4cCBwYAEBwQADBz0AABoA="))
    }
  }
  else if (img == "butPress"){
    return {
  width : 176, height : 176, bpp : 4,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("iIA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AFEVqsFqpD/ACVVAAJXBqtRI35WSK4ZY/AB8VK49VJP5WRK4pY/ABhQEK41RJn5X/AEMVK5dVJv6uPK46w/K/4AgipPFgEALAxP/K5tQAQhX/K6KsDWApP/AA6uHWA9RIWPd6ICPK46qFAohXxjvd7oCMCAJX/K7cAAAZXFBQkBK/6v/ABPd6ICPK/4AaKIlQAhCv2ACMVVRC0FK2MdAIRXXVYSuFK/5XOqsAgCuFK/4AJJwtVKw1RK+MR7vRK/4AripXMJv6wQK4qu/K/4AjipXKJf5YRK4hJ/ABxXHqJI/LCRXCK34ASipXCIf4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ACI="))
    }
  }
  else if (img == "butUnpress"){
    return {
  width : 176, height : 176, bpp : 4,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("iIA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AFEc5kM5hD/ACXMAAJXB5nBI35WSK4ZY/AB8cK4/MJP5WRK4pY/ABhQEK43BJn5X/AEMcK5fMJv6uPK46w/K/4AgjhPFgEALAxP/K5vAAQhX/K6KsDWApP/AA6uHWA/BIWOIwICPK46qFAohXxjGIxACMCAJX/K7cAAAZXFBQkBK/6v/ABOIwICPK/4AaKInAAhCv2ACMcVRC0FK2MYAIRXXVYSuFK/5XO5kAgCuFK/4AJJwvMKw3BK+MRxGBK/4ArjhXMJv6wQK4qu/K/4AjjhXKJf5YRK4hJ/ABxXH4JI/LCRXCK34ASjhXCIf4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ACI="))
    }
  }

  else if (img == "apetureLaboratories"){
    return {
  width : 173, height : 43, bpp : 4,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AA+IAAeAIv5UTK34APhABBKwpeBJX5VLJgJWGAwKv/ABL8EKomABIYA/KpJWHAoRW/KpZQCfwJSCAgRW/KphWFBgZW/KphNCAgSxEKP4ADJAatFKwWAL4oA/KpALGXQhS/Ko4MIwAOMAHREOKv5ZVVgcAh///4LDAwQAB+AIHCQYHMDQQYBDwQEGDIoaGTx4MCwAiCJgYhFBIYIHLw4HFBARjGESJUDehZVFVhJNLRI5VGDIIdEAgwiL+DzDJAJVJB4IMBCoKsHAYpFCDgr2IApYEIBpJFCKpqsCHgQbFIhBVHBhJoGTwyBRKp5mBDoY6GKoYqEXYg7JApKeHQJysEKpRmBDoasHQBAACM4qMGEAr0JAgZjGFYhVPgGAEIpVEAAaAEA4oyEW4qyKFZBoFKoisDJIJWLfIp3IQBJeJfgysMERpVCwEIVpijFBA6ZJdA4JHJYgEKQIx1EVgRVBVhj5IEIyZHHYoUGNw4MCQIwIKAARVDxBVRQo6ZJHZZoGU4yBGBAiBGVgRZBVhYlIfJBoFHZZoHfJRwGBAQrEVISvCKpwrEUZAqFVhzYKB4yKGQIpVDAYJVKEoYFDBIpVIb4ysMIgoPHOgoRFhGAVwKsLAFzQHACBVCVhQA/KpawBCJa76IhRWDVxIODAwTaFAocP///dhALGBQYJBCIYQBDYgKEBBAEDVgeIAgKgFBYZVEEYY+CH4YDBBgYFBBYoFEOYhmEDYgFFLIwEDKw2AKwhTFBoSsHIgglFAQo/HKIoDECBBZGc46eEAYa2EKox2Ga5LjLDoq8FKAgVDBAv/EghWGVgRWJKoaOFD4IgCViAWFVjKTGJIZOFKpKOHAQj3JAogCFPApcGKQziGLopKCU4hWFKojsEHYrXFCAJFId45CEDYh4EB4Y1DCYSzFJQT+FgAGCKooA/AAZMBfopWDKv5WLVgxT/AB+AKopW/ACBU/ABwA=="))
    }
  }

  else if (img == "apetureWatch"){
   return {
  width : 176, height : 176, bpp : 4,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("kQA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A+/4A/AH4A/AH4A/AD0SkQASkIVViIrqK/5X/K/5X/CqPd6EAAA8BiAKIABUBiIVUFZMIxBX/K/5X/K/5X/K/5X/K/5X/K/5X/K/5Xal////yK/5XTKwIABK4URAA3/+Pd6ILHAG8YxADBj5XD+ISIBwRX/K4pWDAAIHBiS6CAAMvBYXd6DbTeJcRCqgrJhGIJIJXFkUhK4oLDK/5XSBYhX/K6MvBIQDBK/5XD+RXMBAQQCK/5XDKAJXKVwRWBAoJX/K4j3CUohXDL4YACK/5XF+SuEK4yuCK/5XHWAZOCK4cvKwhX/K45MFK4YAGK/5XGLApX/K6X/K5svK/5XIWAZXJ/5X/K6svK/5XPAoauDK/5XJ/5XDj5eEVwRX/K5y2FVwRX/K4/yK44GDVwRX/K50fWAi9DK/5XGUYRQCkMSK4auDK/5XGJgZXGMQJWDK/5XGKQKkCK4arEK/5XIVQRQDK/5XQKwIABJYXyK4IGDAAReBK/5XDVwSwFK44QBK/5XJLAhXBAoa/Cl5X/K4ZHCAAZXEAoZnCK/5XLVQRXFBgZX/K4igCLAnxK4RdBBohX/K5cikJXCAAxX/K4j5EK/5X/K9fyK/5X/K93/K/5X/KxQABK78vK4PyK/5XWWApXq+JXC+BXeKwRXPl5Xdh//K4Y1BK+H/K7n//GIK4g5BWR5XP+RXNl5Xch+IGQJXFA4JXeJwpXICAJXah/4x4fBKwURj5XBBIJXcVwpXBFoYwDK4XRBYwAR/CtFAAZXCBQ4AQjBXCCRxXcUoJLDjnMhnMBgTqCK7RzIiS3FkRXC6DbTAAf4UYIoB5gABK4PM4KBD+AcLFZUIK4JNGkUhK44ABK7EPQwZWCK4ZYCWARXY+RXrVwccK4/MWB5XMJhBXkVwJWEK4pYBK/4AGh+IVwJQEK43BWARX/VwmP+JXNWBpX5VwMcK5fMiKwBK9YAKCphXCJ4pXH4JXB+QrWCtUvxHxK58R///K/5XCx/xjhPFdAJYGK/5XN4ACEK/4AIIYMRK4qsDWAsRj//+RX/iIACVw6wH4ITCEJBXlxGCARxXIVQoFEK+MoxGIARgQBK/5XbgAADK4oKEgJX/V/4AJxGCARxX/Cq5XI4AEIV+wVO///iMcVRC0FiMf//yTNIADlABCCp0v//xK4qrCVwpXB/+PeNRXf5kAgCuFK/5XIiJOF5hWG4MR/BXvkWIwQVQ///K58f/HyK94VSK4UcK5kRj+IK8I1BADhXE+KwGK4vBiP4x5XhEJQASl4DDWARXMj/4NwZX/WAkcK5UR/+IGgbeXK9awBLAhXEiKuBx40DHCYuEK9EvWAURK4/BVwSWEK/6wGLAZXCKwKuGK/6wIiMcK4QFBVw5X/WA2IwJSCAAYJBVwpX/WA2IJwJVDj///GPVwpX/A434K4PxVoYHBKwxX/AAynCK4ZWCGA5X/BI//V4itHK/4LKK4YtKK/4qJK4QOKK/5X/K8BYCBpZX/K/5XVfYQAWK6gedK/5XiBhchiINLK6grJK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5Xu/4AYV/4AXK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K6v/ADCv/ABMhiKv/K/5X/K/5X/K/5X/K/5X6/4AdiIAYFzw="))
    }
  }
}


function drawStart(){
  g.clear();
  g.reset();
  apSciLab = getImg("apetureLaboratories");
  g.drawImage(apSciLab, xyCenter-apSciLab.width/2, xyCenter-apSciLab.height/2);
}

drawStart();

// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

// timeout used to update every minute
var drawTimeout;

//warnings
var curWarning = -1;
var maxWarning = 4;

function buttonPressed(){
  if (curWarning < maxWarning) curWarning += 1;
  else curWarning = 0;
  buttonImg = getImg("butPress");
  g.drawImage(buttonImg, 0, 0);

  warningImg = getImg("w"+String(curWarning));
  g.drawImage(warningImg, 1, g.getWidth()-61);

  setTimeout(buttonUnpressed, 500);
}
function buttonUnpressed(){
  buttonImg = getImg("butUnpress");
  g.drawImage(buttonImg, 0, 0);
}

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function draw() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");

  g.reset(); // default draw styles

  //draw watchface
  apSciWatch = getImg("apetureWatch");
  g.drawImage(apSciWatch, xyCenter-apSciWatch.width/2, xyCenter-apSciWatch.height/2);

  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0],
    minutes = time[1];
  var meridian = "";
  if (is12Hour) {
    hours = parseInt(hours,10);
    meridian = "AM";
    if (hours == 0) {
      hours = 12;
      meridian = "AM";
    } else if (hours >= 12) {
      meridian = "PM";
      if (hours>12) hours -= 12;
    }
    hours = (" "+hours).substr(-2);
  }

  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}`, xyCenter, yposTime, false);
  g.setFont(font, gmtFontSize);
  g.drawString(meridian, xyCenter + 102, yposTime + 10, true);

  // draw Day, name of month, Date
  var date = [da[0], da[1], da[2]].join(" ");
  g.setFont(font, dateFontSize);

  g.drawString(String(da[0]), xyCenter*1.55, yposDate, true);
  g.drawString(String(da[1]), xyCenter*1.55, yposDate+20*1, true);
  g.drawString(String(da[2]), xyCenter*1.55, yposDate+20*2, true);


  // draw year
  g.setFont(font, dateFontSize);
  g.drawString(d.getFullYear(), xyCenter+1, yposYear, true);

  queueDraw();
}


// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.on('touch',(n,e)=>{
  //button is 88 104
  if (buttonX-buttonTolerance < e.x && e.x < buttonX+buttonTolerance && buttonY-buttonTolerance < e.y && e.y < buttonY+buttonTolerance){
  buttonPressed();
  }
});

// clean app screen
g.clear();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();

buttonPressed();//update warning image

// draw now
draw();
