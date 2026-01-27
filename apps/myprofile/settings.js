(function(back) {
  const FILE = "myprofile.json";
  //RHR reading vars
  let rhrData = [];
  let seconds = 60;
  let counter = seconds;
  const myprofile = Object.assign({
    minHrm: 60,
    maxHrm: 200,
    strideLength: 0, // 0 = not set
    birthday: '1970-01-01',
    height: 0, // 0 = not set
    weight: 0, // 0 = not set
  }, require('Storage').readJSON(FILE, true) || {});

  function writeProfile() {
    require('Storage').writeJSON(FILE, myprofile);
  }
  function finish() {
  Bangle.setHRMPower(0);
  Bangle.removeListener('HRM', onRHRHrm);
  if (rhrData.length > 0) {
    // Calculate average, ignoring outliers
    let avgRHR = Math.round(rhrData.reduce((a, b) => a + b) / rhrData.length);
    myprofile.restingHrm = avgRHR;
    myprofile.minHrm = avgRHR;
    writeProfile();
    E.showPrompt(" ",{
      buttonHeight:35,
      buttons:{"Back":true}
    }).then(function(v){
      mainMenu();
    })
      g.clearRect(0,Bangle.appRect.y,g.getWidth(),g.getHeight()-40)
      g.setColor("#f00"); g.drawImage(atob("Mi2BAAAAAAAAAAAP4AAf4AAf/wAf/gAP/+Af/+AH//wP//wD//+H//+B///z///w///+///8P///////n///////5///////+f///////3///////9////////f///////3///////9////////f///////j///////4///////+P///////B///////wf//////4D//////+Af//////AH//////gA//////4AH/////8AA/////+AAH/////AAB/////gAAP////wAAA////4AAAH///8AAAA///+AAAAH///AAAAA///AAAAAH//gAAAAAf/wAAAAAD/4AAAAAAf4AAAAAAB8AAAAAAAOAAAAAAAAAAAAAAAAAAAAAA=="),g.getWidth()-80,70);
      g.setColor(g.theme.fg); 
      g.setFont("Vector", 25).setFontAlign(0,0);
          g.drawString("Saved!", g.getWidth()/2, 35);
      g.setFont("Vector", 30).setFontAlign(0,0);
          g.drawString(avgRHR, g.getWidth()/2-30, g.getHeight()/2);
      g.setFont("Vector", 18).setFontAlign(0,0);
          g.drawString("RHR", g.getWidth()/2-30, g.getHeight()/2+20);
    
  } 
}

function onRHRHrm(hrm) {
  // Only record if the watch is confident in the reading
  if (hrm.confidence > 80) {
    rhrData.push(hrm.bpm);
  }

  // UI Update
  g.clearRect(Bangle.appRect);
  g.setColor(g.theme.fg); 
  g.setFont("Vector", 20).setFontAlign(0,0);
  g.drawString("Measuring...", g.getWidth()/2, 40);
  g.setFont("Vector", 40);
  g.drawString(hrm.bpm, g.getWidth()/2-30, g.getHeight()/2-5);
  g.setColor("#f00"); g.drawImage(atob("Mi2BAAAAAAAAAAAP4AAf4AAf/wAf/gAP/+Af/+AH//wP//wD//+H//+B///z///w///+///8P///////n///////5///////+f///////3///////9////////f///////3///////9////////f///////j///////4///////+P///////B///////wf//////4D//////+Af//////AH//////gA//////4AH/////8AA/////+AAH/////AAB/////gAAP////wAAA////4AAAH///8AAAA///+AAAAH///AAAAA///AAAAAH//gAAAAAf/wAAAAAD/4AAAAAAf4AAAAAAB8AAAAAAAOAAAAAAAAAAAAAAAAAAAAAA=="),g.getWidth()-80,60)
  g.setColor(g.theme.fg); 
  g.setFont("Vector", 16);
  g.drawString(counter + "s remaining", g.getWidth()/2, g.getHeight() - 55);
  if(hrm.confidence<=80){
    g.setFont("Vector", 14).drawString("Low confidence\nKeep still", g.getWidth()/2, g.getHeight() - 20);
  }
}

function startRHR(){
    // Start the process
    
    g.clearRect(Bangle.appRect)
    g.setColor(g.theme.fg); 
    g.setFont("Vector", 20).setFontAlign(0,0);
    g.drawString("Starting...", g.getWidth()/2, g.getHeight()/2);
    rhrData = [];
    counter = seconds;
    Bangle.on('HRM',onRHRHrm);
    Bangle.setHRMPower(1);
    let interval = setInterval(() => {
      counter--;
      if (counter <= 0) {
        clearInterval(interval);
        finish();
      }
    }, 1000);
  }
function RHRReading(){
  E.showPrompt("Resting Heart Rate reading requires you to be resting and still. Takes approx. 1 minute.",{
      title:"Continue?",
      buttonHeight:50,
      buttons:{"Continue":true,"Back":false}
    }).then(function(v){
    if(v){
          E.showPrompt("Make sure Bangle.js is snug around your wrist, about 1 cm under your wrist bone.",{
          buttonHeight:40,
          buttons:{"Continue":true}
        }).then(function(v){
            startRHR();
      });

    }else{
      mainMenu()
    }
  });
}
  
  const genderOpts = ["Male","Female","Not Set"];
  // if we have old min hr data and no resting hr data, upgrade minHRM to restingHRM
  if(myprofile.minHrm&&!myprofile.restingHrm)myprofile.restingHrm=myprofile.minHrm;
  
  const ageMenu = () => {
    const date = new Date(myprofile.birthday);

    E.showMenu({
      "" : { "title" : /*LANG*/"Birthday" },

      "< Back" : () => {
        if (date != new Date(myprofile.birthday)) {
          // Birthday changed
          if (date > new Date()) {
            E.showPrompt(/*LANG*/"Birthday must not be in future!", {
              buttons : {"Ok":true},
            }).then(() => ageMenu());
          } else {
            const age = (new Date()).getFullYear() - date.getFullYear();
            const newMaxHRM = Math.round(208-0.7*age);
            E.showPrompt(/*LANG*/`Set HR max to ${newMaxHRM} calculated from age?`).then(function(v) {
              myprofile.birthday = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, '0');
              if (v) {
                myprofile.maxHrm = newMaxHRM;
              }
              writeProfile();
              mainMenu();
            });
          }
        } else {
          mainMenu();
        }
      },

      /*LANG*/"Day": {
        value: date ? date.getDate() : null,
        min: 1,
        max: 31,
        wrap: true,
        onchange: v => {
          date.setDate(v);
        }
      },
      /*LANG*/"Month": {
        value: date ? date.getMonth() + 1 : null,
        format: v => require("date_utils").month(v),
        onchange: v => {
          date.setMonth((v+11)%12);
        }
      },
      /*LANG*/"Year": {
        value: date ? date.getFullYear() : null,
        min: 1900,
        max: (new Date()).getFullYear(),
        onchange: v => {
          date.setFullYear(v);
        }
      },
    });
  };

  const mainMenu = () => {
    var menu={
      "" : { "title" : /*LANG*/"My Profile" },

      "< Back" : () => back(),

      /*LANG*/"Birthday" : () => ageMenu(),

      /*LANG*/'Height': {
        value: myprofile.height,
        min: 0, max: 300,
        step:0.01,
        format: v => v ? require("locale").distance(v, 2) : '-',
        onchange: v => {
          if (v !== myprofile.height) {
            // height changed
            myprofile.height = v;
            setTimeout(() => {
              const newStrideLength = myprofile.height * 0.414;
              E.showPrompt(/*LANG*/`Set Stride length to ${require("locale").distance(newStrideLength, 2)} calculated from height?`).then(function(v) {
                if (v) {
                  myprofile.strideLength = newStrideLength;
                }
                writeProfile();
                mainMenu();
              });
            }, 1);
          }
        }
      },

      /*LANG*/"Weight": {
        value: myprofile.weight,
        min:0,
        step:1,
        format: v => v ? v + "kg" : '-',
        onchange: v => {
          myprofile.weight=v;
          writeProfile();
        },
      },

      /*LANG*/"Gender": {
        value: (typeof myprofile.gender === "number" &&
                myprofile.gender >= 0 &&
                myprofile.gender < genderOpts.length) ? myprofile.gender : 2,
        min:0,
        max: genderOpts.length-1,
        format: v => genderOpts[v],
        onchange: v => {
          myprofile.gender = v;
          writeProfile();
        },
      },

      /*LANG*/'HR max': {
        format: v => /*LANG*/`${v} BPM`,
        value: myprofile.maxHrm,
        min: 30, max: 220,
        onchange: v => {
          myprofile.maxHrm = v;
          writeProfile();
        }
      },
      /*LANG*/'HR min': {
        format: v => /*LANG*/`${v} BPM`,
        value: myprofile.minHrm,
        min: 30, max: 220,
        onchange: v => {
          myprofile.minHrm = v;
          writeProfile();
        }
      },
      /*LANG*/"Stride length": {
        value: myprofile.strideLength,
        min:0.00,
        step:0.01,
        format: v => v ? require("locale").distance(v, 2) : '-',
        onchange: v => {
          myprofile.strideLength=v;
          writeProfile();
        },
      },
    };
  
  menu[/*LANG*/`Resting HR: ${myprofile.restingHrm?myprofile.restingHrm:"--"}`]=RHRReading;
   E.showMenu(menu)
  };
  mainMenu();
})(load)
