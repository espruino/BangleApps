/**
* Adrian Kirk 2021-02
* Sliding text clock inspired by the Pebble
* clock with the same name
*/


class ShiftText {
  /**
  * Class Responsible for shifting text around the screen
  *
  * This is a object that initializes itself with a position and
  * text after which you can tell it where you want to move to
  * using the moveTo method and it will smoothly move the text across
  * at the selected frame rate and speed
  */
  constructor(x,y,txt,font_name,
              font_size,speed_x,speed_y,freq_millis, color){
    this.x = x;
    this.tgt_x = x;
    this.init_x = x;
    this.y = y;
    this.tgt_y = y;
    this.init_y = y;
    this.txt = txt;
    this.init_txt = txt;
    this.font_name = font_name;
    this.font_size = font_size;
    this.speed_x = Math.abs(speed_x);
    this.speed_y = Math.abs(speed_y);
    this.freq_millis = freq_millis;
    this.colour = color;
    this.finished_callback=null;
    this.timeoutId = null;
  }
  reset(){
    this.hide();
    this.x = this.init_x;
    this.y = this.init_y;
    this.txt = this.init_txt;
    this.show();
    if(this.timeoutId != null){
       clearTimeout(this.timeoutId);
    }
  }
  show() {
    g.setFont(this.font_name,this.font_size);
    g.setColor(this.colour[0],this.colour[1],this.colour[2]);
    g.drawString(this.txt, this.x, this.y);
  }
  hide(){
    g.setFont(this.font_name,this.font_size);
    g.setColor(0,0,0);
    g.drawString(this.txt, this.x, this.y);
  }
  setText(txt){
    this.txt = txt;
  }
  setTextPosition(txt,x,y){
    this.hide();
    this.x = x;
    this.y = y;
    this.txt = txt;
    this.show();
  }
  setTextXPosition(txt,x){
    this.hide();
    this.x = x;
    this.txt = txt;
    this.show();
  }
  setTextYPosition(txt,y){
    this.hide();
    this.y = y;
    this.txt = txt;
    this.show();
  }
  moveTo(new_x,new_y){
    this.tgt_x = new_x;
    this.tgt_y = new_y;
    this._doMove();
  }
  moveToX(new_x){
    this.tgt_x = new_x;
    this._doMove();
  }
  moveToY(new_y){
    this.tgt_y = new_y;
    this._doMove();
  }
  onFinished(finished_callback){
    this.finished_callback = finished_callback;
  }
  /**
  * private internal method for directing the text move.
  * It will see how far away we are from the target coords
  * and move towards the target at the defined speed.
  */
  _doMove(){
    this.hide();
    // move closer to the target in the x direction
    diff_x = this.tgt_x - this.x;
    finished_x = false;
    if(Math.abs(diff_x) <= this.speed_x){
      this.x = this.tgt_x;
      finished_x = true;
    } else {
      if(diff_x > 0){
        this.x += this.speed_x;
      } else {
        this.x -= this.speed_x;
      }
    }
    // move closer to the target in the y direction
    diff_y = this.tgt_y - this.y;
    finished_y = false;
    if(Math.abs(diff_y) <= this.speed_y){
      this.y = this.tgt_y;
      finished_y = true;
    } else {
      if(diff_y > 0){
        this.y += this.speed_y;
      } else {
        this.y -= this.speed_y;
      }
    }
    this.show();
    this.timeoutId = null;
    finished = finished_x & finished_y;
    if(!finished){
      this.timeoutId = setTimeout(this._doMove.bind(this), this.freq_millis);
    } else if(this.finished_callback != null){
      this.finished_callback.call();
      this.finished_callback = null;
    }
  }
}

class DateFormatter {
  /**
  * A pure virtual class which all the other date formatters will
  * inherit from.
  * The name will be used to declare the date format when selected
  * and the date formatDate methid will return the time formated
  * to the lines of text on the screen
  */
  name(){"no name";}
  formatDate(date){
    return ["","",""];
  }
}

/**
* English date formatting
*/

// English String Numbers
const numberStr = ["ZERO","ONE", "TWO", "THREE", "FOUR", "FIVE",
                 "SIX", "SEVEN","EIGHT", "NINE", "TEN",
                 "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN",
                  "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN",
                  "NINETEEN", "TWENTY"];
const tensStr = ["ZERO", "TEN", "TWENTY", "THIRTY", "FOURTY",
                 "FIFTY"];

function hoursToText(hours){
  hours = hours % 12;
  if(hours == 0){
    hours = 12;
  }
  return numberStr[hours];
}

function numberToText(value){
  word1 = '';
  word2 = '';
  if(value > 20){
    tens = (value / 10 | 0);
    word1 = tensStr[tens];
    remainder = value - tens * 10;
    if(remainder > 0){
      word2 = numberStr[remainder];
    }
  } else if(value > 0) {
    word1 = numberStr[value];
  }
  return [word1,word2];
}

class EnglishDateFormatter extends DateFormatter{
  name(){return "English";}
  formatDate(date){
    hours_txt = hoursToText(date.getHours());
    mins_txt = numberToText(date.getMinutes());
    return [hours_txt,mins_txt[0],mins_txt[1]];
  }
}

/**
* French date formatting
*/
const frenchNumberStr = [ "ZERO", "UNE", "DEUX", "TROIS", "QUATRE",
                          "CINQ", "SIX", "SEPT", "HUIT", "NEUF", "DIX",
                          "ONZE", "DOUZE", "TREIZE", "QUATORZE","QUINZE", 
                          "SEIZE", "DIX SEPT", "DIX HUIT","DIX NEUF", "VINGT",
                         "VINGT ET UN", "VINGT DEUX", "VINGT TROIS", 
                         "VINGT QUATRE", "VINGT CINQ", "VINGT SIX",
                         "VINGT SEPT", "VINGT HUIT", "VINGT NEUF"
                        ];

function frenchHoursToText(hours){
  hours = hours % 12;
  if(hours == 0){
    hours = 12;
  }
  return frenchNumberStr[hours];
}

function frenchHeures(hours){
  if(hours % 12 == 1){
    return 'HEURE';
  } else {
    return 'HEURES';
  }
}

class FrenchDateFormatter extends DateFormatter {
  constructor() {
    super();
  }
  name(){return "French";}
  formatDate(date){
    hours = frenchHoursToText(date.getHours());
    heures = frenchHeures(date.getHours());
    mins = date.getMinutes();
    if(mins == 0){
      if(hours == 0){
        return ["MINUIT", "",""];
      } else if(hours == 12){
        return ["MIDI", "",""];
      } else {
        return [hours, heures,""];
      }
    } else if(mins == 30){
      return [hours, heures,'ET DEMIE'];
    } else if(mins == 15){
      return [hours, heures,'ET QUERT'];
    } else if(mins == 45){
      next_hour = date.getHours()  + 1;
      hours = frenchHoursToText(next_hour);
      heures = frenchHeures(next_hour);
      return [hours, heures,"MOINS",'LET QUERT'];
    }
    if(mins > 30){
      to_mins = 60-mins;
      mins_txt = frenchNumberStr[to_mins];
      next_hour = date.getHours()  + 1;
      hours = frenchHoursToText(next_hour);
      heures = frenchHeures(next_hour);
      return [ hours, heures , "MOINS", mins_txt ];
    } else {
      mins_txt = frenchNumberStr[mins];
      return [ hours, heures , mins_txt ];
    } 
  }
}

/**
* Japanese date formatting
*/
const japaneseHourStr = [ "ZERO", "ICHII", "NI", "SAN", "YO",
                          "GO", "ROKU", "SHICHI", "HACHI", "KU", "JUU",
                          'JUU ICHI', 'JUU NI'];
const tensPrefixStr = [ "",
                         "JUU",
                         'NIJUU',
                         'SAN JUU',
                         'YON JUU',
                         'GO JUU'];

const japaneseMinuteStr = [ ["", "PUN"],
                            ["IP","PUN" ],
                            ["NI", "FUN"],
                            ["SAN", "PUN"],
                            ["YON","FUN"],
                            ["GO", "HUN"],
                            ["RO", "PUN"],
                            ["NANA", "FUN"],
                            ["HAP", "PUN"],
                            ["KYU","FUN"],
                            ["JUP", "PUN"]
                          ];

function japaneseHoursToText(hours){
  hours = hours % 12;
  if(hours == 0){
    hours = 12;
  }
  return japaneseHourStr[hours];
}

function japaneseMinsToText(mins){
  if(mins == 0){
    return ["",""];
  } else if(mins == 30)
    return ["HAN",""];
  else {
    units = mins % 10;
    mins_txt = japaneseMinuteStr[units];
    tens = mins /10 | 0;
    if(tens > 0){
      tens_txt = tensPrefixStr[tens];
      return [tens_txt + ' ' + mins_txt[0],  mins_txt[1]];
    } else {
      return [mins_txt[0],  mins_txt[1]];
    }
  }
}

class JapaneseDateFormatter extends DateFormatter {
  constructor() {
    super();
  }
  name(){return "Japanese (Romanji)";}
  formatDate(date){
    hours_txt = japaneseHoursToText(date.getHours());
    mins_txt = japaneseMinsToText(date.getMinutes());
    return [hours_txt,"JI", mins_txt[0], mins_txt[1] ];
  }
}

/**
* The Watch Display
*/

// a list of display rows 
let row_displays = [ 
  new ShiftText(240,60,'',"Vector",40,10,10,40,[1,1,1]),
  new ShiftText(240,100,'',"Vector",20,10,10,50,[0.85,0.85,0.85]),
  new ShiftText(240,120,'',"Vector",20,10,10,60,[0.85,0.85,0.85]),
  new ShiftText(240,140,'',"Vector",20,10,10,70,[0.85,0.85,0.85])
];

// a list of the formatters to cycle through
let date_formatters = [
    new EnglishDateFormatter(),
    new FrenchDateFormatter(),
    new JapaneseDateFormatter()
  ];

// current index of the date formatter to display
let date_formatter_idx = 0;
let date_formatter = date_formatters[date_formatter_idx];

// The small display at the top which announces the date format
let format_name_display = new ShiftText(55,0,'',"Vector",10,1,1,50,[1,1,1]);

function changeFormatter(){
  date_formatter_idx += 1;
  if(date_formatter_idx >= date_formatters.length){
    date_formatter_idx = 0;
  }
  console.log("changing to formatter " + date_formatter_idx);
  date_formatter = date_formatters[date_formatter_idx];
  reset_clock();
  draw_clock();
  // now announce the formatter by name
  format_name_display.setTextYPosition(date_formatter.name(),-10);
  format_name_display.moveToY(15);
  // and then move back
  format_name_display.onFinished(
      function(){
        format_name_display.moveToY(-10);
      }
    );
}

function reset_clock(){
  //console.log("reset_clock");
  var i;
  for (i = 0; i < row_displays.length; i++) {
    row_displays[i].reset();
  }
}

function draw_clock(){
  //console.log("draw_clock");
  date = new Date();
  rows = date_formatter.formatDate(date);
  var i;
  for (i = 0; i < rows.length; i++) {
    display = row_displays[i];
    txt = rows[i];
    display_row(display,txt);
  }
  // If the dateformatter has not returned enough 
  // rows then treat the reamining rows as empty
  for (j = i; j < row_displays.length; j++) {
    display = row_displays[j];
    display_row(display,'');
  }
  //console.log(date);
}

function display_row(display,txt){
  if(display.txt == ''){
    display.setTextXPosition(txt,240);
    display.moveToX(20);
  } else if(txt != display.txt){
    display.moveToX(-100);
    display.onFinished(
      function(){
        display.setTextXPosition(txt,240);
        display.moveToX(20);
      }
    );
  } else {
    display.setTextXPosition(txt,20);
  }
}

// The interval reference for updating the clock
let intervalRef = null;

function clearTimers(){
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

function startTimers(){
  let date = new Date();
  let secs = date.getSeconds();
  let nextMinuteStart = 60 - secs;
  //console.log("scheduling clock draw in " + nextMinuteStart + " seconds");
  setTimeout(scheduleDrawClock,nextMinuteStart * 1000);
  draw_clock();
}

function scheduleDrawClock(){
  //console.log("scheduleDrawClock");
  if(intervalRef) clearTimers();
  intervalRef = setInterval(draw_clock, 60*1000);
  draw_clock();
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    console.log("lcdPower: on");
    Bangle.drawWidgets();
    reset_clock();
    startTimers();
  } else {
    console.log("lcdPower: off");
    reset_clock();
    clearTimers();
  }
});
Bangle.on('faceUp',function(up){
  //console.log("faceUp: " + up + " LCD: " + Bangle.isLCDOn());
  if (up && !Bangle.isLCDOn()) {
    //console.log("faceUp and LCD off");
    clearTimers();
    Bangle.setLCDPower(true);
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
startTimers();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2,{repeat:false,edge:"falling"});
setWatch(changeFormatter, BTN1,{repeat:true,edge:"falling"});
