(function(back) {
  const FILE = "myprofile.json";

  const myprofile = Object.assign({
    minHrm: 60,
    maxHrm: 200,
    strideLength: 0, // 0 = not set
  }, require('Storage').readJSON(FILE, true) || {});

  function writeProfile() {
    require('Storage').writeJSON(FILE, myprofile);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : /*LANG*/"My Profile" },

    "< Back" : () => back(),

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
        console.log(v);
        myprofile.strideLength=v;
        writeProfile();
      },
    },
  });
})
