// timeout used to update every minute
var drawTimeout;

// https://www.espruino.com/Bangle.js+Locale

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function wordsFromTime(h, m)
{

    // Tests
/*
// Example 12:00 = Twelve
//  h = 12;
//  m = 0;
  // Example 23:58 = Coming up to midnight
//  h = 23;
//  m = 58;  
  // Example 12:15 = Quarter past twelve
//  h = 12;
//  m = 15;
  // Example 04:16 = Just gone quarter past four
//  h = 16;
//  m = 16;
  // Example 01:00 = One at night
//  h = 1;
//  m = 0;
  // Example 17:01 = Just gone five in the afternoon
//  h = 17;
//  m = 1;
  // Example 05:25 = Twenty-five past five in the early hours
//  h = 23;
//  m = 33;
  // Example 22:33 = coming up to eleven at night
  // max 
  //words = "a little after twenty-five past four in the early hours";
//  h = 04;
//  m = 27;
*/
    
  
  const HOUR_WORD_ARRAY = [
  "midnight", "one", "two", "three", "four", "five", "six", "seven", 
  "eight", "nine", "ten", "eleven", "twelve", "one", "two", "three", 
  "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", 
  "midnight"];
  const PART_DAY_WORD_ARRAY = ["",
   " at night",
   " in the early hours",
   " in the early hours",
   " in the early hours",
   " in the early hours",
   " in the morning",
   " in the morning",
   " in the morning",
   " in the morning",
   " in the morning",
   " in the morning",
   "",
   " in the afternoon",
   " in the afternoon",
   " in the afternoon",
   " in the afternoon",
   " in the afternoon",
   " in the evening",
   " in the evening",
   " in the evening",
   " in the evening",
   " at night",
   " at night",
   ""];
  const MINUTES_ROUGH_ARRAY = ["",
  "five past ",
  "ten past ",
  "quarter past ",
  "twenty past ",
  "twenty-five past ",
  "half past ",
  "twenty-five to ",
  "twenty to ",
  "quarter to ",
  "ten to ",
  "five to ",
  ""];
  const MINUTES_ACCURATE_ARRAY = ["", "just gone ", "a little after ", "coming up to ", "almost "];

  var hourAdjusted = h;
  var words = " ", hourWord = " ", partDayWord = " ", minutesRough = " ", minutesAccurate = " ";

  // At 33 past the hours we start referign to the next hour
  if (m > 32) {
    hourAdjusted = (h+ 1) % 24;
  } else {
    hourAdjusted = h;
  }
  
  hourWord = HOUR_WORD_ARRAY[hourAdjusted];
  partDayWord = PART_DAY_WORD_ARRAY[Math.round(hourAdjusted)];
  minutesRough = MINUTES_ROUGH_ARRAY[Math.round((m + 0 ) / 5)];
  minutesAccurate = MINUTES_ACCURATE_ARRAY[m % 5]; 
  
  words = minutesAccurate + minutesRough + hourWord + partDayWord;
  words = words.charAt(0).toUpperCase() + words.slice(1);
  return words;
}

function wordsFromDayMonth(day, date, month)
{
  // Tests

// Example 12:00 = Twelve
//  New Year's Day
//  date = 1;
//  month = 0;
//  on the Ides of March
//  date = 15;
//  month = 2;
// , ERROR C Nonsense in BASIC
//  date = 1;
//  month = 3;
//  - O'Canada
//  date = 1;
//  month = 6;
//  -  on Halloween
//  date = 31;
//  month = 9;
//  -  Christmas Eve
//  date = 24;
//  month = 11;
//  -  Christmas Day
//  date = 25;
//  month = 11;
//  -  Boxing day
//  date = 26;
//  month = 11;
//  New Year's eve
//  date = 31;
//  month = 11;
//  longest
//  date = 29;
//  month = 10;
  
  
  const DAY_WORD_ARRAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const DATE_WORD_ARRAY = ["zero", "first", "second", "third", "fourth", "fifth", "sixth",  "seventh","eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth",   "fourteenth", "fifteenth","sixteenth",     "seventeenth",  "eighteenth",   "nineteenth",     "twentieth",     "twenty-first", "twenty-second", "twenty-third","twenty-fourth", "twenty-fifth", "twenty-sixth", "twenty-seventh", "twenty-eighth", "twenty-ninth", "thirtieth",     "thirty-first"];
  const MONTH_WORD_ARRAY = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var words = " ";
  words = DAY_WORD_ARRAY[day] + ", " + DATE_WORD_ARRAY[date] + " of " + MONTH_WORD_ARRAY[month];
  if ((date == 1) && (month == 0)) {
    words = "New Year's Day";
  } else if ((date == 15) && (month == 2)) {
    words = DAY_WORD_ARRAY[day] + " on the Ides of March";
  }  else if ((date == 1) && (month == 3)) {
    words = DAY_WORD_ARRAY[day] + ", ERROR C Nonsense in BASIC";
  } else if ((date == 1) && (month == 6)) {
    words = DAY_WORD_ARRAY[day] + "  - O'Canada";
  } else if ((date == 31) && (month == 9)) {
    words = DAY_WORD_ARRAY[day] + " - on Halloween";
  } else if ((date == 24) && (month == 11)) {
    words = "Christmas Eve";
  } else if ((date == 25) && (month == 11)) {
    words = "Christmas Day";
  } else if ((date == 26) && (month == 11)) {
    words = "Boxing Day";
  } else if ((date == 31) && (month == 11)) {
    words = "New Year's eve";
  } 
  return words;
}

function draw() {
  var x = g.getWidth()/2;
  var y = g.getHeight()/2;
  g.reset();
  
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  var day = d.getDay();
  var date = d.getDate();
  var month = d.getMonth();

  var timeStr = wordsFromTime(h,m);
  var dateStr = wordsFromDayMonth(day, date, month);
  
  // draw time
  g.setBgColor(g.theme.bg);
  g.setColor(g.theme.fg);
  g.clear();
  g.setFontAlign(0,0).setFont("Vector",24);
  g.drawString(g.wrapString(timeStr, g.getWidth()).join("\n"),x,y-24*0);
  // draw date
  
  g.setFontAlign(0,0).setFont("Vector",12);
  g.drawString(g.wrapString(dateStr, g.getWidth()).join("\n"),x,y+12*6);
  // queue draw in one minute
  queueDraw();
}

// Clear the screen once/, at startup
g.clear();
// draw immediately at first, queue update
draw();
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
