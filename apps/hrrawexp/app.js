var counter = 15;
var logging_started;
var interval;
var value;
var filt;

var fileClosed = 0;
var file;

var screenSize = g.getHeight();


function exists(name){
  s = require('Storage');
  var fileList = s.list();
  var fileExists = false;
  for (let i = 0; i < fileList.length; i++) {
        fileExists = fileList[i].includes(name);
        if(fileExists){
          break;
        }
  }
  return fileExists;
}

function update_timer() {
    g.clear();
    g.setColor("#CC00CC");
    g.setFont("6x8", 4);
    g.setFontAlign(0, 0); // center font

    g.drawString(counter, screenSize/2, screenSize/2);
    g.setFont("6x8", 2);
    //g.setFontAlign(-1, -1);
    g.drawString("+", screenSize-10, screenSize/2);
    g.drawString("-", 10, screenSize/2);
    g.drawString("GO",screenSize/2 , (screenSize/2)+(screenSize/5));
    //g.setColor("#ffffff");
    //g.setFontAlign(0, 0); // center font
    g.drawString("Timer(minutes)", screenSize/2+5,screenSize/4 );
    g.setFont("6x8", 4);
    g.drawString("^",screenSize/2 , 150);

    if (!logging_started)
        g.flip();
}

function btn2Pressed() {
    if (!logging_started) {
        if (counter < 120)
            counter += 15;
        else
            counter = 15;
        update_timer();
    }
}

function btn3Pressed() {
    if (!logging_started) {
        if (counter > 15)
            counter -= 15;
        else
            counter = 120;
        update_timer();
    }
}

function btn1Pressed() {
  if (!logging_started) {
      var filename = "";
      var fileset = false;

      for (let i = 0; i < 5; i++) {
        filename = "HRM_data" + i.toString() + ".csv";
        if(exists(filename) == 0){
          file = require("Storage").open(filename,"w");
          console.log("creating new file " + filename);
          fileset = true;
        }
        if(fileset){
          break;
        }
      }

      if (!fileset){
        console.log("overwiting file");
        file = require("Storage").open("HRM_data.csv","w");
      }

      file.write("");
      file = require("Storage").open(filename,"a");

      //launchtime = 0 | getTime();
      //file.write(launchtime + "," + "\n");
      logging_started = true;
      counter = counter * 60;
      interval = setInterval(countDown, 1000);
      Bangle.setHRMPower(1);
  }
}

function fmtMSS(e) {
    h = Math.floor(e / 3600);
    e %= 3600;
    m = Math.floor(e / 60);
    s = e % 60;
    return h + ":" +  m + ':' + s;
}

function countDown() {
    g.clear();
    counter--;
    if (counter <= 0 && fileClosed == 0) {
        Bangle.setHRMPower(0);
        clearInterval(interval);
        g.drawString("Done", g.getWidth() / 2, g.getHeight() / 2);
        Bangle.buzz(500, 1);
        fileClosed = 1;
    }
    else
        g.drawString(fmtMSS(counter), g.getWidth() / 2, g.getHeight() / 2);
}

//var HRVal = 0;
//var HRConfidence = 0;

update_timer();

setWatch(btn1Pressed, BTN1, { repeat: true });
//setWatch(btn2Pressed, BTN2, { repeat: true });
//setWatch(btn3Pressed, BTN3, { repeat: true });

Bangle.on("swipe",function(directionLR, directionUD){
    if (1==directionLR){
        btn1Pressed();
    }
    else if (-1==directionUD || directionUD==1){
        btn2Pressed();
    }
   else if(directionLR == -1){
        btn3Pressed();
     }
 });

Bangle.on('HRM-raw', function (hrm) {
        value = hrm.raw;
        filt = hrm.filt;
        //var dataArray = [value,filt,HRVal,HRConfidence];
        file.write(value + "," + filt + "\n");
});
/*
Bangle.on('HRM', function (hrmB) {
        HRVal = hrmB.bpm;
        HRConfidence = hrmB.confidence;
});
*/
