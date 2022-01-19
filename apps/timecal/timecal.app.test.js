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
      showDate:"l", //(n)one, (l)ocale, (m)onth short(y)ear(w)eek
      
      wdStrt:1, //identical to getDay() 0->Su, 1->Mo, ... //Issue #1154: weekstart So/Mo,

      todayNumClr:"#00E",
      todayMrker:"r", //(n)one, (c)ircle, (r)ect, (f)illed
      todayMrkClr:"#0E0",
      todayMrkMrkPxl:3,

      suColor:"#E00", //sunday
      phColor:"#E00", //public holiday

      calBorder:true
    };
    for (const k in this._settings) if (!defaults.hasOwnProperty(k)) delete this._settings[k]; //remove invalid settings
    for (const k in defaults) if(!this._settings.hasOwnProperty(k)) this._settings[k] = defaults[k]; //assign missing defaults

    g.clear();
    Bangle.setUI("clock");
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    this.center_x = Bangle.appRect.w/2;
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
  }

  /**
   * draw given or current time from date
   * overwatch timezone changes
   * schedules itself to update
   */
  drawTime(){
    d=this.date ? this.date : new Date();
    console.log("drawTime", d);
    const Y=Bangle.appRect.y+this.DATE_FONT_SIZE()+10;

    d=d?d :new Date();

    g.setFontAlign(0, -1);
    g.setFont("Vector", this.TIME_FONT_SIZE());
    g.setColor(g.theme.fg);
    g.clearRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+this.TIME_FONT_SIZE()-7);
    g.drawString(("0" + require("locale").time(d, 1)).slice(-5), this.center_x, Y);
    //.drawRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+this.TIME_FONT_SIZE()-7); //DEV-Option

    setTimeout(this.drawTime.bind(this), 60000-(d.getSeconds()*1000)-d.getMilliseconds());
    if (this.TZOffset===undefined || this.TZOffset!==d.getTimezoneOffset())
      this.drawDateAndCal();
    this.TZOffset=d.getTimezoneOffset();
  }

  /**
   * draws given date and cal
   * @param{Date} d provide date or uses today
   */
  drawDateAndCal(){
    d=this.date ? this.date : new Date();

    if (this.tOutD) //abort exisiting
      clearTimeout(this.tOutD);

    this.drawDate();
    this.drawCal();
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
    console.log(this.settings().showDate);
    if (this.settings().showDate!=="n");
      for (let c of this.settings().showDate) { //add part as configured
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
          case "y":{ //year e.g. 2022
            render=true;
            dateStr+=d.getFullYear();
            break;
          }
          case "w":{ //week e.g. #02
            dateStr+=("0"+this.ISO8601calWeek(d)).slice(-2);
            break;
          }
          default: //append c
            dateStr+=c;
            render=dateStr.length>0; 
            break; //noop
        }
      }
    if (render){
      g.clearRect(Bangle.appRect.x, Y, Bangle.appRect.x2, Y+FONT_SIZE-3);
      g.setFont("Vector", FONT_SIZE);
      g.setColor(g.theme.fg);
      g.setFontAlign(0, -1);
      g.drawString(dateStr,this.center_x,Y);
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
    const CAL_AREA_H=Bangle.appRect.h-CAL_Y-24; //0,24,48 no,1,2 widget lines
    const CELL_W=Bangle.appRect.w/7; //cell width
    const CELL_H=(CAL_AREA_H-DAY_NAME_FONT_SIZE)/3; //cell heigth
    const DAY_NUM_FONT_SIZE=Math.min(CELL_H-1,15); //size down, max 15
  
    g.clearRect(Bangle.appRect.x, CAL_Y, Bangle.appRect.x2, CAL_Y+CAL_AREA_H);

    var dNames=[];
    if (require("locale") && require("locale").abday)
      dNames=require("locale").abday.map((a) => a.length>2 ? a.substr(0, 2) : a ); //retrieve from locale and force max 2 chars
    else
      dNames=["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]; //fallback

    g.setFont("Vector", DAY_NAME_FONT_SIZE);
    g.setColor(g.theme.fg);
    g.setFontAlign(-1, -1);

    //draw grid & Headline
    for(var dNo=0; dNo<dNames.length; dNo++){
      const dName=dNames[(dNo+this.settings().wdStrt)%7];
      g.drawString(dName, dNo*CELL_W+(CELL_W-g.stringWidth(dName))/2+2, CAL_Y+1); //center Names
      if(dNo>0)
        g.drawLine(dNo*CELL_W, CAL_Y, dNo*CELL_W, CAL_Y+CAL_AREA_H-1);
    }

    var nextY=CAL_Y+DAY_NAME_FONT_SIZE;

    for(i=0; i<3; i++){
      const y=nextY+i*CELL_H;
      g.drawLine(Bangle.appRect.x, y, Bangle.appRect.x2, y);
    }
    
    g.setFont("Vector", DAY_NUM_FONT_SIZE);
    
    //write days
    const todayDate=d.getDate();
    const days=7+(7+d.getDay()-this.settings().wdStrt)%7;//start day (week before=7 days + days in this week realtive to week start)
    var rD=new Date();
    rD.setDate(rD.getDate()-days);
    var rDate=rD.getDate();
    for(var y=0; y<3; y++){ 
      for(var x=0; x<dNames.length; x++){
        if(rDate===todayDate){ //today
          g.setColor(this.settings().todayMrkClr ? this.settings().todayMrkClr : g.theme.fg); //today marker color or fg color
          switch(this.settings().todayMrker){ //today marker
            case "c": 
              for(m=1; m<=this.settings().todayMrkPxl&&m<CELL_H-1&&m<CELL_W-1; m++)
                g.drawCircle(x*CELL_W+(CELL_W/2), nextY+(CELL_H*y)+(CELL_H/2), Math.min((CELL_W-m)/2, (CELL_H-m)/2));
              break;
            case "r": 
              for(m=1; m<=this.settings().todayMrkPxl&&m<CELL_H-1&&m<CELL_W-1; m++)
                g.drawRect(x*CELL_W+m, nextY+CELL_H+m, x*CELL_W+CELL_W-m, nextY+CELL_H+CELL_H-m);
              break;
            case "f":
              g.fillRect(x*CELL_W+1, nextY+CELL_H+1, x*CELL_W+CELL_W-1, nextY+CELL_H+CELL_H-1);
              break;
            default:
              break;
          }
          g.setColor(this.settings().todayNumClr ? this.settings().todayNumClr : g.theme.fg); //today color or fg color
        }else if(this.settings().suColor && rD.getDay()==0){ //sundays
          g.setColor(this.settings().suColor);
        }else{ //default
          g.setColor(g.theme.fg);
        }
        g.drawString(rDate, x*CELL_W+((CELL_W-g.stringWidth(rDate))/2)+2, nextY+((CELL_H-DAY_NUM_FONT_SIZE+2)/2)+(CELL_H*y));
        rD.setDate(rDate+1);
        rDate=rD.getDate();
      }
    }
    if (this.settings().calBorder) {
      g.setColor(g.theme.fg);
      g.drawRect(Bangle.appRect.x, CAL_Y, Bangle.appRect.x2, CAL_Y+CAL_AREA_H-1);
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

//Copy above the src code of clock-app and load via espruino WEB IDE

/**
 * Severity for logging
 */
 const LogSeverity={
  DEBUG:      5,
  INFO:       4,
  WARNING:    3,
  ERROR:      2,
  EXCEPTION:  1
}

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
      functionNames: ["required, <function under test>", "..."],
      cases: [
        { 
          value:            "required,<settingValue>",
          beforeTxt:        "optional,<textToDisplayBeforeTest>",
          beforeExpression: "optional,<expressionExpectedTrue>",
          afterText:        "optional,<textToDisplayAfterTest>",
          afterExpression:  "optional,<expressionExpectedTrue>"
        }
      ]
    }
  }

  constructor(data){

    this._validate(data);

    this.setting = data.setting;
    this.methodNames = data.functionNames;
    this.cases = data.cases.map((entry) => {
      return {
        value:              entry.value,
        beforeTxt:          entry.beforeTxt||"",
        beforeExpression:   entry.beforeExpression||true,
        afterTxt:           entry.afterTxt||"",
        afterExpression:    entry.afterExpression||true
      };
    });
  }

  /**
   * validates the given data config
   */
  _validate(data){
    //validate given config
    if (!data.setting) throw new EmptyMandatoryError("setting", data, this.TEST_SETTING_SAMPLE());
    if (!data.cases instanceof Array || data.cases.length==0) throw new EmptyMandatoryError("cases", data, this.TEST_SETTING_SAMPLE());
    if (!data.functionNames instanceof Array || data.functionNames==0) throw new EmptyMandatoryError("functionNames", data, this.TEST_SETTING_SAMPLE());

    data.cases.forEach((entry,idx) => {
      if (!entry.value) throw new EmptyMandatoryError("cases["+idx+"].value", entry, this.TEST_SETTING_SAMPLE());
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
  addSetting(test) {
    this.tests.push(test);
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
    };
  }

  /**
   * global prepare
   */
  _init() {
    console.log(new Date(),">>init");
    this.currentTestNum=-1;
    this.currentCaseNum=-1;
  }
  
  /**
   * before each test
   */
  _beforeTest() {
    console.log(new Date(),">>test #" + this.currentTestNum);
  }

  /**
   * befor each testcase
   */
  _beforeCase() {
    console.log(new Date(),">>case #" + this.currentTestNum + "." + this.currentCaseNum + "/" + (this.currentTest.cases.length-1));
    if (this.currentTest instanceof TestSetting) {
      console.log(
        this.currentTest.setting + "="+this.currentCase.value+"\n"+
        this.currentCase.beforeTxt ? "testcase: " + this.currentCase.beforeTxt : ""
      );
    }
  }

  _runCase() {
    console.log(new Date(), ">>running...");
    var returns = [];
    this.currentTest.methodNames.forEach((methodName) => {
      var instance = eval("new " + this.oClass + "");
      console.log(instance);
      const method = instance[methodName];
      //console.log(">>"+this.oClass+"["+methodName+"]()");
      //if (typeof method !== "function")
      //  throw new InvalidMethodName(this.oClass, methodName);
      let settings={}; settings[this.currentTest.setting] = this.currentCase.value;
      returns.push(new TimeCalClock(new Date(), settings).drawDate());
      //returns.push(method());
      console.log("<<"+this.oClass+"["+methodName+"]()");
      g.dump()
    });
    
    //this._delay(1).then((result) => console.log(new Date(), "finished"));
    //g.dump(); 
    /*var testCaseNum=0;
    test.cases.forEach(testcase => { //execute test
      testcase.dates.forEach(date => { //spawn with each date
        testCaseNum++;
        E.showMessage(
          "="+testcase.value+"\n"
          +"expected: "+testcase.descr, 
          "#"+testCaseNum+": "+test.setting
        );
        this._delay(TESTCASE_MSG_TIMEOUT).then((r,e) => {
          const objUnderTest = new Object.create(this.ObjClass)(date, new Object()[test.setting]=test.value );
          objUnderTest.draw();
          this._delay(TESTCASE_RUN_TIMEOUT).then((r,e) => {
          });
        });
      });
    });*/
    console.log(new Date(), "<<...running");
  }

  _afterCase() {
    if (this.currentTest instanceof TestSetting) {
      if (this.currentCase.afterTxt.length>0) {
        console.log(
          "--EXPECTED: " + this.currentCase.afterTxt
        );
      }
    }
    console.log(new Date(), "<<case #" + this.currentTestNum + "." + this.currentCaseNum + "/" + (this.currentTest.cases.length-1));
  }

  _afterTest() {
    console.log(new Date(), "<<test #" + this.currentTestNum);
  }

  _exit() {
    console.log(new Date(), "<<exit");
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
      this.currentTestNum++;
      this.currentTest = this.tests[this.currentTestNum];
      return true;
    }
    return false;
  }

  _nextCase() {
    if (this.currentCaseNum>=-1 && (this.currentCaseNum+1)<this.currentTest.cases.length) {
      this.currentCaseNum++;
      this.currentCase = this.currentTest.cases[this.currentCaseNum];
      return true;
    }
    return false;
  }
}
/**
 * Settings
 */

const SHOW_DATE_TESTS =
  { 
    setting:       "showDate",
    functionNames: ["drawDate"],
    cases: [
      { value: "n",      beforeTxt:"No date display?",        afterTxt: "top area should be 'emtpy'",   params:[new Date()]                },
      { value: "l",      beforeTxt:"Locale date display?",    afterTxt: "date should be 06/05/1234",    params:[new Date(1234,5,6,7,8,9)]  },
      { value: "m",      beforeTxt:"Month shortname?",        afterTxt: "date should be Jun",           params:[new Date(1234,5,6,7,8,9)]  },
      { value: "m.y #w", beforeTxt:"Month short year week#",  afterTxt: "date should be Jun.1234 #23",  params:[new Date(1234,5,6,7,8,9)]  }
    ]
  };
bangleTestRunner = new BangleTestRunner("TimeCalClock", LogSeverity.INFO)
  .addSetting(new TestSetting(SHOW_DATE_TESTS))
  .execute();
  
/**
 * Clock
 */

 