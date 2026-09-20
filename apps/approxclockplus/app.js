const Storage = require("Storage");

const settings =
  Storage.readJSON("approxclockplus.json", 1) || {};

const level =
  typeof settings.level === "number"
    ? settings.level
    : 2;


function drawTime() {
  const date = new Date();
  const hour = date.getHours();
  let text;


  // LEVEL 0
  if (level === 0) {

    let lines;

    if (hour < 4) {
      lines = [
        "Just after",
        "yesterday"
      ];

    } else if (hour < 20) {
      lines = [
        "Today"
      ];

    } else {
      lines = [
        "Almost",
        "tomorrow"
      ];
    }

    g.setFont("Vector", 24);

    lines.forEach(function(line, i) {
      const x =
        (g.getWidth() - g.stringWidth(line)) / 2;

      const y =
        lines.length === 1
          ? (g.getHeight() - g.getFontHeight()) / 2
          : 55 + i * 40;

      g.drawString(line, x, y);
    });

    return;


  // LEVEL 1
  } else if (level === 1) {

    if (hour < 6) {
      text = "Night";
    } else if (hour < 12) {
      text = "Morning";
    } else if (hour < 18) {
      text = "Day";
    } else {
      text = "Evening";
    }


  // LEVEL 2
  } else if (level === 2) {

    const minute = date.getMinutes();

    const numbers = {
      1: "One",
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
      10: "Ten",
      11: "Eleven",
      12: "Twelve",

      13: "One",
      14: "Two",
      15: "Three",
      16: "Four",
      17: "Five",
      18: "Six",
      19: "Seven",
      20: "Eight",
      21: "Nine",
      22: "Ten",
      23: "Eleven",
      24: "Twelve"
    };

    const minutesByQuarterString = {
      0: "O'Clock",
      15: "Fifteen",
      30: "Thirty",
      45: "Fourty-Five"
    };

    let minutesByQuarter;

    if (minute < 10) {
      minutesByQuarter = 0;
    } else if (minute < 20) {
      minutesByQuarter = 15;
    } else if (minute < 40) {
      minutesByQuarter = 30;
    } else if (minute < 55) {
      minutesByQuarter = 45;
    } else {
      minutesByQuarter = 0;
    }

    let displayHour = hour;

    if (minute > 54) {
      displayHour++;
    }

    let prefix;

    if (minute === minutesByQuarter) {
      prefix = " exactly";
    } else if (minutesByQuarter - minute < -54) {
      prefix = " nearly";
    } else if (minutesByQuarter - minute < -5) {
      prefix = " after";
    } else if (minutesByQuarter - minute < 0) {
      prefix = " just after";
    } else if (minutesByQuarter - minute > 5) {
      prefix = " before";
    } else {
      prefix = " nearly";
    }

    const lines = [
      "It's" + prefix,
      numbers[(displayHour % 24) || 24],
      minutesByQuarterString[minutesByQuarter]
    ];

    g.setFont("Vector", 24);

    lines.forEach(function(line, i) {
      const x =
        (g.getWidth() - g.stringWidth(line)) / 2;

      g.drawString(
        line,
        x,
        35 + i * 40
      );
    });

    return;


  // LEVEL 3
  } else if (level === 3) {

    const hourWords = [
      "Twelve",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven"
    ];

    const minuteWords = [
      "O'Clock",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
      "Twenty",
      "Twenty One",
      "Twenty Two",
      "Twenty Three",
      "Twenty Four",
      "Twenty Five",
      "Twenty Six",
      "Twenty Seven",
      "Twenty Eight",
      "Twenty Nine",
      "Thirty",
      "Thirty One",
      "Thirty Two",
      "Thirty Three",
      "Thirty Four",
      "Thirty Five",
      "Thirty Six",
      "Thirty Seven",
      "Thirty Eight",
      "Thirty Nine",
      "Forty",
      "Forty One",
      "Forty Two",
      "Forty Three",
      "Forty Four",
      "Forty Five",
      "Forty Six",
      "Forty Seven",
      "Forty Eight",
      "Forty Nine",
      "Fifty",
      "Fifty One",
      "Fifty Two",
      "Fifty Three",
      "Fifty Four",
      "Fifty Five",
      "Fifty Six",
      "Fifty Seven",
      "Fifty Eight",
      "Fifty Nine"
    ];

    const minute = date.getMinutes();

    let displayHour = hour % 12;
    let phrase;
    let displayHourWord;

    if (minute === 0) {

      phrase = "O'Clock";
      displayHourWord = hourWords[displayHour];

    } else if (minute === 15) {

      phrase = "Quarter past";
      displayHourWord = hourWords[displayHour];

    } else if (minute === 30) {

      phrase = "Half past";
      displayHourWord = hourWords[displayHour];

    } else if (minute === 45) {

      phrase = "Quarter to";
      displayHourWord =
        hourWords[(displayHour + 1) % 12];

    } else if (minute < 30) {

      phrase = minuteWords[minute];
      displayHourWord = "after " + hourWords[displayHour];

    } else {

      phrase = minuteWords[60 - minute];
      displayHourWord =
        "to " + hourWords[(displayHour + 1) % 12];
    }

    const lines = [
      "It's",
      phrase,
      displayHourWord
    ];

    g.setFont("Vector", 24);

    lines.forEach(function(line, i) {
      const x =
        (g.getWidth() - g.stringWidth(line)) / 2;

      g.drawString(
        line,
        x,
        35 + i * 40
      );
    });

    return;
  }


  // Draw Levels 0, 1 and 2
  g.setFont("Vector", 24);

  const x =
    (g.getWidth() - g.stringWidth(text)) / 2;

  const y =
    (g.getHeight() - g.getFontHeight()) / 2;

  g.drawString(
    text,
    x,
    y
  );
}


function clearFace() {
  g.reset();

  if (settings.theme === 1) {
    g.setBgColor(0, 0, 0);
    g.setColor(1, 1, 1);

  } else if (settings.theme === 2) {
    g.setBgColor(1, 1, 1);
    g.setColor(0, 0, 0);
  }

  g.clearRect(
    0,
    0,
    g.getWidth(),
    g.getHeight()
  );
}


Bangle.setUI("clock");


function draw() {
  clearFace();
  drawTime();
}


draw();
