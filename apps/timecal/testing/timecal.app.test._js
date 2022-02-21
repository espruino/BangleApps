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

      calBrdr:false 
    };
    for (const k in this._settings) if (!defaults.hasOwnProperty(k)) delete this._settings[k]; //remove invalid settings
    for (const k in defaults) if(!this._settings.hasOwnProperty(k)) this._settings[k] = defaults[k]; //assign missing defaults

    g.clear();
    Bangle.setUI("clock");
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    this.centerX = Bangle.appRect.w/2;
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
    this.drawTime();

    if (this.TZOffset===undefined || this.TZOffset!==d.getTimezoneOffset())
      this.drawDateAndCal();
    }

  /**
   * draw given or current time from date
   * overwatch timezone changes
   * schedules itself to update
   */
  drawTime(){
    d=this.date ? this.date : new Date();
    const Y=Bangle.appRect.y+this.DATE_FONT_SIZE()+10;

    d=d?d :new Date();

    g.setFontAlign(0, -1).setFont("Vector", this.TIME_FONT_SIZE()).setColor(g.theme.fg)
    .clearRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+this.TIME_FONT_SIZE()-7)
    .drawString(("0" + require("locale").time(d, 1)).slice(-5), this.centerX, Y, true);
    //.drawRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+this.TIME_FONT_SIZE()-7); //DEV-Option

    setTimeout(this.draw.bind(this), 60000-(d.getSeconds()*1000)-d.getMilliseconds());
  }

  /**
   * draws given date and cal
   * @param{Date} d provide date or uses today
   */
  drawDateAndCal(){
    d=this.date ? this.date : new Date();

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
    d=this.date ? this.date : new Date();

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
      g.setFont("Vector", FONT_SIZE).setColor(g.theme.fg).setFontAlign(0, -1).clearRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+FONT_SIZE-3).drawString(dateStr,this.centerX,Y);
    }
    //g.drawRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+FONT_SIZE-3); //DEV-Option
  }

  /**
   * draws calender week view (-1,0,1) for given date 
   */
  drawCal(){
    d=this.date ? this.date : new Date();

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

    for(i=0; i<3; i++){
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
              for(m=1; m<=this.settings().tdyMrkPxl&&m<CELL_H-1&&m<CELL_W-1; m++)
                g.drawCircle(x*CELL_W+(CELL_W/2)+1, nextY+(CELL_H*y)+(CELL_H/2)+1, Math.min((CELL_W-m)/2, (CELL_H-m)/2)-2);
              break;
            case 2: 
              for(m=1; m<=this.settings().tdyMrkPxl&&m<CELL_H-1&&m<CELL_W-1; m++)
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

//*************************************************************************************
//*************************************************************************************
//*************************************************************************************
//Copy ABOVE the src code of clock-app class and load via espruino WEB IDE
//*************************************************************************************
//*************************************************************************************
//*************************************************************************************

/**
 * Severity for logging
 */
 const LogSeverity={
  DEBUG:      5,
  INFO:       4,
  WARNING:    3,
  ERROR:      2,
  EXCEPTION:  1
};

/**
 * Exception: Mandatory Field not provided
 */
class EmptyMandatoryError extends Error{
  /**
   * Create Exception
   * @param {String} name of the field
   * @param {*} given data e.g. an object
   * @param {*} expected *optional* an working example
   */
  constructor(name, given, expected) {
    this.field = name;
    this.got = given;
    this.message = "Missing mandatory '"+ name +"'. given '"+JSON.stringify(given)+"'";
    if (expected) {
      this.message+= " != expected: '"+JSON.stringify(expected)+"'";
      this.sample = expected;
    }
    Error(this.message);
  }

  toString() {
    return this.message;
  }
}

/**
 * Exception: Invalid Function
 */
 class InvalidMethodName extends Error{
  /**
   * Create Exception
   * @param {String} name of the field
   * @param {*} given data e.g. an object
   * @param {*} expected *optional* an working example
   */
  constructor(className, methodName) {
    this.class = className;
    this.method = methodName;
    this.message = "Function '"+methodName+"' not found in '"+className+"'";
    Error(this.message);
  }

  toString() {
    return this.message;
  }
}
/*************************************************************************/

/**
 * All Test Masterclass
 */
class Test{
}

/*************************************************************************/

/**
 * Test Settings - use this if you want e.g. test  draw/render function(s)
 */
class TestSetting extends Test{
  TEST_SETTING_SAMPLE() {
    return {
      setting:       "<settingName>",
      cases: [
        { 
          value:            "required,<settingValue>",
          beforeTxt:        "optional,<textToDisplayBeforeTest>",
          beforeExpression: "optional,<expressionExpectedTrue>",
          afterText:        "optional,<textToDisplayAfterTest>",
          afterExpression:  "optional,<expressionExpectedTrue>"
        }
      ],
      constructorParams: ["optional: <cpar1>","|TEST_SETTINGS|","..."], //TEST_SETTINGS will be replcaed with each current {setting: case}
      functionNames: ["required, <function under test>", "..."],
      functionParams: ["optional: <fpar1>","|TEST_SETTINGS|","..."]
    };
  }

  constructor(data){

    this._validate(data);

    this.setting = data.setting;
    this.cases = data.cases.map((entry) => {
      return {
        value:              entry.value,
        beforeTxt:          entry.beforeTxt||"",
        beforeExpression:   entry.beforeExpression||true,
        afterTxt:           entry.afterTxt||"",
        afterExpression:    entry.afterExpression||true
      };
    });
    this.constructorParams = data.constructorParams;
    this.functionNames = data.functionNames;
    this.functionParams = data.functionParams;
  }

  /**
   * validates the given data config
   */
  _validate(data){
    //validate given config
    if (!data.setting) throw new EmptyMandatoryError("setting", data, this.TEST_SETTING_SAMPLE());
    if (!(data.cases instanceof Array) || data.cases.length==0) throw new EmptyMandatoryError("cases", data, this.TEST_SETTING_SAMPLE());
    if (!(data.functionNames instanceof Array) || data.functionNames==0) throw new EmptyMandatoryError("functionNames", data, this.TEST_SETTING_SAMPLE());

    data.cases.forEach((entry,idx) => {
      if (entry.value === undefined) throw new EmptyMandatoryError("cases["+idx+"].value", entry, this.TEST_SETTING_SAMPLE());
    });
  }
}

/*************************************************************************/

/**
 * Testing a Bangle object
 */
class BangleTestRunner{
  /**
   * create for ObjClass
   * @param {Class} objClass
   * @param {LogSeverity} minSeverity to Log
   */
  constructor(objClass, minSeverity){
    this.TESTCASE_MSG_BEFORE_TIMEOUT = 1000; //5s
    this.TESTCASE_RUN_TIMEOUT = 1000; //5s
    this.TESTCASE_MSG_AFTER_TIMEOUT = 1000; //5s

    this.oClass = objClass;
    this.minSvrty = minSeverity;
    this.tests = [];

    this.currentCaseNum = this.currentTestNum = this.currentTest = this.currentCase = undefined;
  }

  /**
   * add a Setting Test, return instance for chaining
   * @param {TestSetting}
   */
  addTestSettings(sttngs) {
    this.tests.push(new TestSetting(sttngs));
    return this;
  }

  /**
   * Test execution of all tests
   */
   execute() {
    this._init();
    while (this._nextTest()) {
      this._beforeTest();
      while (this._nextCase()) {
        this._beforeCase();
        this._runCase();
        this._afterCase();
      } 
      this._afterTest();
      this._firstCase();
    }
    this._exit();
  }

  /**
   * global prepare - before all test
   */
  _init() {
    console.log(this._nowTime(), ">>init");
    this.currentTestNum=-1;
    this.currentCaseNum=-1;
  }
  
  /**
   * before each test
   */
  _beforeTest() {
    console.log(this._nowTime(), ">>test #" + this.currentTestNum);
  }

  /**
   * befor each testcase
   */
  _beforeCase() {
    console.log(this.currentTest);
    console.log(this._nowTime(), ">>case #" + this.currentTestNum + "." + this.currentCaseNum + "/" + (this.currentTest.cases.length-1));
    if (this.currentTest instanceof TestSetting)
      console.log(this.currentTest.setting+"="+this.currentCase.value+"/n"+(this.currentCase.beforeTxt ? "#"+this.currentCase.beforeTxt : ""));
  }

  /**
   * testcase runner
   */
  _runCase() {
    console.log(this._nowTime(), ">>running...");
    var returns = [];
    this.currentTest.functionNames.forEach((fName) => {
      var settings={}; settings[this.currentTest.setting] = this.currentCase.value;
      var cParams = this.currentTest.constructorParams||[]; 
      cParams = cParams.map((v) => (v && v instanceof String && v==="|TEST_SETTINGS|") ? settings : v);//replace settings in call params
      var fParams = this.currentTest.functionParams||[];
      fParams = fParams.map((v) => (v && v instanceof String && v==="|TEST_SETTINGS|") ? settings : v);//replace settings in call params

      var creatorFunc = new Function("console.log('Constructor params:', arguments); return new " + this.oClass + "(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6],arguments[7],arguments[8],arguments[9])"); //prepare spwan arguments[0],arguments[1]
      let instance = creatorFunc.call(this.oClass, cParams[0], cParams[1], cParams[2], cParams[3], cParams[4], cParams[5], cParams[6], cParams[7], cParams[8], cParams[9]); //spwan

      console.log(">>"+this.oClass+"["+fName+"]()");
      
      console.log('Instance:', instance);
      console.log('Function params:', fParams);
      returns.push(instance[fName](fParams[0], fParams[1], fParams[2], fParams[3], fParams[4], fParams[5], fParams[6], fParams[7], fParams[8], fParams[9])); //run method and store result
      g.dump();
      console.log("<<"+this.oClass+"["+fName+"]()");
    });
    console.log(this._nowTime(), "<<...running");
  }

  /**
   * after each testcase
   */
  _afterCase() {
    if (this.currentTest instanceof TestSetting)
      if (this.currentCase.afterTxt.length>0)
        console.log("++EXPECTED:" + this.currentCase.afterTxt + "EXPECTED++");
    console.log(this._nowTime(), "<<case #" + this.currentTestNum + "." + this.currentCaseNum + "/" + (this.currentTest.cases.length-1));
  }

  /**
   * after each test
   */
  _afterTest() {
    console.log(this._nowTime(), "<<test #" + this.currentTestNum);
  }

  /**
   * after all tests
   */
  _exit() {
    console.log(this._nowTime(), "<<exit");
  }

  /**
   * delays for x seconds 
   * @param {Number} sec to delay
   */
  _delay(sec) {
    return new Promise(resolve => setTimeout(resolve, sec));
  }

  _waits(sec) {
    this._delay(1).then();
  }

  _log() {

  }

  _nextTest() {
    if (this.currentTestNum>=-1 && (this.currentTestNum+1)<this.tests.length) {
      this.currentTestNum++; this.currentTest = this.tests[this.currentTestNum];
      return true;
    }
    return false;
  }

  _firstCase() {
    this.currentCaseNum=-1;
  }

  _nextCase() {
    if (this.currentCaseNum>=-1 && (this.currentCaseNum+1)<this.currentTest.cases.length) {
      this.currentCaseNum++; this.currentCase = this.currentTest.cases[this.currentCaseNum];
      return true;
    }
    return false;
  }

  _nowTime() {
    d = new Date();
    return(("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "." + ("00" + d.getMilliseconds()).slice(-3));
  }
}
/**
 * TEST all Settings
 */
new BangleTestRunner("TimeCalClock", LogSeverity.INFO)
  /*
  .addTestSettings({ 
    setting:       "shwDate",
    cases: [
      { value: 0, beforeTxt:"No date display?",            afterTxt: "top area should be 'emtpy'" },
      { value: 1, beforeTxt:"Locale date display?",        afterTxt: "date should be 06/05/1234"  },
      { value: 2, beforeTxt:"Month longname?",             afterTxt: "date should be June"        },
      { value: 3, beforeTxt:"Monthshort yearshort #week",  afterTxt: "date should be Jun.34 #23"  }
    ],
    constructorParams: [new Date(1234,5,6,7,8,9),"|TEST_SETTINGS|"],
    functionNames: ["drawDate"],
    functionParams: [],
  })
  */
  /*
  .addTestSettings({ 
    setting:       "wdStrt",
    cases: [
      { value:  0, beforeTxt:"Week start Sunday?"     , afterTxt: "Calendar first day is Sunday" },
      { value:  1, beforeTxt:"Week start Monday?"     , afterTxt: "Calendar first day is Monday"},
      { value:  2, beforeTxt:"Week start Tuesday?"    , afterTxt: "Calendar first day is Tuesday"},
      { value:  3, beforeTxt:"Week start Wednesday?"  , afterTxt: "Calendar first day is Wednesday"},
      { value:  4, beforeTxt:"Week start Thursday?"   , afterTxt: "Calendar first day is Thursday"},
      { value:  5, beforeTxt:"Week start Friday?"     , afterTxt: "Calendar first day is Friday"},
      { value:  6, beforeTxt:"Week start Saturday?"   , afterTxt: "Calendar first day is Saturday"},
    ],
    constructorParams: [new Date(1234,5,3,7,8,9),"|TEST_SETTINGS|"],
    functionNames: ["drawCal"],
    functionParams: [],
  })
  .addTestSettings({ 
    setting:       "wdStrt",
    cases: [
      { value:  0, beforeTxt:"Week start Sunday?"     , afterTxt: "Calendar first day is Sunday" },
      { value:  1, beforeTxt:"Week start Monday?"     , afterTxt: "Calendar first day is Monday"},
      { value:  2, beforeTxt:"Week start Tuesday?"    , afterTxt: "Calendar first day is Tuesday"},
      { value:  3, beforeTxt:"Week start Wednesday?"  , afterTxt: "Calendar first day is Wednesday"},
      { value:  4, beforeTxt:"Week start Thursday?"   , afterTxt: "Calendar first day is Thursday"},
      { value:  5, beforeTxt:"Week start Friday?"     , afterTxt: "Calendar first day is Friday"},
      { value:  6, beforeTxt:"Week start Saturday?"   , afterTxt: "Calendar first day is Saturday"},
    ],
    constructorParams: [new Date(1234,5,4,7,8,9),"|TEST_SETTINGS|"],
    functionNames: ["drawCal"],
    functionParams: [],
  })
   .addTestSettings({ 
    setting:       "wdStrt",
    cases: [
      { value:  0, beforeTxt:"Week start Sunday?"     , afterTxt: "Calendar first day is Sunday" },
      { value:  1, beforeTxt:"Week start Monday?"     , afterTxt: "Calendar first day is Monday"},
      { value:  2, beforeTxt:"Week start Tuesday?"    , afterTxt: "Calendar first day is Tuesday"},
      { value:  3, beforeTxt:"Week start Wednesday?"  , afterTxt: "Calendar first day is Wednesday"},
      { value:  4, beforeTxt:"Week start Thursday?"   , afterTxt: "Calendar first day is Thursday"},
      { value:  5, beforeTxt:"Week start Friday?"     , afterTxt: "Calendar first day is Friday"},
      { value:  6, beforeTxt:"Week start Saturday?"   , afterTxt: "Calendar first day is Saturday"},
    ],
    constructorParams: [new Date(1234,5,5,7,8,9),"|TEST_SETTINGS|"],
    functionNames: ["drawCal"],
    functionParams: [],
  })
   .addTestSettings({ 
    setting:       "wdStrt",
    cases: [
      { value:  0, beforeTxt:"Week start Sunday?"     , afterTxt: "Calendar first day is Sunday" },
      { value:  1, beforeTxt:"Week start Monday?"     , afterTxt: "Calendar first day is Monday"},
      { value:  2, beforeTxt:"Week start Tuesday?"    , afterTxt: "Calendar first day is Tuesday"},
      { value:  3, beforeTxt:"Week start Wednesday?"  , afterTxt: "Calendar first day is Wednesday"},
      { value:  4, beforeTxt:"Week start Thursday?"   , afterTxt: "Calendar first day is Thursday"},
      { value:  5, beforeTxt:"Week start Friday?"     , afterTxt: "Calendar first day is Friday"},
      { value:  6, beforeTxt:"Week start Saturday?"   , afterTxt: "Calendar first day is Saturday"},
    ],
    constructorParams: [new Date(1234,5,6,7,8,9),"|TEST_SETTINGS|"],
    functionNames: ["drawCal"],
    functionParams: [],
  })
   .addTestSettings({ 
    setting:       "wdStrt",
    cases: [
      { value:  0, beforeTxt:"Week start Sunday?"     , afterTxt: "Calendar first day is Sunday" },
      { value:  1, beforeTxt:"Week start Monday?"     , afterTxt: "Calendar first day is Monday"},
      { value:  2, beforeTxt:"Week start Tuesday?"    , afterTxt: "Calendar first day is Tuesday"},
      { value:  3, beforeTxt:"Week start Wednesday?"  , afterTxt: "Calendar first day is Wednesday"},
      { value:  4, beforeTxt:"Week start Thursday?"   , afterTxt: "Calendar first day is Thursday"},
      { value:  5, beforeTxt:"Week start Friday?"     , afterTxt: "Calendar first day is Friday"},
      { value:  6, beforeTxt:"Week start Saturday?"   , afterTxt: "Calendar first day is Saturday"},
    ],
    constructorParams: [new Date(1234,5,7,7,8,9),"|TEST_SETTINGS|"],
    functionNames: ["drawCal"],
    functionParams: [],
  })
   .addTestSettings({ 
    setting:       "wdStrt",
    cases: [
      { value:  0, beforeTxt:"Week start Sunday?"     , afterTxt: "Calendar first day is Sunday" },
      { value:  1, beforeTxt:"Week start Monday?"     , afterTxt: "Calendar first day is Monday"},
      { value:  2, beforeTxt:"Week start Tuesday?"    , afterTxt: "Calendar first day is Tuesday"},
      { value:  3, beforeTxt:"Week start Wednesday?"  , afterTxt: "Calendar first day is Wednesday"},
      { value:  4, beforeTxt:"Week start Thursday?"   , afterTxt: "Calendar first day is Thursday"},
      { value:  5, beforeTxt:"Week start Friday?"     , afterTxt: "Calendar first day is Friday"},
      { value:  6, beforeTxt:"Week start Saturday?"   , afterTxt: "Calendar first day is Saturday"},
    ],
    constructorParams: [new Date(1234,5,8,7,8,9),"|TEST_SETTINGS|"],
    functionNames: ["drawCal"],
    functionParams: [],
  })
  */
  
  /*
  .addTestSettings({ 
      setting:       "wdStrt",
      cases: [
        { value: -1, beforeTxt:"Sunday in mid?"     , afterTxt: "Calendar focus today: Sunday" },
      ],
      constructorParams: [new Date(1234,5,3,7,8,9),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
  .addTestSettings({ 
      setting:       "wdStrt",
      cases: [
        { value: -1, beforeTxt:"Monday in mid?"     , afterTxt: "Calendar focus today: Monday" },
      ],
      constructorParams: [new Date(1234,5,4,7,8,9),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
  .addTestSettings({ 
      setting:       "wdStrt",
      cases: [
        { value: -1, beforeTxt:"Tuesday in mid?"     , afterTxt: "Calendar focus today: Tuesday" },
      ],
      constructorParams: [new Date(1234,5,5,7,8,9),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
  .addTestSettings({ 
      setting:       "wdStrt",
      cases: [
        { value: -1, beforeTxt:"Wednesday in mid?"     , afterTxt: "Calendar focus today: Wednesday" },
      ],
      constructorParams: [new Date(1234,5,6,7,8,9),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
  .addTestSettings({ 
      setting:       "wdStrt",
      cases: [
        { value: -1, beforeTxt:"Thursday in mid?"     , afterTxt: "Calendar focus today: Thursday" },
      ],
      constructorParams: [new Date(1234,5,7,7,8,9),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
  .addTestSettings({ 
      setting:       "wdStrt",
      cases: [
        { value: -1, beforeTxt:"Friday in mid?"     , afterTxt: "Calendar focus today: Friday" },
      ],
      constructorParams: [new Date(1234,5,8,7,8,9),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
  .addTestSettings({ 
      setting:       "wdStrt",
      cases: [
        { value: -1, beforeTxt:"Saturday in mid?"     , afterTxt: "Calendar focus today: Saturday" },
      ],
      constructorParams: [new Date(1234,5,9,7,8,9),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
    */

    /*
    .addTestSettings({ 
      setting:       "tdyNumClr",
      cases: [
        { value: 1, beforeTxt:"Today color: red?"    , afterTxt: "Today is marked red" },
        { value: 2, beforeTxt:"Today color: green?"  , afterTxt: "Today is marked green" },
        { value: 3, beforeTxt:"Today color: blue?"   , afterTxt: "Today is marked blue" },
      ],
      constructorParams: [new Date(),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
    */

    /*
    .addTestSettings({ 
      setting:       "tdyMrkr",
      cases: [
        { value: 1, beforeTxt:"Today highlight cricle?"     , afterTxt: "Today circled." },
        { value: 2, beforeTxt:"Today highlight rectangle?"  , afterTxt: "Today rectangled." },
        { value: 3, beforeTxt:"Today highlight filled?"     , afterTxt: "Today filled." },
      ],
      constructorParams: [new Date(),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
    */

    /*
    .addTestSettings({ 
      setting:       "suClr",
      cases: [
        { value: 1, beforeTxt:"Sundays color: red?"    , afterTxt: "Sundays are red" },
        { value: 2, beforeTxt:"Sundays color: green?"  , afterTxt: "Sundays are green" },
        { value: 3, beforeTxt:"Sundays color: blue?"   , afterTxt: "Sundays are blue" },
      ],
      constructorParams: [new Date(),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
    */

    /*
    .addTestSettings({ 
      setting:       "calBrdr",
      cases: [
        { value: false, beforeTxt:"Calendar without border?" , afterTxt: "No outer border." },
        { value: true,  beforeTxt:"Calendar with border?"    , afterTxt: "Outer border." },
      ],
      constructorParams: [new Date(),"|TEST_SETTINGS|"],
      functionNames: ["drawCal"],
      functionParams: [],
    })
    */
   .execute();