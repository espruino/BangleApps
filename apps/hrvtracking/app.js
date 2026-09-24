var Layout = require("Layout");

var layout = new Layout(
  {
    type: "v",
    c: [
      {type: "", pad: 4},
      {type: "txt", font: "9%", label: "HRV", id: "dataTitle", fillx: 1},
      {type: "", filly: 1},
      {
        type: "h",
        c: [
          {
            type: "v",
            c: [
              {
                type: "txt",
                font: "9%",
                label: "Today",
                id: "hrvDate",
                fillx: 1
              },
              {type: "txt", font: "13%", label: "54ms", id: "hrvData", fillx: 1}
            ]
          },
          {
            type: "v",
            c: [
              {
                type: "txt",
                font: "9%",
                label: "Usual",
                id: "usualLabel",
                fillx: 1
              },
              {
                type: "txt",
                font: "13%",
                label: "73ms",
                id: "baselineData",
                fillx: 1
              }
            ]
          }
        ]
      },
      {type: "", filly: 1},
      {
        type: "h",
        id: "dayDisp",
        c: [
          {
            type: "v",
            pad: 5,
            c: [
              {type: "txt", font: "9%", label: "---", id: "day3Ago"},
              {
                type: "txt",
                font: "10%",
                label: "-- ms",
                id: "day3AgoVal",
                pad: 2,
                fillx: 1
              }
            ]
          },
          {
            type: "v",
            pad: 5,
            c: [
              {type: "txt", font: "9%", label: "---", id: "day2Ago"},
              {
                type: "txt",
                font: "10%",
                label: "-- ms",
                id: "day2AgoVal",
                pad: 2,
                fillx: 1
              }
            ]
          },
          {
            type: "v",
            pad: 5,
            c: [
              {type: "txt", font: "9%", label: "---", id: "day1Ago"},
              {
                type: "txt",
                font: "10%",
                label: "-- ms",
                id: "day1AgoVal",
                pad: 2,
                fillx: 1
              }
            ]
          }
        ]
      },
      {type: "", filly: 1}
    ]
  },
  {lazy: true}
);
function getShortDayName(timestamp) {
  const date = new Date(timestamp);
  const locale = require("locale");
  return locale.dow(date, 1);
}
function getRelativeDay(timestamp) {
  // Use the timestamp directly because it is already in milliseconds
  const date = new Date(timestamp);
  const now = new Date();

  // Reset hours, minutes, seconds, and ms to compare pure calendar days
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();

  const oneDay = 24 * 60 * 60 * 1000;
  const diff = today - target;

  if (diff === 0) return "Today";
  if (diff === oneDay) return "Yesterday";
  if (diff === -oneDay) return "Tomorrow"; // Fixed the string typo here

  // Use Bangle.js locale module for localized short month name
  const locale = require("locale");
  const monthStr = locale.month(date, 1);
  const dayStr = date.getDate();

  return monthStr + " " + dayStr;
}

function updateInfo() {
  let data = require("hrvtracking").getData();
  layout.hrvDate.label = data.latestHrv
    ? getRelativeDay(data.latestHrv.timestamp)
    : "Today";
  layout.hrvData.label = data.latestHrv
    ? Math.round(data.latestHrv.avgHrv) + "ms"
    : "--ms";
  layout.baselineData.label = data.hrvBaseline
    ? data.hrvBaseline.toFixed(0) + "ms"
    : "--ms";
  if (data.dailyHrvs[1]) {
    layout.day1AgoVal.label = data.dailyHrvs[1].avgHrv
      ? Math.round(data.dailyHrvs[1].avgHrv) + "ms"
      : "-- ms";
    layout.day1Ago.label = getShortDayName(data.dailyHrvs[1].timestamp);
  }
  if (data.dailyHrvs[2]) {
    layout.day2AgoVal.label = data.dailyHrvs[2].avgHrv
      ? Math.round(data.dailyHrvs[2].avgHrv) + "ms"
      : "-- ms";
    layout.day2Ago.label = getShortDayName(data.dailyHrvs[2].timestamp);
  }
  if (data.dailyHrvs[3]) {
    layout.day3AgoVal.label = data.dailyHrvs[3].avgHrv
      ? Math.round(data.dailyHrvs[3].avgHrv) + "ms"
      : "-- ms";
    layout.day3Ago.label = getShortDayName(data.dailyHrvs[3].timestamp);
  }
}

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
updateInfo();
layout.update();
layout.render();
