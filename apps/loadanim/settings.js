(function(back) {
  const SETTINGS_FILE = "loadanim.json";
  const storage = require('Storage');
  let timer;
  try { timer = require("timer"); } catch {
    E.showAlert("Needs FW 2v29 or later","Load Anim").then(back);
    return;
  }
  let settings = Object.assign({ anim:0 }, storage.readJSON(SETTINGS_FILE, 1)||{});
  const ANIM = [
    {
      name : "Circle",
      code : function() {
        let o = Graphics.createArrayBuffer(g.getWidth(),g.getHeight(),1);
        let n = 10, gl = g;
        o.transparent = 1;
        o.palette = new Uint16Array(2);//all black
        o.fillCircle(88,88,n);
        Bangle.setLCDOverlay(o,0,0,{id:"loadanim"});
        gl.clear(1).flip(1);
        let id = timer.add({
          type:"EXEC", fn: () => { "ram";
            n+=10;
            if (n>170) done();
            else {
              o.fillCircle(88,88,n);
              gl.flip(1);
            }
          },
          time:20,
          interval:150,
        });
        let done = function() {
          if (id===undefined) return;
          require("timer").remove(id);
          id = undefined;
          Bangle.setLCDOverlay(undefined, {id: "loadanim"});
        };
        setTimeout(done, 0);
      }
    },
    {
      name : "Slide Left",
      code : function() {
        let o = g.asImage();
        g.clear();
        let n = 10, gl = g;
        Bangle.setLCDOverlay(o,n,0,{id:"loadanim"});
        gl.flip(1);
        let id = timer.add({
          type:"EXEC", fn: () => {"ram";
            n+=10;
            if (n>170) done();
            else {
              Bangle.setLCDOverlay(o,n,0,{id:"loadanim"});
              gl.flip(1);
            }
          },
          time:20,
          interval:150,
        });
        let done = function() {
          if (id===undefined) return;
          require("timer").remove(id);
          id = undefined;
          Bangle.setLCDOverlay(undefined, {id: "loadanim"});
        };
        setTimeout(done, 0);
      }
    },
    {
      name : "Progress",
      code : function() {
        let o = Graphics.createArrayBuffer(120,30,1);
        let n = 10, gl = g;
        o.drawRect(2,2,117,27).drawRect(3,3,116,26);
        o.fillRect(7,7,7+n,22);
        Bangle.setLCDOverlay(o,28,96,{id:"loadanim"});
        gl.flip(1);
        let id = timer.add({
          type:"EXEC", fn: () => { "ram";
            if (n>=105)return;
            n+=5;
            o.fillRect(7,7,7+n,22);
            gl.flip(1);
          },
          time:100,
          interval:100,
        });
        let done = function() {
          if (id===undefined) return;
          require("timer").remove(id);
          id = undefined;
          Bangle.setLCDOverlay(undefined, {id: "loadanim"});
        };
        setTimeout(done, 0);
      }, // 'loading' is an image that the OS displays as soon as it restarts
      loading : atob("gFiCAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQAFVVVVVVVVQAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVUAAFVVVVVVVUAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVAAAFVVVVVVVAAAAFVVUAAVVVVVVVVVVVVVVVVVVVVVUAAAVVVVVVVUAAAAVVVAAAVVVVVVVVVVVVVVVVVVVVVQDwBUAAEAAEADzwAAEAAAAVVVVVVVVVVVVVVVVVVVVVAPAFAAAAAAAAPPAAAAAAABVVVVVVVVVVVVVVVVVVVVUA8AQAAAAAAAA88AAAAA/AFVVVVVVVVVVVVVVVVVVVVQDwAAAAAAAAADwAAAAAPwAVVVVVVVVVVVVVVVVVVVVVAPAAA/wA/wA/PAPPwA/8ABVVVVVVVVVVVVVVVVVVVVUA8AAP/wP/wP/88//wP/8AFVVVVVVVVVVVVVVVVVVVVQDwAD8Pz8Pz8Pzz8Pz8D8AVVVVVVVVVVVVVVVVVVVVVAPAAPAPAAPPAPPPAPPADwBVVVVVVVVVVVVVVVVVVVVUA8AA8A8AA88A888A88APAFVVVVVVVVVVVVVVVVVVVVQDwADwDwP/zwDzzwDz8D8AVVVVVVVVVVVVVVVVVVVVVAPAAPAPD//PAPPPAPP//ABVVVVVVVVVVVVVVVVVVVVUA8AA8A8/A88A888A8P/wAAABVVVVVVVVVVVVVVVVVVQDwADwDzwDzwDzzwDw8AAAAABVVVVVVVVVVVVVVVVVVAPAAPAPPAPPAPPPAPDwAAAAABVVVVVVVVVVVVVVVVVUA8AA8A88A88A888A8D/wAAAAFVVVVVVVVVVVVVVVVVQDwAD8Pz8Pz8PzzwDw//w888AVVVVVVVVVVVVVVVVVVAP//D/8D//D//PPAPPwPzzzwBVVVVVVVVVVVVVVVVVUA//8D/AD88D8888A88APPPPAFVVVVVVVVVVVVVVVVVQAAAAAAAAAAAAAAAADwA8AAAAVVVVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAAAPwPwAAABVVVVVVVVVVVVVVVVVUAAAAAAAAAAAAAAAAAP/8AAAAFVVVVVVVVVVVVVVVVVQAAAAAAAAAAAAAAAAAP/AAAAAVVVVVVVVVVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAABVVVVVVVVVVVVVVVVVUAAAAAAAAAAAAAAAAAAAAAAAAFVVVVVVVVVVVVVVVVVQAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVAP//////////////////////////////////////AFUA//////////////////////////////////////8AVQDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBVAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAFUA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AVQDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBVAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAFUA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AVQDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBVAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAFUA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AVQDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBVAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAFUA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AVQDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBVAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAFUA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AVQDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBVAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAFUA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AVQDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBVAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAFUA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AVQDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwBVAP//////////////////////////////////////AFUA//////////////////////////////////////8AVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV")
    },
    {
      name : "Spinner",
      code : function() {
        let m = 28, o = Graphics.createArrayBuffer(m*2,m*2,2);
        let n = 0, gl = g, img = atob("GBiCAVVVQAFVVVVQAAAFVVVAAAABVVU////8VVQ////8FVADwAPABUADwAPAAUADwAPAAUAA8A8AAQAA/D8AAAAAP/wAAAAAD/AAAAAAD/AAAAAAP/wAAAAA/D8AAEAA8A8AAUADwAPAAUADwAPAAVADw8PABVQ////8FVU////8VVVAAAABVVVQAAAFVVVVQAFVVQ==");
        o.transparent = 1;
        o.setBgColor(1).clear().setBgColor(0);
        o.setColor(0).fillCircle(m,m,m);
        o.setColor(3).fillCircle(m,m,m-2);
        o.setColor(0).fillCircle(m,m,m-6);
        Bangle.setLCDOverlay(o,88-m,88-m,{id:"loadanim"});
        gl.flip(1);
        let id = timer.add({
          type:"EXEC", fn: () => { "ram";
            n++;
            o.setColor(3).drawImage(img,m,m,{rotate:n/5, scale:1.5});
            gl.flip(1);
          },
          time:100,
          interval:100,
        });
        let done = function() {
          if (id===undefined) return;
          require("timer").remove(id);
          id = undefined;
          Bangle.setLCDOverlay(undefined, {id: "loadanim"});
        };
        setTimeout(done, 0);
      }
    }
  ];

  function save() {
    storage.write(SETTINGS_FILE, settings);
  }
  function saveBootAnim() {
    let a = ANIM[settings.anim];
    storage.write("loadanim.0.boot.js", `{let timer;try{timer=require("timer");}catch{print("loadscr: need FW 2v29+");}if(timer){${a.code["\xffcod"]}}}`);
    if (a.loading) storage.write(".loading", a.loading);
    else storage.erase(".loading");
  }
  function showAnimChooser() {
    let menu = { '': { 'title': 'Choose Anim', back:() => showMainMenu() } };
    ANIM.forEach((a,idx) => {
      menu[a.name] = function() {
        setTimeout(function() {
          if (a.loading)
            g.drawImage(a.loading,g.getWidth()/2,g.getHeight()/2,{rotate:0/*center*/});
          a.code();
          let t=getTime()+0.5;while(getTime()<t); // wait for 0.5s (easiest way to) demo
          // draw widgets and menu
          E.showPrompt("Choose this?",{title:a.name,back:showAnimChooser}).then(ok => {
            if (ok) {
              settings.anim = idx;
              saveBootAnim();
              save();
              showMainMenu();
            } else showAnimChooser();
          });
          Bangle.drawWidgets();
          // wait for another 0.5s for rest of load screen to complete
          t=getTime()+0.5;while(getTime()<t);
        },10);
      };
    });
    E.showMenu(menu);
  }
  function showMainMenu() {
    E.showMenu({
      '': { 'title': 'Load Anim' },
      /*LANG*/'< Back': back,
      /*LANG*/'Anim': {
        value: ANIM[settings.anim].name,
        onchange: () => showAnimChooser()
      },
    });
  }
  showMainMenu();
})