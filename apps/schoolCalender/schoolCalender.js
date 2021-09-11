
require("FontTeletext5x9Mode7").add(Graphics);
Bangle.setLCDMode();

let schedule = [
  //Sunday

  //Monday:
  {className: "Biblical Theology", dayOfWeek:1, startingTimeHour: 8, startingTimeMinute: 10, endingTimeHour:9, endingTimeMinute: 5, description:"Biblical Theology 7B 3B Mr. Besaw • Block 3B • M207", roomNumber:"207", teacher:"Mr. Besaw"},
  {className: "English", dayOfWeek:1, startingTimeHour: 9, startingTimeMinute: 5, endingTimeHour:10, endingTimeMinute: 0, description:"English 7B 4B Dr. Wong • Block 4B • M206", teacher:"Dr. Wong"},
  {className: "Break", dayOfWeek:1, startingTimeHour: 10, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 10, description:"Break MF MS", teacher:""},
  {className: "MS Robotics", dayOfWeek:1, startingTimeHour: 10, startingTimeMinute: 10, endingTimeHour:11, endingTimeMinute: 0, description:"MS Robotics S1A Mr. Broyles • MS MF Elective Block A • M211", roomNumber:"211", teacher:"Mr. Broyles"},
  {className: "MS Physical Education Boys", dayOfWeek:1, startingTimeHour: 11, startingTimeMinute: 0, endingTimeHour:11, endingTimeMinute: 50, description:"MS Physical Education Boys S1B Mr. Mendezona • MS   MF Elective Block B • Gym", roomNumber:"GYM", teacher:"Mr. Mendezona"},
  {className: "Office Hours Besaw/Nunez", dayOfWeek:1, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Office Hours Besaw/Nunez Mr. Besaw, Dr. Nunez, Mrs.McDonough, Mr. Pettit • Office Hours MF MS   • M203", roomNumber:"203", teacher:"Besaw/Nunez"},
  {className: "Lunch", dayOfWeek:1, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
  {className: "Activity Period", dayOfWeek:1, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 0, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
  {className: "Latin", dayOfWeek:1, startingTimeHour: 13, startingTimeMinute: 5, endingTimeHour:14, endingTimeMinute: 0, description:"Latin 7B 5B Mrs. Scrivner • Block 5B • M208", roomNumber:"208", teacher:"Mrs.Scrivner"},
  {className: "Algebra 1", dayOfWeek:1, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"Algebra 1 7B 6B Mr. Benson • Block 6B • M204", roomNumber:"204", teacher:"Mr. Benson"},

  //Tuesday:
  {className: "Logic", dayOfWeek:2, startingTimeHour: 8, startingTimeMinute: 10, endingTimeHour:9, endingTimeMinute: 0, description:"Logic 7B 5B Mrs. Scrivner • Block 5B • M208", roomNumber:"208", teacher:"Mrs.Scrivner"},
  {className: "Algebra 1", dayOfWeek:2, startingTimeHour: 9, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 0, description:"Algebra 1 7B 6B Mr. Benson • Block 6B • M204", roomNumber:"204", teacher:"Mr. Benson"},
  {className: "Chapel", dayOfWeek:2, startingTimeHour: 10, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 25, description:"Chapel MF MS", roomNumber:"Advisory", teacher:""},
  {className: "Break", dayOfWeek:2, startingTimeHour: 10, startingTimeMinute: 25, endingTimeHour:10, endingTimeMinute: 35, description:"Break MF MS", roomNumber:"Outside", teacher:""},
  {className: "Advisory Besaw", dayOfWeek:2, startingTimeHour: 10, startingTimeMinute: 35, endingTimeHour:11, endingTimeMinute: 0, description:"Advisory Besaw Mr. Besaw • Advisory MF MS • M207", roomNumber:"207", teacher:"Mr. Besaw"},
  {className: "MS Robotics", dayOfWeek:2, startingTimeHour: 11, startingTimeMinute: 0, endingTimeHour:11, endingTimeMinute: 50, description:"MS Robotics S1A Mr. Broyles • MS MF Elective Block A • M211", roomNumber:"211", teacher:"Mr. Broyles"},
  {className: "Office Hours Besaw/Nunez", dayOfWeek:2, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Office Hours Besaw/Nunez Mr. Besaw, Dr. Nunez, Mrs.McDonough, Mr. Pettit • Office Hours MF MS   • M203", roomNumber:"203", teacher:" Besaw/Nunez"},
  {className: "Lunch", dayOfWeek:2, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
  {className: "Activity Period", dayOfWeek:2, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 5, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
  {className: "Medieval Western Civilization", dayOfWeek:2, startingTimeHour: 13, startingTimeMinute: 5, endingTimeHour:14, endingTimeMinute: 0, description:"Medieval Western Civilization 7B 1B Mr. Kuhle   • Block 1B • M205", roomNumber:"205", teacher:"Mr. Khule"},
  {className: "Introductory Biology and Epidemiology", dayOfWeek:2, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"Introductory Biology and Epidemiology   7B 2B Mrs. Brown • Block 2B • M202", roomNumber:"202", teacher:"Mrs. Brown"},

  //Wensday:
  {className: "English", dayOfWeek:3, startingTimeHour: 9, startingTimeMinute: 0, endingTimeHour:9, endingTimeMinute: 55, description:"English 7B 4B Dr. Wong • Block 4B • M206", roomNumber:"206", teacher:"Dr. Wong"},
  {className: "Biblical Theology", dayOfWeek:3, startingTimeHour: 9, startingTimeMinute: 55, endingTimeHour:10, endingTimeMinute: 50, description:"Biblical Theology 7B 3B Mr. Besaw • Block 3B • M207", roomNumber:"207", teacher:"Mr. Besaw"},
  {className: "Break", dayOfWeek:3, startingTimeHour: 10, startingTimeMinute: 50, endingTimeHour:11, endingTimeMinute: 0, description:"Break MF MS", roomNumber:"Outside", teacher:""},
  {className: "MS Physical Education Boys", dayOfWeek:3, startingTimeHour: 11, startingTimeMinute: 0, endingTimeHour:11, endingTimeMinute: 50, description:"MS Physical Education Boys S1B Mr. Mendezona • MS   MF Elective Block B • Gym", roomNumber:"GYM", teacher:"Mr. Mendezona"},
  {className: "Office Hours Besaw/Nunez", dayOfWeek:3, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Office Hours Besaw/Nunez Mr. Besaw, Dr. Nunez, Mrs.McDonough, Mr. Pettit • Office Hours MF MS   • M203", roomNumber:"203", teacher:" Besaw/Nunez"},
  {className: "Lunch", dayOfWeek:3, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
  {className: "Activity Period", dayOfWeek:2, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 0, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
  {className: "Introductory Biology and Epidemiology", dayOfWeek:3, startingTimeHour: 13, startingTimeMinute: 0, endingTimeHour:14, endingTimeMinute: 0, description:"Introductory Biology and Epidemiology   7B 2B Mrs. Brown • Block 2B • M202", roomNumber:"202", teacher:"Mrs. Brown"},
  {className: "Medieval Western Civilization", dayOfWeek:3, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"Medieval Western Civilization 7B 1B Mr. Kuhle   • Block 1B • M205", roomNumber:"205", teacher:"Mr. Khule"},

  //Thursday:
  {className: "Algebra 1", dayOfWeek:4, startingTimeHour: 8, startingTimeMinute: 10, endingTimeHour:9, endingTimeMinute: 5, description:"Algebra 1 7B 6B Mr. Benson • Block 6B • M204", roomNumber:"204", teacher:"Mr. Benson"},
  {className: "Latin", dayOfWeek:4, startingTimeHour: 9, startingTimeMinute: 5, endingTimeHour:10, endingTimeMinute: 0, description:"Latin 7B 5B Mrs. Scrivner • Block 5B • M208", roomNumber:"208", teacher:"Mrs.Scrivner"},
  {className: "Break", dayOfWeek:4, startingTimeHour: 10, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 10, description:"Break MF MS", roomNumber:"Outside", teacher:""},
  {className: "MS Robotics", dayOfWeek:4, startingTimeHour: 10, startingTimeMinute: 10, endingTimeHour:11, endingTimeMinute: 0, description:"MS Robotics S1A Mr. Broyles • MS MF Elective Block A • M211", roomNumber:"211", teacher:"Mr. Broyles"},
  {className: "Advisory Besaw", dayOfWeek:4, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Advisory Besaw Mr. Besaw • Advisory MF MS • M207", roomNumber:"207", teacher:"Mr. Besaw"},
  {className: "Lunch", dayOfWeek:4, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
  {className: "Activity Period", dayOfWeek:4, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 0, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
  {className: "Biblical Theology", dayOfWeek:4, startingTimeHour: 13, startingTimeMinute: 5, endingTimeHour:14, endingTimeMinute: 0, description:"Biblical Theology 7B 3B Mr. Besaw • Block 3B • M207", roomNumber:"207", teacher:"Mr. Besaw"},
  {className: "English", dayOfWeek:4, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"English 7B 4B Dr. Wong • Block 4B • M206", roomNumber:"206", teacher:"Dr. Wong"},

  //Friday:
  {className: "Medieval Western Civilization", dayOfWeek:5, startingTimeHour: 8, startingTimeMinute: 10, endingTimeHour:9, endingTimeMinute: 5, description:"Medieval Western Civilization 7B 1B Mr. Kuhle   • Block 1B • M205", roomNumber:"205", teacher:"Mr. Khule"},
  {className: "Introductory Biology and Epidemiology", dayOfWeek:5, startingTimeHour: 9, startingTimeMinute: 5, endingTimeHour:10, endingTimeMinute: 0, description:"Introductory Biology and Epidemiology   7B 2B Mrs. Brown • Block 2B • M202", roomNumber:"202", teacher:"Mrs. Brown"},
  {className: "Break", dayOfWeek:5, startingTimeHour: 10, startingTimeMinute: 0, endingTimeHour:10, endingTimeMinute: 10, description:"Break MF MS", roomNumber:"Outside", teacher:""},
  {className: "MS Robotics", dayOfWeek:5, startingTimeHour: 10, startingTimeMinute: 10, endingTimeHour:11, endingTimeMinute: 0, description:"MS Robotics S1A Mr. Broyles • MS MF Elective Block A • M211", roomNumber:"211", teacher:"Mr. Broyles"},
  {className: "Office Hours Besaw/Nunez", dayOfWeek:5, startingTimeHour: 11, startingTimeMinute: 50, endingTimeHour:12, endingTimeMinute: 25, description:"Office Hours Besaw/Nunez Mr. Besaw, Dr. Nunez, Mrs.McDonough, Mr. Pettit • Office Hours MF MS   • M203", roomNumber:"203", teacher:" Besaw/Nunez"},
  {className: "Lunch", dayOfWeek:5, startingTimeHour: 12, startingTimeMinute: 25, endingTimeHour:12, endingTimeMinute: 50, description:"Lunch MF MS", roomNumber:"Commence or Advisory", teacher:""},
  {className: "Activity Period", dayOfWeek:5, startingTimeHour: 12, startingTimeMinute: 50, endingTimeHour:13, endingTimeMinute: 0, description:"Activity Period MF MS", roomNumber:"Outside", teacher:""},
  {className: "Algebra 1", dayOfWeek:5, startingTimeHour: 13, startingTimeMinute: 5, endingTimeHour:14, endingTimeMinute: 0, description:"Algebra 1 7B 6B Mr. Benson • Block 6B • M204", roomNumber:"204", teacher:"Mr. Benson"},
  {className: "Logic", dayOfWeek:5, startingTimeHour: 14, startingTimeMinute: 0, endingTimeHour:15, endingTimeMinute: 0, description:"Logic 7B 5B Mrs. Scrivner • Block 5B • M208", roomNumber:"208", teacher:"Mrs.Scrivner"},

  //Sataturday:
];

function logDebug(message){
  //console.log(message);
}

var NEXTCLASS = 1;
var CURRRENTCLASS = 2;
var NEXTNEXTCLASS = 3;
var BEHINDCLASS = 4;
var BEHINDBEHINDCLASS = 5;
var NEXTNEXTNEXTCLASS = 6;
var stage = CURRRENTCLASS;
function draw(){

  g.setColor(3280);
  g.fillRect(15,15,225,225);
  if(stage == CURRRENTCLASS){
    g.setColor(211);
    g.fillRect(20,20,215,160);
    g.setColor(0,0,0);
    g.setFont("Teletext5x9Mode7", 2.1);
    g.drawString("Current Class:", 25, 23);
    g.drawString(processDay().className, 25, 50);
    g.drawString("Room: "+processDay().roomNumber, 25, 80);
    g.setFont("Teletext5x9Mode7", 2);
    g.drawString("Teacher: ", 25, 110);
    g.drawString(processDay().teacher, 25, 130);
  }
  if(stage == NEXTCLASS){
    g.setColor(211);
    g.fillRect(20,20,215,160);
    g.setColor(0,0,0);
    g.setFont("Teletext5x9Mode7", 2.1);
    g.drawString("Current Class:", 25, 23);
    g.drawString(processDay().className, 25, 50);
    g.drawString("Room: "+processDay().roomNumber, 25, 80);
    g.setFont("Teletext5x9Mode7", 2);
    g.drawString("Teacher: ", 25, 110);
    g.drawString(processDay().teacher, 25, 130);
  }
}
//setInterval(draw, 100000000);

function processDay(){
  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay();
  var currentHour = 8;//currentDate.getHours();
  var currentMinute = 50;//currentDate.getMinutes();
  var minofDay = (currentHour*60)+currentMinute;
  for(let i = 0;i<schedule.length;i++){
    if(schedule[i].dayOfWeek == currentDayOfWeek){
      logDebug("DayOfWeek:"+schedule[i].dayOfWeek+", StartHour:"+ schedule[i].startingTimeHour +", EndHour:" + schedule[i].endingTimeHour + ", StartMinute:" + schedule[i].startingTimeMinute + ", EndMinute:" + schedule[i].endingTimeMinute);
      logDebug("Day of Week");
      logDebug("minuteOfDay:"+minofDay+", startMinuteOfDayOfClass:"+ (schedule[i].startingTimeHour*60+schedule[i].startingTimeMinute) + ", endMinuteOfDayOfClass:" + (schedule[i].endingTimeHour*60+schedule[i].endingTimeMinute));
      if(minofDay >= (schedule[i].startingTimeHour*60+schedule[i].startingTimeMinute) && minofDay < (schedule[i].endingTimeHour*60+schedule[i].endingTimeMinute) ){
          console.log("Match:" + schedule[i].className);
          return schedule[i];
      }
    }
  }
}


setWatch(() => {

}, BTN1, {repeat:true});

setWatch(() => {

}, BTN2, {repeat:true});

setWatch(() => {

}, BTN3, {repeat:true});

setWatch(() => {

}, BTN4, {repeat:true});

setWatch(() => {

}, BTN5, {repeat:true});

draw();
