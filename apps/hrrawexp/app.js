var counter = 15;
var logging_started;
var interval;
var value;
var filt;

var fileClosed = 0;
var Storage = require("Storage");
var file;

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
    g.setColor("#00ff7f");
    g.setFont("6x8", 4);
    g.setFontAlign(0, 0); // center font

    g.drawString(counter, 120, 120);
    g.setFont("6x8", 2);
    g.setFontAlign(-1, -1);
    g.drawString("-", 220, 200);
    g.drawString("+", 220, 40);
    g.drawString("GO", 210, 120);

    g.setColor("#ffffff");
    g.setFontAlign(0, 0); // center font
    g.drawString("Timer (minutes)", 120, 90);

    g.setFont("6x8", 4); // bitmap font, 8x magnified

    if (!logging_started)
        g.flip();
}

function btn1Pressed() {
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

function btn2Pressed() {
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
        g.drawString("Finished", g.getWidth() / 2, g.getHeight() / 2);
        Bangle.buzz(500, 1);
        fileClosed = 1;
    }
    else
        g.drawString(fmtMSS(counter), g.getWidth() / 2, g.getHeight() / 2);
}

update_timer();

setWatch(btn1Pressed, BTN1, { repeat: true });
setWatch(btn2Pressed, BTN2, { repeat: true });
setWatch(btn3Pressed, BTN3, { repeat: true });

Bangle.on('HRM-raw', function (hrm) {
        value = hrm.raw;
        filt = hrm.filt;
        file.write(value + "," + filt + "," + "\n");
});
