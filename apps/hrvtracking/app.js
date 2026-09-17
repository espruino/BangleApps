var Layout = require("Layout")

var pg2Layout = new Layout(
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
                id: "dataTitle",
                fillx: 1,
              },
              {
                type: "txt",
                font: "13%",
                label: "54ms",
                id: "dataTitle",
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
                id: "dataTitle",
                fillx: 1,
              },
              {
                type: "txt",
                font: "13%",
                label: "73ms",
                id: "dataTitle",
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
              { type: "txt", font: "7%", label: "Tue", id: "day3Ago" },
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
              { type: "txt", font: "7%", label: "Wed", id: "day2Ago" },
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
              { type: "txt", font: "7%", label: "Thu", id: "day1Ago" },
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
g.clear()
Bangle.loadWidgets()
Bangle.drawWidgets()
pg2Layout.update()
pg2Layout.render()
