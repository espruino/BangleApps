var surveyFileJSON = "heatsuite.survey.json";
var Layout = require("Layout");
const modHS = require('HSModule');
var layout;
var TaskScreenTimeout;
Bangle.setOptions({
  'backlightTimeout':30000,
  'lockTimeout':30000
});

var settings = modHS.getSettings();
//randomize question order
function shuffle(array) {
  const result = [];
  var itemsLeft = array;
  while (itemsLeft.length) {
    var Item;
    if (itemsLeft[0].orderFix !== undefined && itemsLeft[0].orderFix == true) {
      Item = itemsLeft.splice(0, 1)[0];
    } else {
      var randomIndex = Math.floor(Math.random() * itemsLeft.length);
      Item = itemsLeft.splice(randomIndex, 1)[0];
    }
    result.push(Item); // ...and add it to the result
  }
  return result;
}
var surveyFile = require('Storage').readJSON(surveyFileJSON, true) || {"questions":[{"text":{"en_GB":"Thermal Comfort?"},"options":[{"text":{"en_GB":"Comfortable"},"value":0,"color":"#ffffff","btnColor":"#38ed35"},{"text":{"en_GB":"Uncomfortable"},"value":1,"color":"#ffffff","btnColor":"#ff0019"}],"tod":[[0,2359]],"key":"comfort"}],"supported":{"en_GB":"English (GB)"}};
var QArr = surveyFile.questions;
if (settings.surveyRandomize !== undefined && settings.surveyRandomize) {
  QArr = shuffle(QArr);
}


function log(msg) {
  if (!settings.DEBUG) {
    return;
  } else {
    console.log(msg);
  }
}

var appCache = modHS.getCache();
var lang = settings.lang || require("locale").name || "en_GB";

function queueTaskScreenTimeout() {
  if (TaskScreenTimeout) clearTimeout(TaskScreenTimeout);
  if (TaskScreenTimeout === undefined) {
    TaskScreenTimeout = setTimeout(function () {
      Bangle.load();
    }, 180000);
  }
}

/** -----------==== SURVEYS ====---------------- */
var scrollInterval;
function drawScrollingText(text,height) {
  Bangle.appRect = { x: 0, y: height, w: g.getWidth(), h: g.getHeight() - height, x2: g.getWidth()-1, y2: g.getHeight()-1 };
  let stringWidth = g.stringWidth(text);
  let textX = (stringWidth > g.getWidth())? (stringWidth/2) : 0;
  g.setColor("#000");
  g.setBgColor("#FFF");
  g.setFont("Vector:20", 2);
  g.clearRect(0, 0, g.getWidth(), height);
  function QuestionText() {
    g.setColor("#000");
    g.setBgColor("#FFF");
    g.setFont("Vector:20", 2); 
    g.clearRect(0, 0, g.getWidth(), height);
    g.drawString(text, textX, height/2); 
    textX -= 5;
    if (textX < (-(stringWidth/2)+g.getWidth())) textX = (stringWidth/2);
    g.flip();
  }
  if(scrollInterval) clearTimeout(scrollInterval);
  if(stringWidth > g.getWidth()){
    scrollInterval = setInterval(QuestionText, 60); //will need to scroll as its too long
  }else{
    QuestionText();
  }
}
function drawResponseOpts(ind){
  //force scrolling of question at the top
  var question = QArr[ind];
  drawScrollingText(question.text[lang].replace(/\\n/g, " "),30);
  var height = 30;
  var options = question.options;
  if(options.length < 4){
    height = Math.floor(Bangle.appRect.h / options.length);
  }
  let drawItem = function (idx,r){
    var optionText = options[idx].value;
    if (options[idx].text !== undefined) {
      optionText = options[idx].text[lang];
    }
    g.setColor((options[idx].color)?options[idx].color:"#000");
    g.setBgColor((options[idx].btnColor)?options[idx].btnColor:"#CCC").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
    g.setFontAlign(0, 0, 0);
    g.setFont("Vector:20").drawString(optionText,r.x+(g.getWidth()/2),r.y+(height/2));
  };
  let selectItem = function(id) {
    var resp = (options[id] && options[id].text && lang in options[id].text) ? options[id].text[lang] : options[id].value;
    const cbString = ind + "," + question.key + "," + resp + "," + options[id].value;
    return surveyResponse(cbString);
  };
  E.showScroller({
    h : height,
    c : options.length,
    draw : drawItem,
    select : selectItem
  });
}
function drawSurveyLayout(index) {
  if(scrollInterval) clearTimeout(scrollInterval);
  if (surveyFile === undefined) {
    log('No Survey File');
    E.showAlert("No Survey File Found.").then(function () {
      Bangle.showClock();
    });
    return;
  }
  if (index == QArr.length) {
    //at the end, so we can show a saved image and redirect to time screen
    g.clear();
    g.reset();
    g.setBgColor("#FFF");
    Bangle.buzz(150);
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
        label: "Done!"
      }]
    });
    layout.render();
    setTimeout(function () {
      Bangle.load();
    }, 500);
    return;
  }
  var question = QArr[index];
  var dateN = new Date();
  if (question.tod !== undefined && question.tod.length > 0) {
    //Now we need to see if we are in window of the day that we are eligible to ask the question
    var windowOfDay = false;
    var currMT = parseInt(dateN.getHours() + "" + dateN.getMinutes());
    for (let d = 0; d < question.tod.length; d++) {
      if (currMT > question.tod[d][0] && currMT < question.tod[d][1]) {
        windowOfDay = true;
        break;
      }
    }
    if (!windowOfDay) {
      drawSurveyLayout(index + 1);
      return;
    }
  }
  if (appCache.survey !== undefined){ //first time we are asking this question
    if(appCache.survey[question.key] !== undefined) {
    //lets just check if this survey question can be shown right now, otherwise we will skip it
      var lastS = new Date(appCache.survey[question.key].unix * 1000);
      if (question.oncePerDay !== undefined && question.oncePerDay) { // check if we can only show survey once a day and if we already have
        //if (dateN.getFullYear() + dateN.getMonth() + dateN.getDate() === lastS.getFullYear() + lastS.getMonth() + lastS.getDate()) {
        if(Math.floor(dateN.getTime() / 86400000) === Math.floor(lastS.getTime() / 86400000)){  
          drawSurveyLayout(index + 1);
          return;
        }
      }
    }
  }
  Bangle.buzz(100);
  g.clear();
  g.reset();
  var out = {
    type: "v",
    c: []
  };
  //default to English if question isn't translated
  if (!question.text[lang]) {
    lang = "en_GB";
  }
  var questionText = question.text[lang].replace(/\\n/g, "\n");
  var q = {
    type: "txt",
    wrap: true,
    fillx: 1,
    filly: 1,
    font: "Vector:20",
    label: questionText,
    id: "label"
  };
  out.c.push(q);
  var optFont = 'Vector:30';
  if (question.optFont !== undefined) optFont = question.optFont;
  var opt = {
    type: "btn",
    font: optFont,
    label: ">>",
    pad: 1,
    btnFaceCol: "#0f0",
    cb: l => drawResponseOpts(index)
  };
  out.c.push(opt);
  layout = new Layout(out);
  layout.render();
  return; 
}

function surveyResponse(text) {
  var arr = text.split(',');
  var nextSurvey = parseInt(arr[0]) + 1;
  let newArr = {
    "key": arr[1],
    "resp": arr[2],
    "value": arr[3]
  }
  modHS.saveDataToFile('survey', 'survey', newArr);
  drawSurveyLayout(nextSurvey);
}

drawSurveyLayout(0);
queueTaskScreenTimeout();