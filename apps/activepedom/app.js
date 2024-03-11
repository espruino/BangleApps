(() => {

  //Graph module, as long as modules are not added by the app loader
  Modules.addCached("graph",function(){exports.drawAxes=function(b,c,a){function h(a){return e+m*(a-t)/x}function l(a){return f+g-g*(a-n)/u}var k=a.padx||0,d=a.pady||0,t=-k,w=c.length+k-1,n=(void 0!==a.miny?a.miny:a.miny=c.reduce(function(a,b){return Math.min(a,b)},c[0]))-d;c=(void 0!==a.maxy?a.maxy:a.maxy=c.reduce(function(a,b){return Math.max(a,b)},c[0]))+d;a.gridy&&(d=a.gridy,n=d*Math.floor(n/d),c=d*Math.ceil(c/d));var e=a.x||0,f=a.y||0,m=a.width||b.getWidth()-(e+1),g=a.height||b.getHeight()-(f+1);a.axes&&(null!==a.ylabel&&
    (e+=6,m-=6),null!==a.xlabel&&(g-=6));a.title&&(f+=6,g-=6);a.axes&&(b.drawLine(e,f,e,f+g),b.drawLine(e,f+g,e+m,f+g));a.title&&(b.setFontAlign(0,-1),b.drawString(a.title,e+m/2,f-6));var x=w-t,u=c-n;u||(u=1);if(a.gridx){b.setFontAlign(0,-1,0);var v=a.gridx;for(d=Math.ceil((t+k)/v)*v;d<=w-k;d+=v){var r=h(d),p=a.xlabel?a.xlabel(d):d;b.setPixel(r,f+g-1);var q=b.stringWidth(p)/2;null!==a.xlabel&&r>q&&b.getWidth()>r+q&&b.drawString(p,r,f+g+2)}}if(a.gridy)for(b.setFontAlign(0,0,1),d=n;d<=c;d+=a.gridy)k=l(d),
  p=a.ylabel?a.ylabel(d):d,b.setPixel(e+1,k),q=b.stringWidth(p)/2,null!==a.ylabel&&k>q&&b.getHeight()>k+q&&b.drawString(p,e-5,k+1);b.setFontAlign(-1,-1,0);return{x:e,y:f,w:m,h:g,getx:h,gety:l}};exports.drawLine=function(b,c,a){a=a||{};a=exports.drawAxes(b,c,a);var h=!0,l;for(l in c)h?b.moveTo(a.getx(l),a.gety(c[l])):b.lineTo(a.getx(l),a.gety(c[l])),h=!1;return a};exports.drawBar=function(b,c,a){a=a||{};a.padx=1;a=exports.drawAxes(b,c,a);for(var h in c)b.fillRect(a.getx(h-.5)+1,a.gety(c[h]),a.getx(h+
    .5)-1,a.gety(0));return a}});

  const storage = require("Storage");
  const SETTINGS_FILE = 'activepedom.settings.json';
  var history = 86400000; // 28800000=8h 43200000=12h //86400000=24h

  //return setting
  function setting(key) {
    //define default settings
    const DEFAULTS = {
      'cMaxTime' : 1100,
      'cMinTime' : 240,
      'stepThreshold' : 30,
      'intervalResetActive' : 30000,
      'stepSensitivity' : 80,
      'stepGoal' : 10000,
      'stepLength' : 75,
    };
    if (!settings) { loadSettings(); }
    return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  //Convert ms to time
  function getTime(t)  {
    date = new Date(t);
    offset = date.getTimezoneOffset() / 60;
    //var milliseconds = parseInt((t % 1000) / 100),
    seconds = Math.floor((t / 1000) % 60);
    minutes = Math.floor((t / (1000 * 60)) % 60);
    hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    hours = hours - offset;
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }

  function getDate(t) {
    date = new Date(t*1);
    year = date.getFullYear();
    month = date.getMonth()+1; //month is zero-based
    day = date.getDate();
    month = (month < 10) ? "0" + month : month;
    day = (day < 10) ? "0" + day : day;
    return year + "-" + month + "-" + day;
  }

  //columns: 0=time, 1=stepsCounted, 2=active, 3=stepsTooShort, 4=stepsTooLong, 5=stepsOutsideTime
  function getArrayFromCSV(file, column) { 
    i = 0;
    array = [];
    now = new Date();
    while ((nextLine = file.readLine())) { //as long as there is a next line
      if(nextLine) {
        dataSplitted = nextLine.split(','); //split line, 
        diff = now - dataSplitted[0]; //calculate difference between now and stored time
        if (diff <= history) { //only entries from the last x ms
          array.push(dataSplitted[column]);
        }
      }
      i++;
    }
    return array;
  }

  function drawGraph() {
    //times
    // actives = getArrayFromCSV(csvFile, 2);
    // shorts = getArrayFromCSV(csvFile, 3);
    // longs = getArrayFromCSV(csvFile, 4);
    // outsides = getArrayFromCSV(csvFile, 5); //array.push(dataSplitted[5].slice(0,-1));
    now = new Date();
    month = now.getMonth() + 1;
    if (month < 10) month = "0" + month;
    filename = filename = "activepedom" + now.getFullYear() + month + now.getDate() + ".data";
    var csvFile = storage.open(filename, "r");
    times = getArrayFromCSV(csvFile, 0);
    first = getDate(times[0]) + " " + getTime(times[0]); //first entry in datafile
    last =  getDate (times[times.length-1]) + " " + getTime(times[times.length-1]); //last entry in datafile
    //free memory
    csvFile = undefined;
    times = undefined;

    //steps
    csvFile = storage.open(filename, "r");
    steps = getArrayFromCSV(csvFile, 1);
    first = first + " " + steps[0] + "/" + setting('stepGoal');
    last = last + " " + steps[steps.length-1] + "/" + setting('stepGoal');

    //define y-axis grid labels
    stepsLastEntry = steps[steps.length-1];
    // the labels on the y axis are fairly unreadable so minimise them
    if (stepsLastEntry < 1000) gridyValue = 500;
    if (stepsLastEntry >= 1000 && stepsLastEntry < 2000) gridyValue = 1000;
    if (stepsLastEntry >= 2000 && stepsLastEntry < 5000) gridyValue = 2000;
    if (stepsLastEntry >= 5000 && stepsLastEntry < 10000) gridyValue = 5000; 
    if (stepsLastEntry >= 10000 && stepsLastEntry < 20000) gridyValue = 10000;
    if (stepsLastEntry > 20000) gridyValue = 20000;

    // draw the chart
    g.clear();
    g.setFont("6x8", 2);
    g.setColor(1,1,1);
    require("graph").drawLine(g, steps, {
      //title: "Steps",
      axes : true,
      gridy : gridyValue,
      y : 60, //offset on screen
      x : 5, //offset on screen
    });

    // show steps and duration of the chart
    g.setFont("6x8", 2);
    g.setColor(0,1,0);
    g.drawString("steps", 30, 24);
    g.drawString(stepsLastEntry, 30, 44);
    g.drawString((history/3600000) + " hrs",  30, 64);

    //free memory from big variables
    allData = undefined;
    allDataFile = undefined;
    csvFile = undefined;
    times = undefined;
  }

  function getImage() {
    return require("heatshrink").decompress(atob("mEwwIGDvAEDgP+ApMD/4FVEZY1FABcP8AFDn/wAod/AocB//4AoUHAokPAokf5/8AocfAoc+j5HDvgFEvEf7+AAoP4AoJCC+E/54qCsE/wYkDn+AAos8AohZDj/AAohrEp4FEs5xEuJfDgF5Aon4GgYFBGgZOBnyJD+EeYgfgj4FEh6VD4AFDh+AAIJMCBoIFFLQQtBgYFCHIIFDjA3BC4I="));
  }

  function drawMenu() {
    var x = 100;
    var y = 24;
    //var stps ="-";
    var y_inc = 25;
    
    g.clear();
    g.setColor(1,1,1);
    g.drawImage(getImage(),0 ,60 , {scale:2} );
    g.setFont("6x8",2);

    // timespan
    g.setColor('#7f8c8d');
    g.setFontAlign(-1,0);
    g.drawString("Timespan", x, y, true);
    y += y_inc;
    g.setColor('#bdc3c7');
    g.drawString(history/1000/60/60 + " hrs" , x, y, true);

    // BTN1 info
    y += 2*y_inc;
    g.setColor('#7f8c8d');
    g.setFontAlign(-1,0);
    g.drawString("BTN1", x, y, true);
    y += y_inc;
    g.setColor('#bdc3c7');
    g.drawString("Timespan", x, y, true);

    // BTN2 info
    y += 2*y_inc;
    g.setColor('#7f8c8d');
    g.setFontAlign(-1,0);
    g.drawString("BTN2", x, y, true);
    y += y_inc;
    g.setColor('#bdc3c7');
    g.drawString("Draw", x, y, true);
  }
  
  setWatch(function() { //BTN1
    switch(history) {
      case 3600000 : //1h
        history = 14400000; //4h
        break;
      case 86400000 : //24
        history = 3600000; //1h
        break;
      default : 
        history = history + 14400000; //4h
        break;
    }
    drawMenu();
  }, BTN1, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() { //BTN2
    g.clear();
    g.setColor(1,1,1);
    g.setFont("6x8", 3);
    g.drawString ("Drawing...",30,60);
    drawGraph();
  }, BTN2, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() { //BTN3
  }, BTN3, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() { //BTN4
  }, BTN4, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() { //BTN5
  }, BTN5, {edge:"rising", debounce:50, repeat:true});

  //load settings
  let settings;
  function loadSettings() {
    settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  }

  drawMenu();
})();
