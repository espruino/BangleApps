(function () {
  let bigCustomFont = [
    atob(
      'AAAA/+AAAAAAB///wAAAAB////8AAAA/////+AAAP/////8AAD//////8AAf/8AAf/8AD/8AAAH/4Af+AAAAD/wD/gAAAAD/gf4AAAAAH+D/AAAAAAP8P4AAAAAAf5/AAAAAAA/n4AAAAAAB+/gAAAAAAH/+AAAAAAAf/wAAAAAAA//AAAAAAAD/8AAAAAAAP/4AAAAAAB//gAAAAAAH9+AAAAAAAfn8AAAAAAD+fwAAAAAAP4/gAAAAAB/D/AAAAAAP8H/AAAAAB/gP+AAAAAf8Af/AAAAH/gA//gAAD/8AB//8AH//gAB//////8AAB//////AAAB/////wAAAA////4AAAAAP//4AAAAAAAAAAAAAAGAAAAAAAAA8AAAAAAAAH8AAAAAAAA/wAAAAAAAH+AAAAAAAA/wAAAAAAAH+AAAAAAAA/wAAAAAAAH////////w/////////H////////8/////////3//////////////////8AAAAAAAAAAAAAAAAAADAAAAAAAAAcQAAAAAAAHzwAAAAAAA/PwAAAAAAH9/AAAAAAB/34AAAAAAP/fgAAAAAD//+AAAAAAf//wAAAAAH///AAAAAA///8AAAAAH///4AAAAB/4//gAAAAP/D/+AAAAD/wP34AAAAf+A/fwAAAD/wD8/gAAA/8APz/AAAH/gA/H+AAB/4AD8f8AAP/AAPw/8AD/wAA/B/+A/+AAD8D////wAAPwH///8AAA/AH///gAAD8AH//4AAAPwAH/+AAAAAAAAAAAAAAD8AAAAAAAAPwAAAAAAAA/AAgAAAAD/8AHAAAAAP/wB8AAAAA//APwAAAAD/8D/AAAAAP/wf8AAAAB//H/wAAAAH/8//gAAAAfv//+AAAAD+///8AAAAP7//fwAAAB/P/w/gAAAP8/+D/AAAB/j/wH+AAAP8P8AP8AAB/w/gAf8AAf+D4AA/8AH/wPAAB////+AwAAD////gCAAAH///8AAAAAH///AAAAAAD//wAAAAAAA/wAAAAAAAAAAAAAAAAAAAQAAAAAAAAHAAAAAAAAD8AAAAAAAA/wAAAAAAAP/AAAAAAAD/8AAAAAAB//wAAAAAAf//AAAAAAH//8AAAAAB//PwAAAAAf/w/AAAAAP/8D8AAAAD//APwAAAA//gA/AAAAP/4AD8AAAH/+AAPwAAB//gAA/AAAf/4AAD8AAH/8AAAPwAD//AAAA/AAP/wAAAD8AA/8AAAAPwAD/AAAAA/gAPgAAA/////4AAAD////+AAAAP////wAAAA/////AAAAD////8AAAAAA/AAAAAAAAD8AAAAAAAAPwAAAAAAAAAAAAAA8AAAAAAAB/wAAAAAAD//AAAAAP///8AAAAA////wAAAAD////AAAAAP///8AAAAA//4PwAAAAH/8A/gAAAAf/wB+AAAAB+/AH4AAAAP78AfwAAAA/vwA/AAAAH8/AD+AAAA/z8AP8AAAD+PwAf4AAAf4/AA/wAAH/D8AD/gAA/4PwAH/gAf/A/AAP/8f/4AAAAf////AAAAAf///wAAAAA///8AAAAAAf//AAAAAAAH/gAAAAAAAAAAAAAAAAH/4AAAAAAP//8AAAAAD///+AAAAB////8AAAAf////8AAAH//8f/4AAA//8AD/wAAP//AAD/gAB//wAAH/AAP/+AAAH+AB//wAAAP4AP/+AAAAfwB//wAAAB/AP9/AAAAD+B/n4AAAAH4H8/gAAAAfg/j8AAAAB/H8PwAAAAH8fw/AAAAAPz+D8AAAAA/P4PwAAAAD9/A/AAAAAf38D8AAAAB/fgP4AAAAH5+A/gAAAAfv4B/AAAAD+/gH8AAAAPz+AP4AAAB/PwA/wAAAP8/AB/gAAB/gAAD/AAAP8AAAP+AAD/gAAAf+AA/8AAAA//gf/gAAAA////8AAAAB////gAAAAB///4AAAAAB//+AAAAAAA//AAAAAAAAAAAAPwAAAAAAAA/AAAAAAAAD8AAAAAAAAfwAAAAAAAP/AAAAAAAH/8AAAAAAD//wAAAAAD///AAAAAB///8AAAAA///vwAAAA///w/AAAAP//wD8AAAP//4APwAAH//8AA/AAD//+AAD8AD//+AAAPwB///AAAA/A///gAAAD8f//wAAAAP///4AAAAA///4AAAAAD//8AAAAAAP/+AAAAAAA/+AAAAAAAD/AAAAAAAAPgAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAH//wAAAAAB///wAAAAAf///wAAAAD////wAAAAf////gAAAH/wAf/AAAA/8AAP+AAAD/AAAf8AAAf4AAAf4AAD/AAAA/gB/P4AAAB/A///AAAAH8H//8AAAAP4///gAAAAfn//+AAAAB+f//wAAAAH/+B/AAAAAf/4H8AAAAA//APwAAAAD/8A/AAAAAP/4H8AAAAB/fw/wAAAAH9///gAAAAfj//+AAAAB+P//4AAAAP4P//wAAAA/gf//gAAAH8APD/AAAA/wAAH8AAAH+AAAf8AAA/wAAA/4AAH/AAAB/4AB/4AAAD/8A//AAAAH////wAAAAP///+AAAAAP///gAAAAAP//4AAAAAAH/+AAAAAAAAAAAAAAA/wAAAAAAA//8AAAAAAP//+AAAAAD///8AAAAA////8AAAAH////4AAAA/+AD/wAAAH/AAD/gAAA/4AAD/AAAH+AAAH+AAAfwAAAP8APz+AAAAfwA/P4AAAA/gH9/AAAAD+Af34AAAAH4B+fgAAAAfwH7+AAAAA/A/v4AAAAD8D+/AAAAAPwPz8AAAAA/B/PwAAAAD8P8/gAAAAPw/j+AAAAA/H8H4AAAAH8/wfgAAAAf3+B/AAAAB+fwH8AAAAP//AP4AAAB//4A/wAAAH//AB/gAAA//4AD/AAAP//AAH+AAB//wAAf+AAf/+AAAf/AP//gAAA/////8AAAB/////AAAAB////wAAAAB///4AAAAAB//4AAAAAAAAAAAAAAA='),
    atob('Jg8dGiAaKBsoKA==')
  ];
  let smallCustomFont = [
    atob(
      'AAAAAAAAAAfkAAwAAAwAAACQf8CQf8CQAAGIJEf+JEE4AAMMMQBgCMMMAAAYMkTEMkAYBkAAwAgAAAHwIIQEAAQEIIHwAABAFQDgBADgFQBABABAHwBABAAAACAMAABABABABABAAAAEAAAEAYAgDAEAYAAAP4QkRESEP4AAEEIEf8AEAAMMQUQUQkPEAAIIQEREREO4AABwCQEQIQf8AAeISESESER4AAH4KESESEB4AAYAQAQcTgcAAAO4REREREO4AAPAQkQkQoPwAACIAAACCMAABACgEQIIAACQCQCQCQCQAAIIEQCgBAAAMAQAQ0RAOAAAP4QETkUUUUP0AAP8RARARAP8AAf8REREREO4AAP4QEQEQEIIAAf8QEQEIIHwAAf8REREREQEAAf8RARARAQAAAP4QEQEREJ4AAf8BABABAf8AAQEf8QEAAAYAEQEf4QAAAf8BACgEQYMAAf8AEAEAEAEAAf8IAEACAEAIAf8AAf8EACABAf8AAP4QEQEQEP4AAf8RARARAOAAAP4QEQEQGP6AAf8RgRQRIOEAAOIREREREI4AAQAQAf8QAQAAAf4AEAEAEf4AAeABwAMBweAAAf8AIAQAgAQAIf8AAYMGwBAGwYMAAYAGAB8GAYAAAQMQ0REWEYEAAf8QEAAMACABgAQAMAAQEf8AAIAQAgAQAIAAAACACACACACAAgAwAAAAYCkCkCkB8AAf8CECECEB4AAB4CECECEBIAAB4CECECEf8AAB4CUCUCUBwAACAP8SAQAAAB4CFCFCFD+AAf8CACACAB8AACET8AEAAACABT+AAf8AgBQCIAEAAQEf8AEAAD8CACAD8CACAB8AAD8CACACAB8AAB4CECECEB4AAD/CECECEB4AAB4CECECED/AAD8BACACACAAABICkCkCkAYAACAP4CECEAAD4AEAEAED8AADAAwAMAwDAAAD4AEAEA4AEAED4AACMBQAgBQCMAAD4AFAFAFD+AACMCUCkDECEAABAO4QEQEAAf8AAQEQEO4BAAAYAgAQAQAIAwAAAAAAAAAAAAA'),
    atob(
      'BQIEBgYGBwMEBAcGAwYCBwYFBgYGBgYGBgYCAwUGBQYHBgYGBgYGBgYEBgYGCAYGBgYGBgYGBggGBgYDBgMGBgMGBgYGBgUGBgQEBgQIBgYGBgYGBQYGCAYGBgUCBQcF')
  ];
  let interval = null;
  let middleX = 120;
  let middleY = 106;
  let baseline = middleY - 4;
  let lineLength = 114;
  let lineY1 = middleY - 10;
  let lineY2 = middleY + 60;

  function setBigFont () {
    g.setFontCustom(
      bigCustomFont[0],
      48,
      bigCustomFont[1],
      58
    );
  }

  function setSmallFont () {
    g.setFontCustom(
      smallCustomFont[0],
      32,
      smallCustomFont[1],
      12
    );
  }

  function drawSegment (align, base, str) {
    let point = base;
    let maxSegmentWidth = g.stringWidth('00');
    if (align === 'r') {
      point = base - g.stringWidth(str) / 2;
    }
    if (align === 'c') {
      point = base + (maxSegmentWidth / 2) -
        (g.stringWidth(str) / 2);
    }
    g.setColor(1, 1, 1);
    g.drawString(str, point, baseline, false);
  }

  function drawDots (center) {
    g.setColor(0xFD20);
    g.fillCircle(center, middleY + 10, 2);
    g.fillCircle(center, middleY + 40, 2);
  }

  function drawLines () {
    g.setColor(0.5, 0.5, 0.5);
    g.drawLine(middleX - lineLength, lineY1, middleX + lineLength, lineY1);
    g.drawLine(middleX - lineLength, lineY2, middleX + lineLength, lineY2);
  }

  function drawDate (str) {
    let maxSegmentWidth = 236;
    g.setColor(0.5, 0.5, 0.5);
    g.setColor(0.5, 0.5, 0.5);
    g.drawString(str, (maxSegmentWidth) - (g.stringWidth(str)), middleY - 22,
      false);
  }

  function fixedDigits (numb) {
    if (numb < 10) {
      return '0' + numb;
    }
    return numb.toString();
  }

  function step () {
    g.clearRect(0, 24, 239, 239);
    let d = new Date();
    let hour = d.getHours();
    let minute = d.getMinutes();
    let second = d.getSeconds();
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    //hour = "00";
    //minute = "00";
    //second = "00";
    drawLines();
    setBigFont();
    drawSegment('l', middleX - 120, fixedDigits(hour));
    drawSegment('c', middleX - 37, fixedDigits(minute));
    drawSegment('r', middleX + 82, fixedDigits(second));
    drawDots(middleX - 41);
    drawDots(middleX + 41);
    setSmallFont();
    drawDate(fixedDigits(day) + '.' + fixedDigits(month) + '.' + year);
  }

  function stop () {
    if (interval) {
      clearInterval(interval);
    }
  }

  function start () {
    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(step, 1000);
    step();
  }

  start();

  Bangle.on('lcdPower', function (on) {
    if (on) {
      drawWidgets();
      start();
    }
    else {
      stop();
    }
  });
})();
