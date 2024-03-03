(function(back) {
  const FILE = "myprofile.json";

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
            const newMaxHRM = 220-age;
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
    E.showMenu({
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
    });
  };

  mainMenu();
})
