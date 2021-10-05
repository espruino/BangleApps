require("Font8x12").add(Graphics);

Graphics.prototype.setFontAudiowide = function () {
  var widths = atob("BxYfDBkYGhkZFRkZCA==");
  var font = atob("AAAAAAAAA8AAAAHgAAAB8AAAAHgAAAA4AAAAAAAAAAEAAAABgAAAA8AAAAPgAAAH8AAAB/gAAA/4AAAf+AAAH/AAAD/wAAA/4AAAf8AAAP/AAAD/gAAB/4AAAf8AAAD+AAAAfgAAADwAAAAcAAAAAAAAAAAAAAAAAAAAAAP/AAAH//AAB//8AAf//wAH///AA///4APwD/gB8A/8APgP/gB8D98AfAfvgD4H58AfB/PgD4Px8AfD8PgD4/h8AfH4PgD5+B8AP/wPgB/8B8AP/APgB/4D8AH8B/AA///4AD//+AAP//gAA//4AAB/8AAAAAAAAAAAAAAAAAAD4AAAAfAAAAD4AAAAfAAAAD///8Af///gD///8Af///gD///8AAAAAAAAAAAAAAAAAAAA/8AAAf/gD4H/8AfA//gD4P/8AfB+PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgB8Ph8AP/8PgB//B8AP/4PgA/+B8AD/gPgABgA8AAAAAAAAAAAAPA4HgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgB8Ph8AP///gB///8AH///AA///wAB//8AAAAAAAAAAAAB/8AAAf/4AAD//gAAf/8AAD//gAAf/8AAAAPgAAAB8AAAAPgAAAB8AAAAPgAAAB8AAAAPgAAAB8AAAAPgAAAB8AAAAPgAAP///gD///8Af///gD///8Af///gD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8B8Af/wPgD//B8Af/4PgD//h8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB//gD4H/8AfA//AAAD/4AAAP8AAAAAAAAAAAAAH//AAB//8AAf//wAH///AB///8AP58/gB8Ph8APh8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB//gD4H/8AAA//AAAD/4AAAP8AAAAAAAAAAAAD4AAAAfAAAAD4AAAAfAABgD4AA8AfAAPgD4AH8AfAD/gD4A/8AfAf/AD4P/gAfH/wAD5/8AAf/+AAD//AAAf/gAAD/4AAAf8AAAB+AAAAPAAAAAAAAAAAAAAAAAB/gAAAf+AAP//4AH///gA///8AP/+PgB//h8APh8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgB8Ph8AP/8PgB//h8AP///gA///8AD///AADz/4AAAP8AAAAMAAAAAAAAAAAAAB/gAAA/+AAAH/4AAB//B8AP/8PgB8Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8APh8PgB8Ph8APx8fgB///8AH///AAf//wAD//8AAH//AAAAAAAAAAAAAAAAAAAAAAAAAOAHgAD4A8AAfAPgAD4A8AAOAHAAAAAAA==");
  var scale = 1; // size multiplier for this font
  g.setFontCustom(font, 46, widths, 33+(scale<<8)+(1<<16));
};

function getBackgroundImage() {return require("heatshrink").decompress(atob("gMwyEgBAsAgQBCgcAggBCgsAgwBCg8AhABChMAhQBChcAhgBChsAhwBCh8AiEAiIBCiUAiYBCikAioBCi0Ai4BCjEAjIBCjUAjYBCjkAjoBCj0Aj4BBA"));}

Bangle.setLCDMode("doublebuffered");
g.clear();
g.setFont("Audiowide");
g.drawString("...",115,60);
g.flip();

LIST = 1;
INFORMATION = 2;
currentStage = LIST;

var stage = 3;
function getScheduleTable() {
  let schedule = [
    //Sunday

    //Monday:
    {cn: "Biblical Theology", dow:1, sh: 8, sm: 10, eh:9, em: 5, r:"207", t:"Mr. Besaw"},
    {cn: "English", dow:1, sh: 9, sm: 5, eh:10, em: 0, t:"Dr. Wong"},
    {cn: "Break", dow:1, sh: 10, sm: 0, eh:10, em: 10, t:""},
    {cn: "MS Robotics", dow:1, sh: 10, sm: 10, eh:11, em: 0, r:"211", t:"Mr. Broyles"},
    {cn: "MS Physical Education Boys", dow:1, sh: 11, sm: 0, eh:11, em: 50, r:"GYM", t:"Mr. Mendezona"},
    {cn: "Office Hours Besaw/Nunez", dow:1, sh: 11, sm: 50, eh:12, em: 25, r:"203", t:"Besaw/Nunez"},
    {cn: "Lunch", dow:1, sh: 12, sm: 25, eh:12, em: 50, r:"Commence or Advisory", t:""},
    {cn: "Activity Period", dow:1, sh: 12, sm: 50, eh:13, em: 0, r:"Outside", t:""},
    {cn: "Latin", dow:1, sh: 13, sm: 5, eh:14, em: 0, r:"208", t:"Mrs.Scrivner"},
    {cn: "Algebra 1", dow:1, sh: 14, sm: 0, eh:15, em: 0, r:"204", t:"Mr. Benson"},

    //Tuesday:
    {cn: "Logic", dow:2, sh: 8, sm: 10, eh:9, em: 0, r:"208", t:"Mrs.Scrivner"},
    {cn: "Algebra 1", dow:2, sh: 9, sm: 0, eh:10, em: 0, r:"204", t:"Mr. Benson"},
    {cn: "Chapel", dow:2, sh: 10, sm: 0, eh:10, em: 25, r:"Advisory", t:""},
    {cn: "Break", dow:2, sh: 10, sm: 25, eh:10, em: 35, r:"Outside", t:""},
    {cn: "Advisory Besaw", dow:2, sh: 10, sm: 35, eh:11, em: 0, r:"207", t:"Mr. Besaw"},
    {cn: "MS Robotics", dow:2, sh: 11, sm: 0, eh:11, em: 50, r:"211", t:"Mr. Broyles"},
    {cn: "Office Hours Besaw/Nunez", dow:2, sh: 11, sm: 50, eh:12, em: 25, r:"203", t:" Besaw/Nunez"},
    {cn: "Lunch", dow:2, sh: 12, sm: 25, eh:12, em: 50, r:"Commence or Advisory", t:""},
    {cn: "Activity Period", dow:2, sh: 12, sm: 50, eh:13, em: 5, r:"Outside", t:""},
    {cn: "Medieval Western Civilization", dow:2, sh: 13, sm: 5, eh:14, em: 0, r:"205", t:"Mr. Khule"},
    {cn: "Introductory Biology and Epidemiology", dow:2, sh: 14, sm: 0, eh:15, em: 0, r:"202", t:"Mrs. Brown"},

    //Wensday:
    {cn: "English", dow:3, sh: 9, sm: 0, eh:9, em: 55, r:"206", t:"Dr. Wong"},
    {cn: "Biblical Theology", dow:3, sh: 9, sm: 55, eh:10, em: 50, r:"207", t:"Mr. Besaw"},
    {cn: "Break", dow:3, sh: 10, sm: 50, eh:11, em: 0, r:"Outside", t:"_"},
    {cn: "MS Physical Education Boys", dow:3, sh: 11, sm: 0, eh:11, em: 50, r:"GYM", t:"Mr. Mendezona"},
    {cn: "Office Hours Besaw/Nunez", dow:3, sh: 11, sm: 50, eh:12, em: 25, r:"203", t:" Besaw/Nunez"},
    {cn: "Lunch", dow:3, sh: 12, sm: 25, eh:12, em: 50, r:"Commence or Advisory", t:""},
    {cn: "Activity Period", dow:2, sh: 12, sm: 50, eh:13, em: 0, r:"Outside", t:""},
    {cn: "Introductory Biology and Epidemiology", dow:3, sh: 13, sm: 0, eh:14, em: 0, r:"202", t:"Mrs. Brown"},
    {cn: "Medieval Western Civilization", dow:3, sh: 14, sm: 0, eh:15, em: 0, r:"205", t:"Mr. Khule"},


    //Thursday:
    {cn: "Algebra 1", dow:4, sh: 8, sm: 10, eh:9, em: 5, r:"204", t:"Mr. Benson"},
    {cn: "Latin", dow:4, sh: 9, sm: 5, eh:10, em: 0, r:"208", t:"Mrs.Scrivner"},
    {cn: "Break", dow:4, sh: 10, sm: 0, eh:10, em: 10, r:"Outside", t:""},
    {cn: "MS Robotics", dow:4, sh: 10, sm: 10, eh:11, em: 0, r:"211", t:"Mr. Broyles"},
    {cn: "Advisory Besaw", dow:4, sh: 11, sm: 50, eh:12, em: 25, r:"207", t:"Mr. Besaw"},
    {cn: "Lunch", dow:4, sh: 12, sm: 25, eh:12, em: 50, r:"Commence or Advisory", t:""},
    {cn: "Activity Period", dow:4, sh: 12, sm: 50, eh:13, em: 0, r:"Outside", t:""},
    {cn: "Biblical Theology", dow:4, sh: 13, sm: 5, eh:14, em: 0, r:"207", t:"Mr. Besaw"},
    {cn: "English", dow:4, sh: 14, sm: 0, eh:15, em: 0, r:"206", t:"Dr. Wong"},

    //Friday:
    {cn: "Medieval Western Civilization", dow:5, sh: 8, sm: 10, eh:9, em: 5, r:"205", t:"Mr. Khule"},
    {cn: "Introductory Biology and Epidemiology", dow:5, sh: 9, sm: 5, eh:10, em: 0, r:"202", t:"Mrs. Brown"},
    {cn: "Break", dow:5, sh: 10, sm: 0, eh:10, em: 10, dr:"Outside", t:""},
    {cn: "MS Robotics", dow:5, sh: 10, sm: 10, eh:11, em: 0, r:"211", t:"Mr. Broyles"},
    {cn: "Office Hours Besaw/Nunez", dow:5, sh: 11, sm: 50, eh:12, em: 25, r:"203", t:" Besaw/Nunez"},
    {cn: "Lunch", dow:5, sh: 12, sm: 25, eh:12, em: 50, r:"Commence or Advisory", t:""},
    {cn: "Activity Period", dow:5, sh: 12, sm: 50, eh:13, em: 0, r:"Outside", t:""},
    {cn: "Algebra 1", dow:5, sh: 13, sm: 5, eh:14, em: 0, r:"204", t:"Mr. Benson"},
    {cn: "Logic", dow:5, sh: 14, sm: 0, eh:15, em: 0, r:"208", t:"Mrs.Scrivner"},
    //Sataturday:
  ];
  return schedule;
}

function processDay() {
  var schedule = getScheduleTable();
  var currentDate = new Date();
  var currentDayOfWeek = 2;//currentDate.getDay();
  var currentHour = 9;//currentDate.getHours();
  var currentMinute = 30;//currentDate.getMinutes();
  var minofDay = (currentHour*60)+currentMinute;
  var i;
  var currentPositon;
  for(i = 0;i<schedule.length;i++){
    currentPositon = i;
    if(schedule[i].dow == currentDayOfWeek){
      if(minofDay >= (schedule[i].sh*60+schedule[i].sm) && minofDay < (schedule[i].eh*60+schedule[i].em) ){
        return currentPositon;
      }
    }
  }
  return null;
}


var currentPositionTable = 0;
var numberOfItemsShown = 5;

function logDebug(message) {console.log(message);}

function updateMinutesToCurrentTime(currentMinuteFunction) {
  if (currentMinuteFunction<10){
   currentMinuteUpdatedFunction = "0"+currentMinuteFunction;
  }else{
   currentMinuteUpdatedFunction = currentMinuteFunction;
  }
  return currentMinuteUpdatedFunction;
}

function updateHoursToCurrentTime(currentHourFunction) {
  if(currentHourFunction >= 13){
    currentHourUpdatedFunction = currentHourFunction-12;
  }else{
    currentHourUpdatedFunction = currentHourFunction;
  }
  return currentHourUpdatedFunction;
}



function RedRectDown() {
  if(currentPositionTable > 0){
    currentPositionTable -= 1;
    displayClock();
  }
}

function RedRectUp() {
  if(currentPositionTable < numberOfItemsShown){
    currentPositionTable += 1;
    displayClock();
  }
}

function changeScene(){
  if(currentStage == INFORMATION){
    currentStage = LIST;
  }else if(currentStage == LIST){
    currentStage = INFORMATION;
  }
displayClock();
}

function displayClock() {
  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay();
  var currentHour = currentDate.getHours();
  var currentMinute = currentDate.getMinutes();
  var currentMinuteUpdated;
  var currentHourUpdated;
  currentMinuteUpdated = updateMinutesToCurrentTime(currentMinute);
  currentHourUpdated = updateHoursToCurrentTime(currentHour);
  g.setColor(255,255,255);
  g.setFont("Audiowide");
  g.clear();
  var foundNumber = processDay();
  var foundSchedule = getScheduleTable();
  var scheduleHourUpdated;
  var scheduleMinuteUpdated;
  for(var i = 0;i<=240;i++){
    g.drawImage(getBackgroundImage(),i,120,{scale:5,rotate:0});
  }
  g.drawString(currentHourUpdated+":"+currentMinuteUpdated, 150, 0);
  if(currentStage == LIST){
    for(var x = 0;x<=numberOfItemsShown;x++){
      scheduleMinuteUpdatedStart = updateMinutesToCurrentTime(foundSchedule[((foundNumber-2)+x)].sm);
      scheduleHourUpdatedStart = updateHoursToCurrentTime(foundSchedule[((foundNumber-2)+x)].sh);
      scheduleMinuteUpdatedEnd = updateMinutesToCurrentTime(foundSchedule[((foundNumber-2)+x)].em);
      scheduleHourUpdatedEnd = updateHoursToCurrentTime(foundSchedule[((foundNumber-2)+x)].eh);
      g.setColor(255,255,255);
      g.drawRect(10,30+(x*20),230,50+(20*x));
      g.reset();
      g.setFont("8x12");
      g.drawString(scheduleHourUpdatedStart+":"+scheduleMinuteUpdatedStart+"-"+scheduleHourUpdatedEnd+":"+scheduleMinuteUpdatedEnd+" "+foundSchedule[((foundNumber-2)+x)].cn,13,35+(x*20));
      g.setColor(255,0,0);
      g.drawRect(10,30+(currentPositionTable*20),230,50+(20*currentPositionTable));
    }
  }else if(currentStage == INFORMATION){
    scheduleMinuteUpdatedStart = updateMinutesToCurrentTime(foundSchedule[((foundNumber-2)+currentPositionTable)].sm);
    scheduleHourUpdatedStart = updateHoursToCurrentTime(foundSchedule[((foundNumber-2)+currentPositionTable)].sh);
    scheduleMinuteUpdatedEnd = updateMinutesToCurrentTime(foundSchedule[((foundNumber-2)+currentPositionTable)].em);
    scheduleHourUpdatedEnd = updateHoursToCurrentTime(foundSchedule[((foundNumber-2)+currentPositionTable)].eh);
    g.setColor(255,255,255);
    g.reset();
    g.setFont("8x12");
    g.drawString(foundSchedule[((foundNumber-2)+currentPositionTable)].cn,13,30);
  }
  g.flip();
}

var currentMinuteUpdatedFunction = "00";
var currentHourUpdatedFunction = 11;
var scheduleMinuteUpdatedStart = 35;
var scheduleHourUpdatedStart = 10;
var scheduleMinuteUpdatedEnd = currentMinuteUpdatedFunction;
var scheduleHourUpdatedEnd = 11;

setWatch(RedRectUp, D23, { repeat:true, edge:'rising', debounce : 50 });
setWatch(RedRectDown, D24, { repeat:true, edge:'rising', debounce : 50 });
setWatch(changeScene, BTN2, { repeat:true, edge:'rising', debounce : 50 });

displayClock();

setInterval(displayClock, 5000);
