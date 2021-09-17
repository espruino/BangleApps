require("FontTeletext5x9Mode7").add(Graphics);
Bangle.setLCDMode();

function getBackgroundImage() {
  return require("heatshrink").decompress(atob("gMwyEgBAsAgQBCgcAggBCgsAgwBCg8AhABChMAhQBChcAhgBChsAhwBCh8AiEAiIBCiUAiYBCikAioBCi0Ai4BCjEAjIBCjUAjYBCjkAjoBCj0Aj4BBA"));
}

Graphics.prototype.setFontAudiowide = function() {
  // Actual height 33 (36 - 4)
  var widths = atob("BxYfDBkYGhkZFRkZCA==");
  var font = atob("AAAAAAAAA8AAAAHgAAAB8AAAAHgAAAA4AAAAAAAAAAEAAAABgAAAA8AAAAPgAAAH8AAAB/gAAA/4AAAf+AAAH/AAAD/wAAA/4AAAf8AAAP/AAAD/gAAB/4AAAf8AAAD+AAAAfgAAADwAAAAcAAAAAAAAAAAAAAAAAAAAAAP/AAAH//AAB//8AAf//wAH///AA///4APwD/gB8A/8APgP/gB8D98AfAfvgD4H58AfB/PgD4Px8AfD8PgD4/h8AfH4PgD5+B8AP/wPgB/8B8AP/APgB/4D8AH8B/AA///4AD//+AAP//gAA//4AAB/8AAAAAAAAAAAAAAAAAAD4AAAAfAAAAD4AAAAfAAAAD///8Af///gD///8Af///gD///8AAAAAAAAAAAAAAAAAAAA/8AAAf/gD4H/8AfA//gD4P/8AfB+PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgB8Ph8AP/8PgB//B8AP/4PgA/+B8AD/gPgABgA8AAAAAAAAAAAAPA4HgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgB8Ph8AP///gB///8AH///AA///wAB//8AAAAAAAAAAAAB/8AAAf/4AAD//gAAf/8AAD//gAAf/8AAAAPgAAAB8AAAAPgAAAB8AAAAPgAAAB8AAAAPgAAAB8AAAAPgAAAB8AAAAPgAAP///gD///8Af///gD///8Af///gD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8B8Af/wPgD//B8Af/4PgD//h8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB//gD4H/8AfA//AAAD/4AAAP8AAAAAAAAAAAAAH//AAB//8AAf//wAH///AB///8AP58/gB8Ph8APh8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB//gD4H/8AAA//AAAD/4AAAP8AAAAAAAAAAAAD4AAAAfAAAAD4AAAAfAABgD4AA8AfAAPgD4AH8AfAD/gD4A/8AfAf/AD4P/gAfH/wAD5/8AAf/+AAD//AAAf/gAAD/4AAAf8AAAB+AAAAPAAAAAAAAAAAAAAAAAB/gAAAf+AAP//4AH///gA///8AP/+PgB//h8APh8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgB8Ph8AP/8PgB//h8AP///gA///8AD///AADz/4AAAP8AAAAMAAAAAAAAAAAAAB/gAAA/+AAAH/4AAB//B8AP/8PgB8Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8AfB8PgD4Ph8APh8PgB8Ph8APx8fgB///8AH///AAf//wAD//8AAH//AAAAAAAAAAAAAAAAAAAAAAAAAOAHgAD4A8AAfAPgAD4A8AAOAHAAAAAAA==");
  var scale = 1; // size multiplier for this font
  g.setFontCustom(font, 46, widths, 33+(scale<<8)+(1<<16));
};

function logDebug(message){
  //console.log(message);
}

var NEXTCLASS = 4;
var CURRRENTCLASS = 3;
var NEXTNEXTCLASS = 5;
var BEHINDCLASS = 2;
var BEHINDBEHINDCLASS = 1;
var NEXTNEXTNEXTCLASS = 6;
var stage = 3;

function drawInfo(){
  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay();
  var currentHour = currentDate.getHours();
  var currentMinute = currentDate.getMinutes();
  var currentMinuteUpdated;
  var currentHourUpdated;
  if (currentMinute<10){
   currentMinuteUpdated = "0"+currentMinute;
  }else{
   currentMinuteUpdated = currentMinute;
  }if(currentHour >= 13){
    currentHourUpdated = currentHour-12;
  }else{
    currentHourUpdated = currentHour;
  }
  for(var i = 0;i<=240;i++){
    g.drawImage(getBackgroundImage(),i,120,{scale:5,rotate:0});
  }
  g.setColor(255,255,255);
  g.setFont("Audiowide");
  g.drawString(currentHourUpdated+":"+currentMinuteUpdated, 145, 16);
  g.setFont("Teletext5x9Mode7", 2);
  foundClass = processDay();
  if (foundClass.startingTimeMinute<10){
   classMinuteUpdated = "0"+foundClass.startingTimeMinute;
  }else{
   classMinuteUpdated = foundClass.startingTimeMinute;
  }
  if (foundClass.endingTimeMinute<10){
   classEndingMinuteUpdated = "0"+foundClass.endingTimeMinute;
  }else{
   classEndingMinuteUpdated = foundClass.endingTimeMinute;
  }if(foundClass.startingTimeHour >= 13){
    classHourUpdated = foundClass.startingTimeHour-12;
  }else{
    classHourUpdated = foundClass.startingTimeHour;
  }if(foundClass.endingTimeHour >= 13){
    classEndingHourUpdated = foundClass.endingTimeHour-12;
  }else{
    classEndingHourUpdated = foundClass.endingTimeHour;
  }
  switch (foundClass.dayOfWeek) {
  case 0:
    updatedDay = "Sun";
    break;
  case 1:
    updatedDay = "Mon";
    break;
  case 2:
    updatedDay = "Tue";
    break;
  case 3:
    updatedDay = "Wed";
    break;
  case 4:
    updatedDay = "Thur";
    break;
  case 5:
    updatedDay = "Fri";
    break;
  case 6:
    updatedDay = "Sat";
}
  if (foundClass != null) {
    g.drawString(classHourUpdated+":"+classMinuteUpdated+" - "+classEndingHourUpdated+":"+classEndingMinuteUpdated+" "+updatedDay, 25, 50);
    g.drawString(foundClass.className, 25, 80);
    g.drawString(foundClass.teacher, 25, 110);
    g.drawString(foundClass.roomNumber, 25, 140);
  }
}
setInterval(drawInfo, 60000);

function processDay(){
  let schedule = [
    //Sunday

    //Monday:
    {className: "Biblical Theology", dayOfWeek:1, startingTimeHour: 8, startingTimeMinute: 10, endingTimeHour:9, endingTimeMinute: 5, description:"Biblical Theology 7B 3B Mr. Besaw Block 3B M207", roomNumber:"207", teacher:"Mr. Besaw"},
    {className: "English", dayOfWeek:1, startingTimeHour: 9, startingTimeMinute: 5, endingTimeHour:10, endingTimeMinute: 0, description:"English 7B 4B Dr. Wong Block 4B M206", teacher:"Dr. Wong"},
    {className: "Break", dayOfWeek:1, startingTimeHour: 10, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 10, description:"Break MF MS", teacher:""},
    {className: "MS Robotics", dayOfWeek:1, startingTimeHour: 10, startingTimeMinute: 10, endingTimeHour:11, endingTimeMinute: 0, description:"MS Robotics S1A Mr. Broyles MS MF Elective Block A M211", roomNumber:"211", teacher:"Mr. Broyles"},
    {className: "MS Physical Education Boys", dayOfWeek:1, startingTimeHour: 11, startingTimeMinute: 0, endingTimeHour:11, endingTimeMinute: 50, description:"MS Physical Education Boys S1B Mr. Mendezona MS   MF Elective Block B Gym", roomNumber:"GYM", teacher:"Mr. Mendezona"},
    {className: "Office Hours Besaw/Nunez", dayOfWeek:1, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Office Hours Besaw/Nunez Mr. Besaw, Dr. Nunez, Mrs.McDonough, Mr. Pettit Office Hours MF MS M203", roomNumber:"203", teacher:"Besaw/Nunez"},
    {className: "Lunch", dayOfWeek:1, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
    {className: "Activity Period", dayOfWeek:1, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 0, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
    {className: "Latin", dayOfWeek:1, startingTimeHour: 13, startingTimeMinute: 5, endingTimeHour:14, endingTimeMinute: 0, description:"Latin 7B 5B Mrs. Scrivner Block 5B M208", roomNumber:"208", teacher:"Mrs.Scrivner"},
    {className: "Algebra 1", dayOfWeek:1, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"Algebra 1 7B 6B Mr. Benson Block 6B M204", roomNumber:"204", teacher:"Mr. Benson"},

    //Tuesday:
    {className: "Logic", dayOfWeek:2, startingTimeHour: 8, startingTimeMinute: 10, endingTimeHour:9, endingTimeMinute: 0, description:"Logic 7B 5B Mrs. Scrivner Block 5B M208", roomNumber:"208", teacher:"Mrs.Scrivner"},
    {className: "Algebra 1", dayOfWeek:2, startingTimeHour: 9, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 0, description:"Algebra 1 7B 6B Mr. Benson Block 6B M204", roomNumber:"204", teacher:"Mr. Benson"},
    {className: "Chapel", dayOfWeek:2, startingTimeHour: 10, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 25, description:"Chapel MF MS", roomNumber:"Advisory", teacher:""},
    {className: "Break", dayOfWeek:2, startingTimeHour: 10, startingTimeMinute: 25, endingTimeHour:10, endingTimeMinute: 35, description:"Break MF MS", roomNumber:"Outside", teacher:""},
    {className: "Advisory Besaw", dayOfWeek:2, startingTimeHour: 10, startingTimeMinute: 35, endingTimeHour:11, endingTimeMinute: 0, description:"Advisory Besaw Mr. Besaw Advisory MF MS M207", roomNumber:"207", teacher:"Mr. Besaw"},
    {className: "MS Robotics", dayOfWeek:2, startingTimeHour: 11, startingTimeMinute: 0, endingTimeHour:11, endingTimeMinute: 50, description:"MS Robotics S1A Mr. Broyles MS MF Elective Block A M211", roomNumber:"211", teacher:"Mr. Broyles"},
    {className: "Office Hours Besaw/Nunez", dayOfWeek:2, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Office Hours Besaw/Nunez Mr. Besaw, Dr. Nunez, Mrs.McDonough, Mr. Pettit Office Hours MF MS  M203", roomNumber:"203", teacher:" Besaw/Nunez"},
    {className: "Lunch", dayOfWeek:2, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
    {className: "Activity Period", dayOfWeek:2, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 5, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
    {className: "Medieval Western Civilization", dayOfWeek:2, startingTimeHour: 13, startingTimeMinute: 5, endingTimeHour:14, endingTimeMinute: 0, description:"Medieval Western Civilization 7B 1B Mr. Kuhle Block 1BM205", roomNumber:"205", teacher:"Mr. Khule"},
    {className: "Introductory Biology and Epidemiology", dayOfWeek:2, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"Introductory Biology and Epidemiology   7B 2B Mrs. Brown Block 2B M202", roomNumber:"202", teacher:"Mrs. Brown"},

    //Wensday:
    {className: "English", dayOfWeek:3, startingTimeHour: 9, startingTimeMinute: 0, endingTimeHour:9, endingTimeMinute: 55, description:"English 7B 4B Dr. Wong Block 4B M206", roomNumber:"206", teacher:"Dr. Wong"},
    {className: "Biblical Theology", dayOfWeek:3, startingTimeHour: 9, startingTimeMinute: 55, endingTimeHour:10, endingTimeMinute: 50, description:"Biblical Theology 7B 3B Mr. Besaw Block 3B M207", roomNumber:"207", teacher:"Mr. Besaw"},
    {className: "Break", dayOfWeek:3, startingTimeHour: 10, startingTimeMinute: 50, endingTimeHour:11, endingTimeMinute: 0, description:"Break MF MS", roomNumber:"Outside", teacher:""},
    {className: "MS Physical Education Boys", dayOfWeek:3, startingTimeHour: 11, startingTimeMinute: 0, endingTimeHour:11, endingTimeMinute: 50, description:"MS Physical Education Boys S1B Mr. Mendezona MS MF Elective Block B Gym", roomNumber:"GYM", teacher:"Mr. Mendezona"},
    {className: "Office Hours Besaw/Nunez", dayOfWeek:3, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Office Hours Besaw/Nunez Mr. Besaw, Dr. Nunez, Mrs.McDonough, Mr. Pettit Office Hours MF MS M203", roomNumber:"203", teacher:" Besaw/Nunez"},
    {className: "Lunch", dayOfWeek:3, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
    {className: "Activity Period", dayOfWeek:2, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 0, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
    {className: "Introductory Biology and Epidemiology", dayOfWeek:3, startingTimeHour: 13, startingTimeMinute: 0, endingTimeHour:14, endingTimeMinute: 0, description:"Introductory Biology and Epidemiology 7B 2B Mrs. Brown Block 2B M202", roomNumber:"202", teacher:"Mrs. Brown"},
    {className: "Medieval Western Civilization", dayOfWeek:3, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"Medieval Western Civilization 7B 1B Mr. Kuhle Block 1B M205", roomNumber:"205", teacher:"Mr. Khule"},

    //Thursday:
    {className: "Algebra 1", dayOfWeek:4, startingTimeHour: 8, startingTimeMinute: 10, endingTimeHour:9, endingTimeMinute: 5, description:"Algebra 1 7B 6B Mr. Benson Block 6B M204", roomNumber:"204", teacher:"Mr. Benson"},
    {className: "Latin", dayOfWeek:4, startingTimeHour: 9, startingTimeMinute: 5, endingTimeHour:10, endingTimeMinute: 0, description:"Latin 7B 5B Mrs. Scrivner Block 5B M208", roomNumber:"208", teacher:"Mrs.Scrivner"},
    {className: "Break", dayOfWeek:4, startingTimeHour: 10, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 10, description:"Break MF MS", roomNumber:"Outside", teacher:""},
    {className: "MS Robotics", dayOfWeek:4, startingTimeHour: 10, startingTimeMinute: 10, endingTimeHour:11, endingTimeMinute: 0, description:"MS Robotics S1A Mr. Broyles MS MF Elective Block A M211", roomNumber:"211", teacher:"Mr. Broyles"},
    {className: "Advisory Besaw", dayOfWeek:4, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Advisory Besaw Mr. Besaw Advisory MF MS M207", roomNumber:"207", teacher:"Mr. Besaw"},
    {className: "Lunch", dayOfWeek:4, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
    {className: "Activity Period", dayOfWeek:4, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 0, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
    {className: "Biblical Theology", dayOfWeek:4, startingTimeHour: 13, startingTimeMinute: 5, endingTimeHour:14, endingTimeMinute: 0, description:"Biblical Theology 7B 3B Mr. Besaw Block 3B M207", roomNumber:"207", teacher:"Mr. Besaw"},
    {className: "English", dayOfWeek:4, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"English 7B 4B Dr. Wong Block 4B M206", roomNumber:"206", teacher:"Dr. Wong"},

    //Friday:
    {className: "Medieval Western Civilization", dayOfWeek:5, startingTimeHour: 8, startingTimeMinute: 10, endingTimeHour:9, endingTimeMinute: 5, description:"Medieval Western Civilization 7B 1B Mr. Kuhle Block 1B M205", roomNumber:"205", teacher:"Mr. Khule"},
    {className: "Introductory Biology and Epidemiology", dayOfWeek:5, startingTimeHour: 9, startingTimeMinute: 5, endingTimeHour:10, endingTimeMinute: 0, description:"Introductory Biology and Epidemiology 7B 2B Mrs. Brown Block 2B M202", roomNumber:"202", teacher:"Mrs. Brown"},
    {className: "Break", dayOfWeek:5, startingTimeHour: 10, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 10, description:"Break MF MS", roomNumber:"Outside", teacher:""},
    {className: "MS Robotics", dayOfWeek:5, startingTimeHour: 10, startingTimeMinute: 10, endingTimeHour:11, endingTimeMinute: 0, description:"MS Robotics S1A Mr. Broyles MS MF Elective Block A M211", roomNumber:"211", teacher:"Mr. Broyles"},
    {className: "Office Hours Besaw/Nunez", dayOfWeek:5, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Office Hours Besaw/Nunez Mr. Besaw, Dr. Nunez, Mrs.McDonough, Mr. Pettit Office Hours MF MS M203", roomNumber:"203", teacher:" Besaw/Nunez"},
    {className: "Lunch", dayOfWeek:5, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
    {className: "Activity Period", dayOfWeek:5, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 0, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
    {className: "Algebra 1", dayOfWeek:5, startingTimeHour: 13, startingTimeMinute: 5, endingTimeHour:14, endingTimeMinute: 0, description:"Algebra 1 7B 6B Mr. Benson Block 6B M204", roomNumber:"204", teacher:"Mr. Benson"},
    {className: "Logic", dayOfWeek:5, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"Logic 7B 5B Mrs. Scrivner Block 5B M208", roomNumber:"208", teacher:"Mrs.Scrivner"},

    //Sataturday:
  ];

  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay();
  var currentHour = currentDate.getHours();
  var currentMinute = currentDate.getMinutes();
  var minofDay = (currentHour*60)+currentMinute;
  var i;
  var currentPositon;
  for(i = 0;i<schedule.length;i++){
    currentPositon = i;
    if(schedule[i].dayOfWeek == currentDayOfWeek){
      logDebug("DayOfWeek:"+schedule[i].dayOfWeek+", StartHour:"+ schedule[i].startingTimeHour +", EndHour:" + schedule[i].endingTimeHour + ", StartMinute:" + schedule[i].startingTimeMinute + ", EndMinute:" + schedule[i].endingTimeMinute);
      logDebug("Day of Week");
      logDebug("minuteOfDay:"+minofDay+", startMinuteOfDayOfClass:"+ (schedule[i].startingTimeHour*60+schedule[i].startingTimeMinute) + ", endMinuteOfDayOfClass:" + (schedule[i].endingTimeHour*60+schedule[i].endingTimeMinute));
      if(minofDay >= (schedule[i].startingTimeHour*60+schedule[i].startingTimeMinute) && minofDay < (schedule[i].endingTimeHour*60+schedule[i].endingTimeMinute) ){
        console.log("Match:" + schedule[i].className);
        console.log("stage:" + stage);
        if(stage == 3){
          return schedule[i];
        }else if(stage == 4 && ++currentPositon <= schedule.length){
          return schedule[currentPositon];
        }else if(stage == 5 && (currentPositon+=2) <= schedule.length){
          return schedule[currentPositon];
        }else if(stage == 6 && (currentPositon+=3) <= schedule.length){
          return schedule[currentPositon];
        }else if(stage == 2 && (currentPositon-=1) <= schedule.length){
          return schedule[currentPositon];
        }else if(stage == 1 && (currentPositon-=2) <= schedule.length){
          return schedule[currentPositon];
        }
      }
    }
  }
  return null;
}


setWatch(() => {
  if(stage<=1){
  }else{
    stage -= 1;
    drawInfo();
  }
}, BTN1, {repeat:true});

setWatch(() => {
}, BTN2, {repeat:true});

setWatch(() => {
  if(stage>=6){
  }else{
    stage += 1;
    drawInfo();
  }
}, BTN3, {repeat:true});

setWatch(() => {

}, BTN4, {repeat:true});

setWatch(() => {

}, BTN5, {repeat:true});

drawInfo();
