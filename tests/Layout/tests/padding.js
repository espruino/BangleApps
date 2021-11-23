var img = () => ({
  width : 8, height : 8, bpp : 4,
  transparent : 1,
  buffer : E.toArrayBuffer(atob("Ee7uER7u7uHuDuDu7u7u7u7u7u7g7u4OHgAA4RHu7hE="))
});

var layout = new Layout({type: "v", c: [
  {type: "txt", font: "6x8", bgCol: "#F00", pad: 5, label: "TEXT"},
  {type: "img", font: "6x8", bgCol: "#0F0", pad: 5, src: img},
  {type: "btn", font: "6x8", bgCol: "#00F", pad: 5, label: "BTN"},
  {type: "v", bgCol: "#F0F", pad: 2, c: [
    {type: "txt", font: "6x8", bgCol: "#F00", label: "v with children"},
    {type: "txt", font: "6x8", bgCol: "#0F0", halign: -1, label: "halign -1"},
    {type: "txt", font: "6x8", bgCol: "#00F", halign: 1, label: "halign 1"},
  ]},
  {type: "h", bgCol: "#0FF", pad: 2, c: [
    {type: "txt", font: "6x8:2", bgCol: "#F00", label: "h"},
    {type: "txt", font: "6x8", bgCol: "#0F0", valign: -1, label: "valign -1"},
    {type: "txt", font: "6x8", bgCol: "#00F", valign: 1, label: "valign 1"},
  ]},
  {type: "h", bgCol: "#FF0", pad: 2, c: [
    {type: "v", bgCol: "#0F0", pad: 2, c: [
      {type: "txt", font: "6x8", bgCol: "#F00", pad: 2, label: "nested"},
    ]},
  ]},
]});
