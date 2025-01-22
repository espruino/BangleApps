E.showMenu = function (items) {
    var ar = Bangle.appRect;
    Bangle.removeAllListeners("drag");
    if (!items) {
        g.clearRect(ar.x, ar.y, ar.x2, ar.y2);
        return false;
    }
    var loc = require("locale");
    const ITEM_HEIGHT = 48;
    var m = {
        info: {
            cB: g.theme.bg,
            cF: g.theme.fg,
            cHB: g.theme.bgH,
            cHF: g.theme.fgH,
            cAB: g.theme.bg2,
            cAF: g.theme.fg2,
            predraw: () => { },
            preflip: () => { }
        },
        scroll: 0,
        items: [],
        selected: -1,
        draw: () => {
            g.reset().setFont('12x20');
            m.info.predraw(g);
            g.setColor(m.info.cB).fillRect(ar.x, ar.y, ar.x2, ar.y2).setColor(m.info.cF);
            m.items.forEach((e, i) => {
                const s = (i * ITEM_HEIGHT) - m.scroll + ar.y;
                if (s + ITEM_HEIGHT < ar.y || s > ar.y2 - 10) {
                    return false;
                }
                if (i == m.selected) {
                    g.setColor(m.info.cHB).fillRect(ar.x, s, ar.x2, Math.min(s + ITEM_HEIGHT, ar.y2)).setColor(m.info.cHF);
                } else {
                    g.setColor(m.info.cF);
                }
                g.setFontAlign(0, -1, 0);
                if (e.icon) {
                    g.drawString(e.title, ar.x + ((ar.x2 - ar.x) / 2) + 10, s + 5);
                    g.drawImage(e.icon, ar.x + ((ar.x2 - ar.x) / 2) - g.stringWidth(e.title) / 2 - 15, s + 5);
                } else {
                    g.drawString(e.title, ar.x + ((ar.x2 - ar.x) / 2), s + 5);
                }
                if (e.type && s < ar.y2 - 10) {
                    if (e.format) {
                        g.setFontAlign(0, -1, 0).drawString(e.format(e.value), ar.x + ((ar.x2 - ar.x) / 2), s + 25);
                    } else {
                        g.setFontAlign(0, -1, 0).drawString(e.value, ar.x + ((ar.x2 - ar.x) / 2), s + 25);
                    }
                }
            });
            m.info.preflip(g, m.scroll > 0, m.scroll < (m.items.length - 1) * ITEM_HEIGHT);
        },
        select: (x, y) => {
            if (m.selected == -1 || m.selected !== Math.max(Math.min(Math.floor((y + m.scroll - ar.y) / ITEM_HEIGHT), m.items.length - 1), 0)) {
                if (y) {
                    if (y < ar.y || y > ar.y2) {
                        return false;
                    } else {
                        m.selected = Math.max(Math.min(Math.floor((y + m.scroll - ar.y) / ITEM_HEIGHT), m.items.length - 1), 0);
                    }
                } else {
                    m.selected = Math.floor(m.scroll / ITEM_HEIGHT);
                }
                m.draw();
            } else {
                if (m.items[m.selected].type && m.items[m.selected].type === "boolean") {
                    m.items[m.selected].value = !m.items[m.selected].value;
                    m.items[m.selected].onchange(m.items[m.selected].value);
                    m.draw();
                } else if (m.items[m.selected].type && m.items[m.selected].type === "number") {
                    if (x && x < ((ar.x + ar.x2) / 2)) {
                        m.items[m.selected].value = m.items[m.selected].value - (m.items[m.selected].step ? m.items[m.selected].step : 1);
                    } else {
                        m.items[m.selected].value = m.items[m.selected].value + (m.items[m.selected].step ? m.items[m.selected].step : 1);
                    }
                    if (m.items[m.selected].value > (m.items[m.selected].max ? m.items[m.selected].max : Infinity)) {
                        m.items[m.selected].value = m.items[m.selected].min ? m.items[m.selected].min : 0;
                    }
                    if (m.items[m.selected].value < (m.items[m.selected].min ? m.items[m.selected].min : 0)) {
                        m.items[m.selected].value = m.items[m.selected].max ? m.items[m.selected].max : 10;
                    }
                    m.items[m.selected].onchange(m.items[m.selected].value);
                    m.draw();
                } else {
                    if (m.items[m.selected]) {
                        m.items[m.selected]();
                    }
                }
            }
        },
        move: d => {
            m.scroll += (d * ITEM_HEIGHT);
            m.scroll = Math.min(Math.max(m.scroll, 0), (m.items.length - 1) * ITEM_HEIGHT);
            m.selected = Math.max(Math.min(Math.floor((m.scroll - ar.y) / ITEM_HEIGHT), m.items.length - 1), 0);
            m.draw();
        }
    };
    Object.keys(items).forEach(i => {
        if (i == "") {
            m.info = Object.assign(m.info, items[i]);
        } else if (i === "< Back" && items[i]) {
            m.back = items[i];
        } else if (items[i]) {
            m.items.push(items[i]);
            m.items[m.items.length - 1].title = loc.translate(i);
            if (items[i].hasOwnProperty("value")) {
                if (typeof items[i].value === "boolean") {
                    m.items[m.items.length - 1].type = "boolean";
                } else {
                    m.items[m.items.length - 1].type = "number";
                }
            }
        }
    });
    m.draw();

    // Add BTN1 handler for back functionality
    if (m.back) {
        if (Bangle.backHandler) clearWatch(Bangle.backHandler);
        Bangle.backHandler = setWatch(m.back, BTN1, { debounce: 100 });
    }

    Bangle.on("drag", d => {
        if (!d.b) return false;
        if (d.dx == 0 && d.dy == 0) {
            m.select(d.x, d.y);
        } else {
            m.selected = -1;
            m.scroll -= d.dy;
            m.scroll = Math.min(Math.max(m.scroll, 0), (m.items.length - 1) * ITEM_HEIGHT);
            m.draw();
        }
    });
    return m;
};

E.showAlert = function (e, t) {
    if (!e) {
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
        menu[e] = () => { };
        E.showMenu(menu);
    });
};
E.showMessage = E.showAlert;

E.showPrompt = function (e, t) {
    if (!e) {
        E.showMenu();
        return false;
    }
    return new Promise(r => {
        const menu = {
            "": {
                "title": (t && t.title ? t.title : "Choose")
            }
        };
        menu[e] = () => { };
        if (t && t.buttons) {
            Object.keys(t.buttons).forEach(b => {
                menu[b] = () => {
                    E.showMenu();
                    r(t.buttons[b]);
                };
            });
        } else {
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
Bangle.showLauncher = function () {
    Bangle.removeAllListeners("drag");
    if (Bangle.backHandler) clearWatch(Bangle.backHandler);
    delete Bangle.backHandler;
    bsl();
};