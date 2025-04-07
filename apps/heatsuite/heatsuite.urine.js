var Layout = require("Layout");
const modHS = require('HSModule');
var layout;

//var settings = modHS.getSettings();
var appCache = modHS.getCache();

var results = {
  color: 0,
  volume: null,
  colorAssessment: appCache.urine && appCache.urine.colorAssessment ? appCache.urine.colorAssessment : 0
} 

function YMDInt(date) {
  var year = date.getFullYear().toString();
  var month = (date.getMonth() + 1).toString().padStart(2, '0'); 
  var day = date.getDate().toString().padStart(2, '0'); 
  var concatenatedDate = year + month + day;
  var concatenatedInteger = parseInt(concatenatedDate);
  return concatenatedInteger;
}

function saveUrineData(color) {
  if (color > 0) {
    var d = new Date();
    results.color = color;
    results.colorAssessment = YMDInt(d);
  }
  Bangle.buzz(150);
  modHS.saveDataToFile('urine', 'urine', results);
  g.clear();
  g.reset();
  layout = new Layout({
    type: "v",
    c: [{
      type: "img",
      pad: 4,
      src: require("heatshrink").decompress(atob("ikUwYFCgVJkgMDhMkyVJAwQFCAQNAgESAoQCBwEBBwlIgAFDpNkyAjDkm/5MEBwdf+gUEl/6AoVZkmX/oLClv6pf+DQn1/4+E3//0gFBkACBv/SBYI7D5JiDLJx9CBAR4CAoWQQ4Z9DgAA=="))
    },
    {
      type: "txt",
      font: "Vector:30",
      label: "Saved!"
    }]
  });
  layout.render();
  setTimeout(function () {
    Bangle.load();
  }, 500);
}

function drawColorAssessment(){
  var dateNow = new Date();
  var lastUrineColorDate = appCache.urine && appCache.urine.colorAssessment ? appCache.urine.colorAssessment : 0;
  var hourCurrent = dateNow.getHours();
  var currentDay = YMDInt(dateNow);
  if (hourCurrent >= 16 && currentDay > lastUrineColorDate) {
    var layout = new Layout({
      type: "v", c: [
        {
          type: "h", c: [
            { type: "btn", font: "6x8:2", label: " ", btnFaceCol: E.HSBtoRGB(0.3, 0.99, 1), cb: l => saveUrineData(2), fillx: 1, filly: 1, pad: 1 },
            { type: "btn", font: "6x8:2", label: " ", btnFaceCol: E.HSBtoRGB(0.2, 1, 1), cb: l => saveUrineData(1), fillx: 1, filly: 1, pad: 1 }
  
          ]
        },
        {
          type: "h", c: [
            { type: "btn", font: "6x8:2", label: " ", btnFaceCol: E.HSBtoRGB(0.38, 1, 1), cb: l => saveUrineData(3), fillx: 1, filly: 1, pad: 1 },
            { type: "btn", font: "6x8:2", label: " ", btnFaceCol: E.HSBtoRGB(0.44, 1, 0.9), cb: l => saveUrineData(4), fillx: 1, filly: 1, pad: 1 },
          ]
        }
      ]
    });
    g.clear();
    g.reset();
    layout.render();
  } else {
    saveUrineData(0);
  }
}

drawColorAssessment();
/*
//Urine Colours adapted NSW chart and from the Hillmen Urine Chart to includes blood presence
//https://www.health.nsw.gov.au/environment/beattheheat/Pages/urine-colour-chart.aspx

*/