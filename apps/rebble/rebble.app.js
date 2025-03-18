Graphics.prototype.setFontKdamThmor = function(scale) {
  // Actual height 70 (69 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AH4AMgfABZM/BZMB/4WJg/+BZMf/ALJ//gIpP/wAugLpUAvyBKsDC/ACKYJQIKYJgaYKv6YJh7HJeoP8VxLSJg//+D0JIhMf/7RIf4JPJv//LX5a6CwLvJn5aJLYIKJgY4IADn/KpKvBAAKvIAARiGBQanGOwILJBQgLFFogvGIgZHGWAIAEdwg5FNYreBAAjvDeoIAFYQcfBYy3DEQRKEKQQiCAoRiCIogoDCIJGDEQLlEIwZoBCwYLCHQQoBQwgGEj7aFGoKuDKwYSFE4LZFv41Ch6dEIITICn5FEDwQuDeAwuEBQgeEB4b8EFwbADNIZdaHQoSBFwUfNIoGEv5GFXYpGEIoJBCZgjZGHQILDCwIpDj//GgQoBMggcBAApkDBQwiDDoQAEEQY0BERJGBERBGCERC8BBYrYFBQj8FLwrBGBQbkFEYoKFBYgtFL4jLFZ4gKJAH4AciALKRA73DbIgAFj/ABZLOGEQjDEj40En6tEv4oDgLPEAoLRFCIcHDgouJDgP4FxAiFFwt//xXEFwcDEQouEj4iEFwv/EQguEEQJ6EFwgiBS4guE/5uEFwiiBAAyiDBQwdDCw4uCIoIAGFwSLBF34unAAy7EAAy7EAAzqEAArqEF34ukAH4AGgfgNJWAAod8Cwn+SQn4RggFEv4oE/4FDg//FAYFFn4oEAoidBFAYFFh//YIYFBFwd//7BDAoIuCgf/YIYFBFwcfFAgFFDgIoDDgIFCEQpcBFwZFFn4uEAoJcEFwYFBLgouDQoo/BAwcf/hcEFwgiELgPfFwQRBEQYVBFwcPDYYzB+YSDn55DKwOPFwgbCKwP8CQYuBXIouEKIZcBIIgbF/BBEDYZcB4ASFDYI5BCgIuEHQSzCFwo6CeYQuEv4nBOYIPBFwa7Ddoa7FJoLtCFwhNBAAQfBFwiTBAAXAT4oKDCYSfFAAQ9BFwg6BAAQHBFwhDCLgQuFIwY5BFwhGDDwT9FOQI5CFwpSDDoYuDBYQWCFwoLCAgQuFCIsHFwgAFh4uEAH4AWjgLKvwGFj6LDP4sBcgjhCCwaGDn4LEgKjDAgKXEh61Dg7LEdQIuDj7AEZgIpDfYPACIgdCFwLjDdIQRCFwIoDEQJdEFAgiBJgYoEEQoLCAoRFFBYRjCFAIWDQII0Dv6SFv40CRYg1DHQRXBBQg1BFISpDBwQSEEQTQDj4SCDYJKBh42Cv4uCh4TCn4aBIIIuDCYIHBDQIeBFwYPBg4aCe4YPDfAYuHv4uNLo6bBLpJ4EFwYTBEQIHBCQYbBHQIqBEwIGCXYl/IQTwDD4P+CwIfBFILCCBAQACwACBEQQQBAArlDn4LGcoY3BGAIlEHQYAB+YiGMQIAB54DCOgRGD/0fEQpGD+A+CEQZ6BLYhFEKQX8HwYKDBYXgHwQ5DBYQpBBYQ5DHYRWDUQQAGgK5DADsBBZUfb4IAIOYoAETgJcFAAbLBBRBoBUQg5FRYxQDRYJGIZQQ5KFxDtCFxDpCFw7dIfAouICwQuHHIP+FxBQB8YuHf4UPFw6KCn4uGKAWAFw6KB/glBHJHAFw5QCQQIuGRQLzBFww5CKgRQH/A9BFwxQCFw45BCYQuGKAI5BFwwGBKAIuHRQRVCFwhQDFw6KBKAIuHfwQAEGAYKGGgbQCAAowCFwIAGF34ugAAjqHTojqFfQrqFcYoWJF0f+CxMH8ALJAEkCBZU8BRMB/CCKOw0DA4V/OwqhBA4IDBwAKFVoTlBBQytCn6xDBQX/IQQDDAgIACSwIRBTQQWDGwUHHQYzBAAK5CHQk/Fwo6EFwppBNoQuGgIPDFwYeCOoguC34eCh74DEASMCCQI+CDYQCBCQYuDDYMPFwQ6BFwYbBn4uCg4uE8ASBFwUfFwqIBCQV/FwsfLpAbBPgZdFFwpdGFwhdHDwQPELoYeCHwYbD/46CAYaMEBwLqFFwRGCv5RDFYUfBYIWBGQQuDv7iDMIQuCNIIADCwQuCfIgiDFwT5DEQYuDHQIiFVAc/EQyJDIwYiDc4RGDNAYuBCAJGDRYQHBCAQLDCwcPCAR+BHIgAEBYQKHEYQtDAH4Ak/gKJZALMBRhLGDAAjSGWYgLCEY7qDBYwtCXhBEBewzpF/5fGj4LDdYwKD//gKBBeHKAZGGHIX+gJGGKAQfBHQoSBCYQEB+A5GA4InBHQiJEQgKKGOIUPHQg5CFQU/HQaKDVgR1ERQQeCIwK8DBQPvDwUHFwZQB/0/DwUfFwaKB+IeDv4PCHIWHFw45B/geDFwjBCDwYPDEQKsCLoxFB+CIDCQIPCP4OAj6MCj4uEBAN/FQV/SAS0CFwIqBXYioCA4ZYBVwYbBHoIaCQAY+CHoPACwKADGwa+CEQcPFQIfBAARVCgE+dgiGCBYRVCHQLiFganEEQsIZQgiFAAZFGAAZGDNAYADcQSLDAAhSCVwYLHHI4LCCxC5FAH4AIJhRYBXgQAGh5vJgE/VI4uDSRAuJoAuJg4uKvguJg/wFxN/OAQuGaoIuJv/8FxAWBFxN/T4YuFCwIuJCwIuICwQuICwIuICwQGDFwgWCEQQuECwQpDFwk/BQIdDFwYPBCwguECwwuDCw4uDCw4uCCw4uDCw4uCCxAuCCxAuBCwYKEFwQWCRIYuD8YWIEAO/CxEPCoQWGLQYWHFwIWJJ4YWHFwYKGFwYWHFwYKHFwQWIFwQKHFwQWIFwQKIFwIWJdQQuJ8ALJAH8f/BuK/gIFv6RDBYqlBwEBSIIjFA4OAWgSSEA4WAv4LGA4TXC//Ab4v+j4LCwBYDAwP8DQTNEAwXzAYTCDFQfvAYRSDFQYADIwYqDAAZGCEQYAB8A6ENARHCDoI6DAgKKCD4N/HQQIB8ACBCYQGBAYMHE4IxBIQIPBHQU/DYIOBA4ISCDYQHBh4iCh7ICD4IaEAYJpCB4d/GwQuEGwasBDwYPBA4MHFw4HCj4uHA4QuULqyUDRgxCCRhC0Cn46CEwYbB+DhCYQa7DAAQyBcoIaBdQoLBawYrCAApRCHQILGKIT/C//7Eoh1DAAPvAYRRCIwkfEQpGD/AyDBQSBBCQQiGKQX+HwYiDKQXwGQRFDBYYyDNAYLCAwILCBQg+FHIgAEC4IKIQwKtCAH4AWnwKJPoKrEOAi3GaY4WJ/6KHW4ShIfwTbFAAMDCwX8A4UYHIrQE8AiFeYcHHwQiDKQZ6DEQZSCgYmDEQZGCj4uCEQQZBCYRtDNAPAg46Cg5hDv5aBBYI6Bn4aCRYInBDQIpCFwQTBGwQaBGQIuCn59Cn4uBSAgbDHoYuCE4JlCEwJjBCQUPEQUH/hjCFwaUCj/wHIKzDSgd/4AWBQAhhDcYTpDFwg5BUYYuE8Y5ELoufHIhdFaoguBYYbJESgjWDGgQHCH4IiDBQZZBCIIiCKAa7CIwIWCKAbPC8AWCKAZpCCgRQFIQhQGHQQADKAhOEKApGDAARQEIwZQHIwpQFBYpQFKQgWHPwYWHBYQWIEYREGL4YKJAH4AegIEDsCxGPIfgCwr/Dn6nFh6jCgKcGn/wEQQbDXgYqCn/4BQkDDwYPDFzV/JoUfB4RdOgI1DnjG/ACoA='))),
    46,
    atob("GBo2NjY2NjY2NjY2Gg=="),
    94+(scale<<8)+(1<<16)
  );
  return this;
}


{
  let SunCalc = require("suncalc"); // from modules folder
  const SETTINGS_FILE = "rebble.json";
  const LOCATION_FILE = "mylocation.json";
  const GLOBAL_SETTINGS = "setting.json";
  let settings;
  let location;
  let is12Hour;



  let boot_img = require("heatshrink").decompress(atob("oFAwkEogA/AH4A/AH4A/AH4A/AE8AAAoeXoAfeDQUBmcyD7A+Dh///8QD649CiAfaHwUvD4sEHy0DDYIfEICg+Cn4fHICY+DD4nxcgojOHwgfEIAYfRCIQaDD4ZAFD5r7DH4//kAfRCIZ/GAAnwD5p9DX44fTHgYSBf4ofVDAQEBl4fFUAgfOXoQzBgIfFBAIfPP4RAEAoYAB+cRiK/SG4h/WIBAfXIA7CBAAswD55AHn6fUIBMCD65AHl4gCmcziAfQQJqfQQJpiDgk0IDXxQLRAEECaBM+QgRYRYgUIA0CD4ggSQJiDCiAKBICszAAswD55AHABKBVD7BAFABIqBD5pAFABPxD55AOD6BADiIAJQAyxLABwf/gaAPAH4A/AH4ARA=="));
  let sunrise_img = require("heatshrink").decompress(atob("oFAwkEogA/AH4A/AH4A/AH4ACp5A/AH4A/AH4AIoEAggfcgAABD/4f/D/4f/CiNPmgfUoYIHoEAggfSoEQgYJGmAUJD5QJBgQ/IIBBKJChiVSCYR1LBZAzTICQyNICAxOICAwPD40xA4UTc5xAFiAuDiAWCAAMBc5hgHDxAgFeCKEDh//AAPwdiKDHh9PD4X0EAX0DyQ+BHoYgFh4+UDwofB/68OAAlBHw6CEQKITBDxAABMCReHUQhgSLxRgDDx9CD4g8DD4sUbqEUH5SABUB4fBDxYfKkQAFkEAiQJGAAcjgECBQ6qBAH4A9Y5wA/AH4Aw"));
  let sunset_img = require("heatshrink").decompress(atob("oFAwkEogA/AH4A/AH4A/AH4A/AH4A/AH4AMoEAggfcgAABD/4f/D/4f/CqU0D6lDBA9AgEED6VAiEDBI0wChIfKBIMCH5BAIJRIUMSqQTCOpYLIGaZASGRpAQGJxAQGB4fGmIHCibnOIAsQFwcQCwQABgLnMMA4eIEArwRQgY0DAwwARC44gC+geSORJ8PHw4KTABFBGhRAT+AzLgEPLzZgUKRhgBDx9CD50UbqARMUCBROD5MiAAsggESBIwADkcAgQKHVQIA/AHrHOAH4A/AGA"));

  let drawCount = 0;
  let sideBar = 0;
  let sunRise = "00:00";
  let sunSet = "00:00";

  let log_debug= function(o) {
    //console.log(o);
  }

  // requires the myLocation app
  let loadLocation= function() {
    location = require("Storage").readJSON(LOCATION_FILE,1)||{"lat":51.5072,"lon":0.1276,"location":"London"};
  }

  let loadSettings=function() {
    settings = {'bg': '#0f0', 'color': 'Green', 'autoCycle': true, 'fullScreen': true, 'sideTap':0};
    //sideTap 0 = on | 1 = sidebar1...

    let tmp =  require('Storage').readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in tmp) {
      settings[key] = tmp[key]
    }

    if(settings.sideTap!=0)
      sideBar=parseInt(settings.sideTap)-1; //tab to
    is12Hour = (require("Storage").readJSON(GLOBAL_SETTINGS, 1) || {})["12hour"] || false;
  }

  const zeroPad = (num, places) => String(num).padStart(places, '0')

  let formatHours=function(h) {
    if (is12Hour) {
      if (h == 0) {
        h = 12;
      } else if (h > 12) {
        h -= 12;
      }
    }
    return zeroPad(h, 2);
  }

  let extractTime=function(d){
    let h = d.getHours(), m = d.getMinutes();
    return(formatHours(h) + ":" + zeroPad(m, 2));
  }

  let updateSunRiseSunSet=function(lat, lon){
    // get today's sunlight times for lat/lon
    let times = SunCalc.getTimes(new Date(), lat, lon);

    // format sunrise time from the Date object
    sunRise = extractTime(times.sunrise);
    sunSet = extractTime(times.sunset);
  }

  // wrapper, makes it easier if we want to switch to a different font later
  let setSmallFont=function() {
    g.setFont('Vector', 20);
  }

  // set the text color of the sidebar elements that dont change with the Theme
  let setTextColor=function() {
    // day and steps
    if (settings.color == 'Blue' || settings.color == 'Red') {
      g.setColor('#fff'); // white on blue or red best contrast
    } else {
      g.setColor('#000'); // otherwise black regardless of theme
    }
  }

  const h = g.getHeight();
  const w = g.getWidth();
  /*const ha = 2*h/5 - 8;
  const h2 = 3*h/5 - 10;
  const h3 = 7*h/8;*/
  const w2 = 9*w/14;
  const w3 = w2 + ((w - w2)/2);  // centre line of the sidebar
  const ws = w - w2; // sidebar width
  const wb = 40; // battery width

  let draw=function() {
    log_debug("draw()");
    let date = new Date();
    let hh = date.getHours();
    let mm = date.getMinutes();

    hh = formatHours(hh);
    mm = zeroPad(mm,2);

    //const t = 6;

    if (drawCount % 60 == 0)
      updateSunRiseSunSet(location.lat, location.lon);
    
    g.reset();
    
    if (settings.fullScreen) {
      g.setColor(g.theme.bg);
      g.fillRect(0, 0, w2, h);
      g.setColor(settings.bg);
      g.fillRect(w2, 0, w, h);

      // time
      g.setColor(g.theme.fg);
      g.setFontKdamThmor();
      g.setFontAlign(0, -1);
      g.drawString(hh, w2/2, 10 + 0);
      g.drawString(mm, w2/2, 10 + h/2);

      switch(sideBar) {
      case 0:
        drawSideBar1();
        break;
      case 1:
        drawSideBar2();
        break;
      case 2:
        drawSideBar3();
        break;
      }
    } else {
      g.setColor(g.theme.bg);
      g.fillRect(0, 24, 113, 176);
      g.setColor(settings.bg);
      g.fillRect(113, 24, 176, 176);

      // time
      g.setColor(g.theme.fg);
      g.setFontKdamThmor();
      g.setFontAlign(0, -1);
      g.drawString(hh, 57, 24);
      g.drawString(mm, 57, 100);

      switch(sideBar) {
      case 0:
        drawSideBar1Alt();
        break;
      case 1:
        drawSideBar2Alt();
        break;
      case 2:
        drawSideBar3();
        break;
      }
    }


    drawCount++;
    queueDraw();
  }

  let drawSideBar1=function() {
    let date = new Date();
    let dy=require("date_utils").dow(date.getDay(),1).toUpperCase();
    let dd=date.getDate();
    let mm=require("date_utils").month(date.getMonth()+1,1).toUpperCase();


    drawBattery(w2 + (w-w2-wb)/2,  h/10, wb, 17);

    setTextColor();
    g.setFont('Vector', 20);
    g.setFontAlign(0, -1);
    g.drawString(E.getBattery() + '%', w3,  (h/10) + 17 + 7);

    drawDateAndCalendar(w3, h/2, dy, dd, mm);
  }
  
  let drawSideBar1Alt=function() {
    let date = new Date();
    let dy= require("date_utils").dow(date.getDay(),1).toUpperCase();
    let dd= date.getDate();
    let mm= require("date_utils").month(date.getMonth()+1,1).toUpperCase();
    let yy = date.getFullYear();

    drawDateAndCalendarAlt(145, 46, dy, dd, mm, yy);
  }

  let drawSideBar2=function() {
    drawBattery(w2 + (w-w2-wb)/2,  h/10, wb, 17);

    setTextColor();
    g.setFont('Vector', 20);
    g.setFontAlign(0, -1);
    g.drawString(E.getBattery() + '%', w3,  (h/10) + 17 + 7);

    // steps
    g.drawImage(boot_img, w2 + (ws - 64)/2, h/2, { scale: 1 });
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(formatSteps(), w3, 7*h/8);
  }  
  
  let drawSideBar2Alt=function() {
    setTextColor();
    
    // steps
    g.drawImage(boot_img, 113, 59, { scale: 1 });
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(formatSteps(), 145, 122);
  }

  // sunrise, sunset times
  let drawSideBar3=function() {
    g.setColor('#fff'); // sunrise white
    g.drawImage(sunrise_img, w2 + (ws - 64)/2, 0, { scale: 1 });
    setTextColor();
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(sunRise, w3, 64);

    g.setColor('#000'); // sunset black
    g.drawImage(sunset_img, w2 + (ws - 64)/2, h/2, { scale: 1 });
    setTextColor();
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(sunSet, w3, (h/2) + 64);
  }

  let drawDateAndCalendar=function(x,y,dy,dd,mm) {
    // day
    setTextColor();
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(dy.toUpperCase(), x, y);

    drawCalendar(x - (w/10), y + 28, w/5, 3, dd);

    // month
    setTextColor();
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(mm.toUpperCase(), x, y + 70);
  }
  
  let drawDateAndCalendarAlt=function(x, y, dy, dd, mm, yy) {
    // day
    setTextColor();
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(dy.toUpperCase(), x, y);

    drawCalendar(x - 18, y + 28, 35, 3, dd);

    // month
    setTextColor();
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(mm.toUpperCase(), x, y + 70);

    // year
    setTextColor();
    setSmallFont();
    g.setFontAlign(0, -1);
    g.drawString(yy, x, y + 94);
  }

  // at x,y width:wi thicknes:th
  let drawCalendar=function(x,y,wi,th,str) {
    g.setColor(g.theme.fg);
    g.fillRect(x, y, x + wi, y + wi);
    g.setColor(g.theme.bg);
    g.fillRect(x + th, y + th, x + wi - th, y + wi - th);
    g.setColor(g.theme.fg);

    let hook_t = 6;
    // first calendar hook, one third in
    g.fillRect(x + (wi/3) - (th/2), y - hook_t, x + wi/3 + th - (th/2), y + hook_t);
    // second calendar hook, two thirds in
    g.fillRect(x + (2*wi/3) -(th/2), y - hook_t, x + 2*wi/3 + th - (th/2), y + hook_t);

    setSmallFont();
    g.setFontAlign(0, 0);
    g.drawString(str, x + wi/2 + th/2, y + wi/2 + th/2);
  }

  let drawBattery=function(x,y,wi,hi) {
    g.reset();
    g.setColor(g.theme.fg);
    g.fillRect(x,y+2,x+wi-4,y+2+hi); // outer
    g.clearRect(x+2,y+2+2,x+wi-4-2,y+2+hi-2); // centre
    g.setColor(g.theme.fg);
    g.fillRect(x+wi-3,y+2+(((hi - 1)/2)-1),x+wi-2,y+2+(((hi - 1)/2)-1)+4); // contact
    g.fillRect(x+3, y+5, x +3 + E.getBattery()*(wi-10)/100, y+hi-1); // the level

    log_debug("Charging "+Bangle.isCharging());
    if( Bangle.isCharging() )
    {
      g.setBgColor(settings.bg);
      const image = require("heatshrink").decompress(atob("j8OwMB/4AD94DC44DCwP//n/gH//EOgE/+AdBh/gAYMH4EAvkDAYP/+/AFAX+FgfzGAnAA=="));
      g.drawImage(image,x+3,y+4);
    }

  }

  // format steps so they fit in the place
  let formatSteps=function() {
    let s = Bangle.getHealthStatus("day").steps;

    if (s < 1000) {
      return s + '';
    } else if (s < 10000) {
      return '' + (s/1000).toFixed(1) + 'K';
    }
    return Math.floor(s / 1000) + 'K';
  }

  let nextSidebar=function() {
    if (++sideBar > 2) sideBar = 0;
    log_debug("next: " + sideBar);
  }

  let prevSidebar=function() {
    if (--sideBar < 0) sideBar = 2;
    log_debug("prev: " + sideBar);
  }



  // timeout used to update every minute
  let drawTimeout;

  // schedule a draw for the next minute
  let queueDraw=function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      if (settings.autoCycle) {
          nextSidebar();
      }
      draw();
    }, 60000 - (Date.now() % 60000));
  }



  let chargingListener= function(charging) {

    //redraw the sidebar ( with the battery )
    switch(sideBar) {
      case 0:
        drawSideBar1();
        break;
      case 1:
        drawSideBar2();
        break;
    }
  }

  let deleteAll=function()
  {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Graphics.prototype.setFontKdamThmor;
    
    if (settings.fullScreen) {
      Bangle.removeListener('charging',chargingListener);
    }
  }

  let main=function(){


    log_debug("starting..");
    loadSettings();
    loadLocation();

    if(settings.autoCycle || settings.sideTap==0)
    {
      Bangle.setUI({
        mode : "clockupdown",
        remove : deleteAll
      },
        btn=> {
          if (btn<0) prevSidebar();
          if (btn>0) nextSidebar();
          draw();
        });

    }
    else{
      Bangle.setUI({
        mode : "clock",
        remove : deleteAll
      });
    }

    Bangle.loadWidgets();
    
    if (settings.fullScreen) {
      Bangle.on('charging',chargingListener);
      require("widget_utils").hide();
    } else {
      Bangle.drawWidgets();
    }
    
    draw();
  }

  main();
}
