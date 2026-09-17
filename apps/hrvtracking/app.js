var Layout = require("Layout")

var layout = new Layout(
  {
    type: "v",
    c: [
      { type: "", pad: 4 },
      {
        type: "txt",
        font: "9%",
        label: "HRV",
        id: "dataTitle",
        fillx: 1,
      },
      {type:"",filly:1},
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
                fillx: 1,
              },
              {
                type: "txt",
                font: "13%",
                label: "54ms",
                id: "hrvData",
                fillx: 1,
              },
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
                fillx: 1,
              },
              {
                type: "txt",
                font: "13%",
                label: "73ms",
                id: "baselineData",
                fillx: 1,
              },
            ]
          },
        ]
      },
      {type:"",filly:1},
      {
        type: "h",
        id: "dayDisp",
        c: [
          {
            type: "v",
            pad: 5,
            c: [
              { type: "txt", font: "9%", label: "Tue", id: "day3Ago" },
              {
                type: "txt",
                font: "10%",
                label: "46ms",
                id: "day3AgoVal",
                pad: 2,
                fillx: 1,
              },
            ],
          },
          {
            type: "v",
            pad: 5,
            c: [
              { type: "txt", font: "9%", label: "Wed", id: "day2Ago" },
              {
                type: "txt",
                font: "10%",
                label: "43ms",
                id: "day2AgoVal",
                pad: 2,
                fillx: 1,
              },
            ],
          },
          {
            type: "v",
            pad: 5,
            c: [
              { type: "txt", font: "9%", label: "Thu", id: "day1Ago" },
              {
                type: "txt",
                font: "10%",
                label: "53ms",
                id: "day1AgoVal",
                pad: 2,
                fillx: 1,
              },
            ],
          },
        ],
      },
      {type:"",filly:1},
    ],
  },
  { lazy: true }
);

function getRelativeDay(timestamp) {
  // Convert Unix seconds timestamp to milliseconds
  const date = new Date(timestamp * 1000); 
  const now = new Date();

  // Reset hours, minutes, seconds, and ms to compare pure calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = today - target;

  if (diff === 0) return "Today";
  if (diff === oneDay) return "Yesterday";
  if (diff === -oneDay) return "Tomorrow";
  
  // Use Bangle.js locale module for localized short month name (e.g. "Sep")
  const locale = require("locale");
  const monthStr = locale.month(date, 1); // 1 flags it to return abbreviated name
  const dayStr = date.getDate();
  
  // Returns formatted string e.g., "Sep 13"
  return monthStr + " " + dayStr; 
}

function updateInfo(){
  let data = require("hrvtracking").getData()
  layout.hrvDate.label = data.latestHrv ? getRelativeDay(data.latestHrv.timestamp) : "Yesterday"
  layout.hrvData.label = data.latestHrv ? data.latestHrv.hrv+"ms" : "--ms"
  layout.baselineData.label = data.hrvBaseline ? data.hrvBaseline.toFixed(1)+"ms"  : "--ms"
  
 // layout.baselineData = data.hrvBaseline ? data.hrvBaseline.toFixed(1) : "--ms"
}

g.clear()
Bangle.loadWidgets()
Bangle.drawWidgets()
updateInfo()
layout.update()
layout.render()
