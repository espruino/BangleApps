E.showMenu = function(items) {
  const gw = g.getWidth();
  const gh = g.getHeight();
  Bangle.removeAllListeners("drag");
  if(!items){
    delete m;
    g.clearRect(0, 30, gw, gh - 30);
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
      g.setColor(m.info.cB).fillRect(0, 50, gw, gh - 30).setColor(m.info.cF);
      m.items.forEach((e, i) => {
        const s = (i * 48) - m.scroll + 50;
        if(s < 30 || s > gh - 74){
          return false;
        }
        if(i == m.selected){
          g.setColor(m.info.cHB).fillRect(0, s, gw, Math.min(s + 48, gh - 30)).setColor(m.info.cHF);
        }else{
          g.setColor(m.info.cF);
        }
        g.drawString(e.title, (e.icon ? 30 : 10), s + 5);
        if(e.icon){
          g.drawImage(e.icon, 5, s + 5);
        }
        if(e.type && s < gh - 72){
          if(e.format){
            g.setFontAlign(1, -1, 0).drawString(e.format(e.value), gw - 10, s + 25).setFontAlign(-1, -1, 0);
          }else{
            g.setFontAlign(1, -1, 0).drawString(e.value, gw - 10, s + 25).setFontAlign(-1, -1, 0);
          }
        }
      });
      g.setColor(m.info.cAB).fillRect(0, 30, gw, 50);
      g.setColor(m.info.cAF).drawString(m.info.title, (m.back ? 30 : 10), 32);
      if(m.back){
        g.drawLine(5, 40, 20, 40);
        g.drawLine(5, 40, 15, 33);
        g.drawLine(5, 40, 15, 47);
      }
      m.info.preflip(g, m.scroll > 0, m.scroll < (m.items.length - 1) * 48);
    },
    select: (x, y) => {
      if(m.selected == -1 || m.selected !== Math.max(Math.min(Math.floor((y + m.scroll - 50) / 48), m.items.length - 1), 0)){
        if(y){
          if(y < 50 || y > gh - 30){
            return false;
          }else{
            m.selected = Math.max(Math.min(Math.floor((y + m.scroll - 50) / 48), m.items.length - 1), 0);
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
          if(x && x < (gw / 2)){
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
      m.selected = Math.max(Math.min(Math.floor((m.scroll - 50) / 48), m.items.length - 1), 0);
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
      if(d.x < 30 && d.y < 50){
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
