E.showMenu = function(items) {
  var ar = Bangle.appRect;
  Bangle.removeAllListeners("drag");
  if(!items){
    g.clearRect(ar.x, ar.y, ar.x2, ar.y2);
    return false;
  }
  var loc = require("locale");
  var m = {
    info: {
      title: "Menu",
      cB: g.theme.bg,
      cF: g.theme.fg,
      cHB: g.theme.bgH,
      cHF: g.theme.fgH,
      cAB: g.theme.bg2,
      cAF: g.theme.fg2,
      predraw : () => {},
      preflip : () => {}
    },
    scroll: 0,
    items: [],
    selected: -1,
    draw: () => {
      g.reset().setFont('12x20');
      m.info.predraw(g);
      g.setColor(m.info.cB).fillRect(ar.x, ar.y + 20, ar.x2, ar.y2).setColor(m.info.cF);
      m.items.forEach((e, i) => {
        const s = (i * 48) - m.scroll + ar.y + 20;
        if(s < ar.y || s > ar.y2 - 44){
          return false;
        }
        if(i == m.selected){
          g.setColor(m.info.cHB).fillRect(ar.x, s, ar.x2, Math.min(s + 48, ar.y2)).setColor(m.info.cHF);
        }else{
          g.setColor(m.info.cF);
        }
        g.drawString(e.title, ar.x + (e.icon ? 30 : 10), s + 5);
        if(e.icon){
          g.drawImage(e.icon, ar.x + 5, s + 5);
        }
        if(e.type && s < ar.y2 - 42){
          if(e.format){
            g.setFontAlign(1, -1, 0).drawString(e.format(e.value), ar.x2 - 10, s + 25).setFontAlign(-1, -1, 0);
          }else{
            g.setFontAlign(1, -1, 0).drawString(e.value, ar.x2 - 10, s + 25).setFontAlign(-1, -1, 0);
          }
        }
      });
      g.setColor(m.info.cAB).fillRect(ar.x, ar.y, ar.x2, ar.y + 20);
      g.setColor(m.info.cAF).drawString(m.info.title, ar.x + (m.back ? 30 : 10), ar.y + 2);
      if(m.back){
        g.drawLine(ar.x + 5, ar.y + 10, ar.x + 20, ar.y + 10);
        g.drawLine(ar.x + 5, ar.y + 10, ar.x + 15, ar.y + 17);
        g.drawLine(ar.x + 5, ar.y + 10, ar.x + 15, ar.y + 3);
      }
      m.info.preflip(g, m.scroll > 0, m.scroll < (m.items.length - 1) * 48);
    },
    select: (x, y) => {
      if(m.selected == -1 || m.selected !== Math.max(Math.min(Math.floor((y + m.scroll - ar.y - 20) / 48), m.items.length - 1), 0)){
        if(y){
          if(y < ar.y + 20 || y > ar.y2){
            return false;
          }else{
            m.selected = Math.max(Math.min(Math.floor((y + m.scroll - ar.y - 20) / 48), m.items.length - 1), 0);
          }
        }else{
          m.selected = Math.floor(m.scroll / 48);
        }
        m.draw();
      }else{
        if(m.items[m.selected].type && m.items[m.selected].type === "boolean"){
          m.items[m.selected].value = !m.items[m.selected].value;
          m.items[m.selected].onchange(m.items[m.selected].value);
          m.draw();
        }else if(m.items[m.selected].type && m.items[m.selected].type === "number"){
          if(x && x < ((ar.x + ar.x2) / 2)){
            m.items[m.selected].value = m.items[m.selected].value - (m.items[m.selected].step ? m.items[m.selected].step : 1);
          }else{
            m.items[m.selected].value = m.items[m.selected].value + (m.items[m.selected].step ? m.items[m.selected].step : 1);
          }
          if(m.items[m.selected].value > (m.items[m.selected].max ? m.items[m.selected].max : Infinity)){
            m.items[m.selected].value = m.items[m.selected].min ? m.items[m.selected].min : 0;
          }
          if(m.items[m.selected].value < (m.items[m.selected].min ? m.items[m.selected].min : 0)){
            m.items[m.selected].value = m.items[m.selected].max ? m.items[m.selected].max : 10;
          }
          m.items[m.selected].onchange(m.items[m.selected].value);
          m.draw();
        }else{
          if(m.items[m.selected]){
            m.items[m.selected]();
          }
        }
      }
    },
    move: d => {
      m.scroll += (d * 48);
      m.scroll = Math.min(Math.max(m.scroll, 0), (m.items.length - 1) * 48);
      m.selected = Math.max(Math.min(Math.floor((m.scroll - ar.y - 20) / 48), m.items.length - 1), 0);
      m.draw();
    },
  };
  Object.keys(items).forEach(i => {
    if(i == ""){
      m.info = Object.assign(m.info, items[i]);
    }else if(i === "< Back" && items[i]){
      m.back = items[i];
    }else if(items[i]){
      m.items.push(items[i]);
      m.items[m.items.length - 1].title = loc.translate(i);
      if(items[i].hasOwnProperty("value")){
        if(typeof items[i].value === "boolean"){
          m.items[m.items.length - 1].type = "boolean";
        }else{
          m.items[m.items.length - 1].type = "number";
        }
      }
    }
  });
  m.info.title = loc.translate(m.info.title);
  m.draw();
  Bangle.on("drag", d => {
    if(!d.b){
      return false;
    }
    if(d.dx == 0 && d.dy == 0){
      if(d.x < ar.x + 30 && d.y < ar.y + 20){
        m.back();
        return false;
      }
      m.select(d.x, d.y);
    }else{
      m.selected = -1;
      m.scroll -= d.dy;
      m.scroll = Math.min(Math.max(m.scroll, 0), (m.items.length - 1) * 48);
      m.draw();
    }
  });
  return m;
};

E.showAlert = function (e, t){
  if(!e){
    E.showMenu();
    return false;
  }
  return new Promise(r => {
    const menu = {
      "": {
        "title": (t ? t : "Alert")
      },
      Ok: () => {
        E.showMenu();
        r();
      }
    };
    menu[e] = () => {};
    E.showMenu(menu);
  });
};
E.showMessage = E.showAlert;

E.showPrompt = function (e, t){
  if(!e){
    E.showMenu();
    return false;
  }
  return new Promise(r => {
    const menu = {
      "": {
        "title": (t && t.title ? t.title : "Choose")
      }
    };
    menu[e] = () => {};
    if(t && t.buttons){
      Object.keys(t.buttons).forEach(b => {
        menu[b] = () => {
          E.showMenu();
          r(t.buttons[b]);
        };
      });
    }else{
      menu.Yes = () => {
        E.showMenu();
        r(true);
      };
      menu.No = () => {
        E.showMenu();
        r(false);
      };
    }
    E.showMenu(menu);
  });
};

const bsl = Bangle.showLauncher;
Bangle.showLauncher = function (){
  Bangle.removeAllListeners("drag");
  bsl();
};
