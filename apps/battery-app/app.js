var Layout = require("Layout");

var battery = E.getBattery();
var pageNum = 1;
var pageLayout;

function drawGraph(){
  let percent = battery * 1.65;
  g.drawRect({x:5,y:98,w:165,h:10});
  g.fillRect({x:5,y:98,w:percent,h:10, r:5});
}

function getDeviceStatus(){
    if(Bangle.isHRMOn){
      pageLayout.hrm.label = 'On';
      pageLayout.hrm.btnFaceCol = g.theme.bg2;
    }
    if(Bangle.isGPSon){
      pageLayout.gps.label = 'On';
      pageLayout.gps.btnFaceCol = g.theme.bg2;
    }
    if(Bangle.isCompassOn){
      pageLayout.compass.label = 'On';
      pageLayout.compass.btnFaceCol = g.theme.bg2;
    }
    pageLayout.render();
}

function toggleDevice(device){
  switch(device){
    case 1:
      break;
    case 2:
      break;
    case 3:
      break;
  }
  getDeviceStatus();
}

function switchPage(dir){
  if (dir==1){
    pageNum += 1;
  }
  else{
    pageNum -= 1;
  }
  pageNum = E.clip(pageNum, 1,3);
  pageLayout.clear();
  drawPage();
}

function drawPage(){
  switch(pageNum){
    case 1:
      pageLayout = new Layout({
        type:"v", filly:1, id:"pageContent", c:[
          {type:"h", c:[
            {type:"txt", font:"8%", label:"General", fillx:1},
            {type:"btn", label:">", haligh:1, font:"5%", pad:4, cb: l=>{switchPage(1);}},
           ]},
          {type:"v", filly:1, c:[
            {type:"txt", label:"99d 99h remaining", font:"9%", pad:5, id:"timeLeft"},
            {type:"custom", render:drawGraph, height:15, width:170, id:"battP"},
            {type:"txt", label:"100%", font:"7%", vlign:-1, fillx:1, id:"batt"},
            {type:undefined, height:10},
          ]},
          {type:"h", halign:1, c:[
            // {type:"txt", label:"Last Updated: 10:10pm", font:"5%", id:"lastUp"}
          ]},
        ]},{lazy:true});
      break;
    case 2:
     pageLayout = new Layout({
        type:"v", id:"pageContent", c:[
          {type:"h", c:[
            {type:"btn", label:"<", haligh:1, font:"5%", pad:4, cb: l=>{switchPage(0);}},
            {type:"txt", font:"8%", fillx:1, label:"History"},
            {type:"btn", label:">", haligh:1, font:"5%", pad:4, cb: l=>{switchPage(1);}}
           ]},
          {type:"v",filly:1, pad:3, c:[
            {type:"txt", label:"graph here", font:"10%"},
            {type:"txt", label:"total cycles: 1", font:"10%"},
            {type:"txt", label:"drainage: 10%/hr", font:"10%"},
          ]}
        ]},{lazy:true});
      break;
    case 3:
      pageLayout = new Layout({
        type:"v", id:"pageContent", c:[
          {type:"h", c:[
            {type:"btn", label:"<", haligh:1, font:"5%", pad:4, cb: l=>{switchPage(0);}},
            {type:"txt", font:"8%", fillx:1, label:"Settings"},
           ]},
          {type:"v",filly:1, pad:3, c:[
          {type:"h", fillx:1, pad:2, c:[
            {type:"txt", label:"GPS", halign:-1, fillx:1, font:"8%",},
            {type:"btn", label:"OFF", id:"gps", font:"5%", btnFaceCol:"#F00", cb: l=> {console.log("test");}},
          ]},
          {type:"h", fillx:1, pad:2, c:[
            {type:"txt", label:"Compass", halign:-1, fillx:1, font:"8%",},
            {type:"btn", label:"OFF", id:"compass", font:"5%", btnFaceCol:"#F00", cb: l=> {console.log("test");}},
          ]},
          {type:"h", fillx:1, pad:2, c:[
            {type:"txt", label:"HRM", halign:-1, fillx:1, font:"8%",},
            {type:"btn", label:"OFF", id:"hrm", font:"5%", btnFaceCol:"#F00", cb: l=> {console.log("test");}},
          ]},
          ]},
          {type:"btn", fillx:1, pad:5, label:"Calibrate", font:"5%"}
        ]},{lazy:true});
      break;
  }
  pageLayout.render();
}


function draw(){
  let data = require("smartbatt").get();
  let hrLeft = data.hrsLeft;
  let daysLeft = Math.floor(hrLeft / 24);
  hrLeft = Math.round(hrLeft - (daysLeft * 24));
  console.log(hrLeft);
  pageLayout.timeLeft.label = daysLeft + "d " + hrLeft + "h remaining";
  pageLayout.batt.label = battery + " %";
  // pageLayout.lastUp.label = "Last Updated";
  pageLayout.render();
}

Bangle.setUI({
  mode:"custom",
  back: function(){
  load();
  }
});

g.clear();
drawPage();
draw();
