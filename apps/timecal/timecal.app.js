//Clock renders date, time and pre,current,next week calender view
class TimeCalClock{
  DATE_FONT_SIZE(){ return 20; }
  TIME_FONT_SIZE(){ return 40; }

  /**
   * @param{Date} date optional the date (e.g. for testing)
   * @param{Settings} settings optional settings to use e.g. for testing
   */
  constructor(date, settings){ 
    if (date)
      this.date=date;

    if (settings)
      this._settings = settings;
    else 
      this._settings = require("Storage").readJSON("timecal.settings.json", 1) || {};

    const defaults = {
      shwDate:1, //0:none, 1:locale, 2:month, 3:monthshort.year #week

      wdStrt:0, //identical to getDay() 0->Su, 1->Mo, ... //Issue #1154: weekstart So/Mo, -1 for use today

      tdyNumClr:3, //0:fg, 1:red=#E00, 2:green=#0E0, 3:blue=#00E
      tdyMrkr:0, //0:none, 1:circle, 2:rectangle, 3:filled
      tdyMrkClr:2, //1:red=#E00, 2:green=#0E0, 3:blue=#00E
      tdyMrkPxl:3, //px

      suClr:1, //0:fg, 1:red=#E00, 2:green=#0E0, 3:blue=#00E
      //phColor:"#E00", //public holiday

      calBrdr:false,
      showWeather:false
    };
    for (const k in this._settings) if (!defaults.hasOwnProperty(k)) delete this._settings[k]; //remove invalid settings
    for (const k in defaults) if(!this._settings.hasOwnProperty(k)) this._settings[k] = defaults[k]; //assign missing defaults

    g.clear();
    Bangle.setUI("clock");
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    // X coord to center date and time text at
    this.dtCenterX = Bangle.appRect.w/2;
    this.weather = undefined;
    if(this.settings().showWeather && require('weather')){
      this.weather = require('weather').get();
    }
    if(this.weather){
      this.dtCenterX =2*Bangle.appRect.w/3;
    }
    this.nrgb = [g.theme.fg, "#E00", "#0E0", "#00E"]; //fg, r ,g , b

    this.ABR_DAY=[];
    if (require("locale") && require("locale").dow)
      for (let d=0; d<=6; d++) {
        var refDay=new Date();
        refDay.setFullYear(1972);
        refDay.setMonth(0);
        refDay.setDate(2+d);
        this.ABR_DAY.push(require("locale").dow(refDay));

      }
    else
      this.ABR_DAY=["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }

  /**
   * @returns {Object} current settings object
   */
  settings(){ 
    return this._settings;
  }


  /*
  * Run forest run
  **/
  draw(){
    // DEBUG
    // require("weather").get = () => ({
    //   "temp": 298.15,  // Temperature in Kelvin
    //   "code": 800,     // Weather condition code
    //   "txt": "few clouds", // Weather condition text
    // });
    // require("weather").get = undefined;

    const d = this.date ? this.date : new Date();
    if (this.settings().showWeather && require('weather')){
      this.weather = require('weather').get();
    }
    const prevCenterX = this.dtCenterX;
    if(this.weather){
      this.dtCenterX = 2 * Bangle.appRect.w / 3;
    } else {
      this.dtCenterX = Bangle.appRect.w / 2;
    }
    this.drawTime();
    if(prevCenterX !== this.dtCenterX) {
      this.drawDateAndCal();
    }

    if (this.TZOffset===undefined || this.TZOffset!==d.getTimezoneOffset())
      this.drawDateAndCal();

    if(this.weather){
      this.drawWeather();
    }
  }

  drawWeather() {
    const curr = this.weather;
    const temp = require("locale").temp(curr.temp-273.15).match(/^(\D*\d*)(.*)$/)[0];
    const iconRadius = 20;
    const widgetHeight = 24;
    g.clearRect(
      Bangle.appRect.x,
      Bangle.appRect.y,
      Bangle.appRect.w/3,
      Bangle.appRect.y + widgetHeight + iconRadius
    );
    (require('weather')).drawIcon(curr, Bangle.appRect.x + widgetHeight, Bangle.appRect.y + widgetHeight - 4, iconRadius);
    g
      .setFontAlign(0, -1)
      .setFont('6x8', 2)
      .setColor(g.theme.fg)
      .drawString(temp, Bangle.appRect.x2/6, Bangle.appRect.y + widgetHeight + iconRadius);
  }

  /**
   * draw given or current time from date
   * overwatch timezone changes
   * schedules itself to update
   */
  drawTime(){
    const d=this.date ? this.date : new Date();
    const Y=Bangle.appRect.y+this.DATE_FONT_SIZE()+10;

    g.setFontAlign(0, -1)
      .setFont("Vector", this.TIME_FONT_SIZE())
      .setColor(g.theme.fg)
      .clearRect(Bangle.appRect.x, Y - 13, Bangle.appRect.x2,Y+this.TIME_FONT_SIZE()-7)
      .drawString(("0" + require("locale").time(d, 1)).slice(-5), this.dtCenterX, Y, true)
      // .drawRect(Bangle.appRect.x, Y - 13, Bangle.appRect.x2,Y+this.TIME_FONT_SIZE()-7) //DEV-Option
    ;

    setTimeout(this.draw.bind(this), 60000-(d.getSeconds()*1000)-d.getMilliseconds());
  }

  /**
   * draws given date and cal
   * @param{Date} d provide date or uses today
   */
  drawDateAndCal(){
    const d=this.date ? this.date : new Date();

    this.TZOffset=d.getTimezoneOffset();
    this.drawDate();
    this.drawCal();

    if (this.tOutD) //abort exisiting
      clearTimeout(this.tOutD);
    this.tOutD=setTimeout(this.drawDateAndCal.bind(this), 86400000-(d.getHours()*24*60*1000)-(d.getMinutes()*60*1000)-d.getSeconds()-d.getMilliseconds());
  }

  /**
     * draws given date as defiend in settings
   */
  drawDate(){
    const d=this.date ? this.date : new Date();

    const FONT_SIZE=20;
    const Y=Bangle.appRect.y;
    var render=false;
    var dateStr = "";
    if (this.settings().shwDate>0) { //skip if exactly -none
      const dateSttngs = ["","l","M","m.Y #W"];
      for (let c of dateSttngs[this.settings().shwDate]) { //add part as configured
        switch (c){
          case "l":{ //locale
            render=true;
            dateStr+=require("locale").date(d,1);
            break;
          } 
          case "m":{ //month e.g. Jan.
            render=true;
            dateStr+=require("locale").month(d,1);
            break;
          }
          case "M":{ //month e.g. January
            render=true;
            dateStr+=require("locale").month(d,0);
            break;
          }
          case "y":{ //year e.g. 22
            render=true;
            dateStr+=d.getFullYear().slice(-2);
            break;
          }
          case "Y":{ //year e.g. 2022
            render=true;
            dateStr+=d.getFullYear();
            break;
          }
          case "w":{ //week e.g. #2
            dateStr+=(this.ISO8601calWeek(d));
            break;
          }
          case "W":{ //week e.g. #02
            dateStr+=("0"+this.ISO8601calWeek(d)).slice(-2);
            break;
          }
          default: //append c
            dateStr+=c;
            render=dateStr.length>0; 
            break; //noop
        }
      }
    }
    if (render){
      g
        .setFont("Vector", FONT_SIZE)
        .setColor(g.theme.fg)
        .setFontAlign(0, -1)
        .clearRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+FONT_SIZE-3)
        .drawString(dateStr, this.dtCenterX - 3, Y+1);
    }
    //g.drawRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+FONT_SIZE-3); //DEV-Option
  }

  /**
   * draws calender week view (-1,0,1) for given date 
   */
  drawCal(){
    const d=this.date ? this.date : new Date();

    const DAY_NAME_FONT_SIZE=10;
    const CAL_Y=Bangle.appRect.y+this.DATE_FONT_SIZE()+10+this.TIME_FONT_SIZE()+3;
    const CAL_AREA_H=Bangle.appRect.h-CAL_Y+24; //+24: top widegtes only
    const CELL_W=Bangle.appRect.w/7; //cell width
    const CELL_H=(CAL_AREA_H-DAY_NAME_FONT_SIZE)/3; //cell heigth
    const DAY_NUM_FONT_SIZE=Math.min(CELL_H-1,15); //size down, max 15

    g.setFont("Vector", DAY_NAME_FONT_SIZE).setColor(g.theme.fg).setFontAlign(-1, -1).clearRect(Bangle.appRect.x, CAL_Y, Bangle.appRect.x2, CAL_Y+CAL_AREA_H);

    //draw grid & Headline
    const dNames = this.ABR_DAY.map((a) => a.length<=2 ? a : a.substr(0, 2)); //force shrt 2
    for(var dNo=0; dNo<dNames.length; dNo++){
      const dIdx=this.settings().wdStrt>=0 ? (dNo+this.settings().wdStrt)%7 : (dNo+d.getDay()+4)%7;
      const dName=dNames[dIdx];
      if(dNo>0)
        g.drawLine(dNo*CELL_W, CAL_Y, dNo*CELL_W, CAL_Y+CAL_AREA_H-1);

      if (dIdx==0) g.setColor(this.nrgb[this.settings().suClr]); //sunday maybe colorize txt
      g.drawString(dName, dNo*CELL_W+(CELL_W-g.stringWidth(dName))/2+2, CAL_Y+1).setColor(g.theme.fg);
    }

    var nextY=CAL_Y+DAY_NAME_FONT_SIZE;

    for(let i=0; i<3; i++){
      const y=nextY+i*CELL_H;
      g.drawLine(Bangle.appRect.x, y, Bangle.appRect.x2, y);
    }

    g.setFont("Vector", DAY_NUM_FONT_SIZE);

    //write days
    const tdyDate=d.getDate();
    const days=this.settings().wdStrt>=0 ? 7+((7+d.getDay()-this.settings().wdStrt)%7) : 10;//start day (week before=7 days + days in this week realtive to week start) or fixed 7+3 days
    var rD=new Date(d.getTime());
    rD.setDate(rD.getDate()-days);
    var rDate=rD.getDate();
    for(var y=0; y<3; y++){ 
      for(var x=0; x<dNames.length; x++){
        if(rDate===tdyDate){ //today
          g.setColor(this.nrgb[this.settings().tdyMrkClr]); //today marker color or fg color
          switch(this.settings().tdyMrkr){ //0:none, 1:circle, 2:rectangle, 3:filled
            case 1: 
              for(let m=1; m<=this.settings().tdyMrkPxl&&m<CELL_H-1&&m<CELL_W-1; m++)
                g.drawCircle(x*CELL_W+(CELL_W/2)+1, nextY+(CELL_H*y)+(CELL_H/2)+1, Math.min((CELL_W-m)/2, (CELL_H-m)/2)-2);
              break;
            case 2: 
              for(let m=1; m<=this.settings().tdyMrkPxl&&m<CELL_H-1&&m<CELL_W-1; m++)
                g.drawRect(x*CELL_W+m, nextY+CELL_H+m, x*CELL_W+CELL_W-m, nextY+CELL_H+CELL_H-m);
              break;
            case 3:
              g.fillRect(x*CELL_W+1, nextY+CELL_H+1, x*CELL_W+CELL_W-1, nextY+CELL_H+CELL_H-1);
              break;
            default:
              break;
          }
          g.setColor(this.nrgb[this.settings().tdyNumClr]); //today color or fg color
        }else if(this.settings().suClr && rD.getDay()==0){ //sundays
          g.setColor(this.nrgb[this.settings().suClr]);
        }else{ //default
          g.setColor(g.theme.fg);
        }
        g.drawString(rDate, x*CELL_W+((CELL_W-g.stringWidth(rDate))/2)+2, nextY+((CELL_H-DAY_NUM_FONT_SIZE+2)/2)+(CELL_H*y));
        rD.setDate(rDate+1);
        rDate=rD.getDate();
      }
    }
    if (this.settings().calBrdr) {
      g.setColor(g.theme.fg).drawRect(Bangle.appRect.x, CAL_Y, Bangle.appRect.x2, CAL_Y+CAL_AREA_H-1);
    }
  }

  /**
   * calculates current ISO8601 week number e.g. 2
   * @param{Date} date for the date
   * @returns{Number}} e.g. 2
   */
  ISO8601calWeek(date){ //copied from: https://gist.github.com/IamSilviu/5899269#gistcomment-3035480
    var tdt = new Date(date.valueOf());
    var dayn = (date.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4){
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return Number(1 + Math.ceil((firstThursday - tdt) / 604800000));
  }
}

let timeCalClock = new TimeCalClock(); timeCalClock.draw();

//hook on settime to redraw immediatly
var _setTime = setTime;
var setTime = function(t) {
  _setTime(t);
  timeCalClock.draw(true);
};
