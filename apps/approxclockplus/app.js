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

  if (level === 0) {
    if (hour < 4) {
      text = "Just after yesterday";
    } else if (hour < 20) {
      text = "Today";
    } else {
      text = "Almost tomorrow";
    }

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

    const quarters = [
      "o'clock",
      "quarter past",
      "half past",
      "quarter to"
    ];

    let hour = date.getHours();

    if (minute >= 53) {
      hour++;
    }

    const quarter = Math.floor((minute + 7) / 15) % 4;

    text = quarters[quarter] + " " + numbers[(hour % 24) || 24];
  }

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
      "O'clock",
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

    const hour12 = date.getHours() % 12;
    const minute = date.getMinutes();

    const lines = [
      "It's",
      hourWords[hour12],
      minuteWords[minute]
    ];

    g.setFont("Vector", 24);

    lines.forEach((line, i) => {
      const x = (g.getWidth() - g.stringWidth(line)) / 2;
      g.drawString(line, x, 35 + i * 40);
    });
      
  g.reset();
  g.setBgColor(0, 0, 0);
  g.clearRect(0, 0, g.getWidth(), g.getHeight());
  g.setColor(1, 1, 1);

  g.setFont("Vector", 24);

  const x =
    (g.getWidth() - g.stringWidth(text)) / 2;

  g.drawString(
    text,
    x,
    100
  );
}

Bangle.setUI("clock");

drawTime();