/* -*- mode: Javascript; c-basic-offset: 2; indent-tabs-mode: nil; coding: latin-1 -*- */
// pooqRoman
//
// Copyright (c) 2021 Stephen P Spackman
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// Notes:
//
// This only works for Bangle 2.

//////////////////////////////////////////////////////////////////////////////
/*                           System integration                             */

const storage = require('Storage');

const settings = storage.readJSON("setting.json", true) || {};

const alarms = storage.readJSON('alarm.json', true) || [];

/*
  { on : true,
    hr : 6.5, // hours + minutes/60
    msg : "Eat chocolate",
    last : 0, // last day of the month we alarmed on - so we don't alarm twice in one day!
    rp : true, // repeat
    as : false, // auto snooze
    timer : 5, // OPTIONAL - if set, this is a timer and it's the time in minutes
  }
*/

//////////////////////////////////////////////////////////////////////////////
/*                          Face-specific options                           */

class Options {
    // Protocol: subclasses must have static id and defaults fields.
    // Only fields named in the defaults will be saved.
    constructor() {
        this.id = this.constructor.id;
        this.file = `${this.id}.json`;
        this.backing = storage.readJSON(this.file, true) || {};
        Object.setPrototypeOf(this.backing, this.constructor.defaults);
        this.reactivator = _ => this.active();
        Object.keys(this.constructor.defaults).forEach(k => this.bless(k));
    }

    writeBack(delay) {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(
            () => {
                this.timeout = null;
                storage.writeJSON(this.file, this.backing);
            },
            delay
        );
    }
    
    bless(k) {
        Object.defineProperty(this, k, {
            get: () => this.backing[k],
            set: v => {
                this.backing[k] = v;
                // Ten second writeback delay, since the user will roll values up and down.
                this.writeBack(10000);
            }
        });
    }

    showMenu(m) {
        if (m instanceof Function) m = m();
        if (m) {
            for (const k in m) if ('init' in m[k]) m[k].value = m[k].init();
            m[''].selected = -1; // Workaround for self-selection bug.
            Bangle.on('drag', this.reactivator);
            this.active();
        } else {
            if (this.bored) clearTimeout(this.bored);
            this.bored = null;
            Bangle.removeListener('drag', this.reactivator);
            this.emit('done');
        }
        g.clear(true);
        E.showMenu(m);
    }

    active() {
        if (this.bored) clearTimeout(this.bored);
        this.bored = setTimeout(_ => this.showMenu(), 15000);
    }
    
    reset() {
        this.backing = {__proto__: this.constructor.defaults};
        this.writeBack(0);
    }
}

class RomanOptions extends Options {
    constructor() {
        super();
        this.menu = {
            '': {title: '* face options *'},
            '< Back': _ => this.showMenu(),
            Ticks: {
                init: _ => this.resolution,
                min: 0, max: 3,
                onchange: x => this.resolution = x,
                format: x => ['seconds', 'seconds (up)', 'minutes', 'hours'][x]
            },
            'Display': {
                init: _ => this.o24h == null ? 0 : 1 + this.o24h,
                min: 0, max: 2,
                onchange: x => this.o24h = [null, 0, 1][x],
                format: x => ['system', '12h', '24h'][x]
            },
            'Day of Week': {
                init: _ => this.dow,
                onchange: x => this.dow = x
            },
            Calendar: {
                init: _ => this.calendric,
                min: 0, max: 2,
                onchange: x => this.calendric = x,
                format: x => ['none', 'day', 'date'][x]
            },
            'Auto-Illum.': {
                init: _ => this.autolight,
                onchange: x => this.autolight = x
            },
            Defaults: _ => {this.reset(); this.interact();}
        };
    }
        
    interact() {this.showMenu(this.menu);}
}

RomanOptions.id = 'pooqroman';

RomanOptions.defaults = {
    resolution: 1,
    dow: true,
    calendric: 2,
    o24h: !settings["12hour"],
    bg: g.theme.bg,
    fg: g.theme.fg,
    barBg: g.theme.fg,
    barFg: g.theme.bg,
    hourFg: g.theme.fg,
    minuteFg: g.theme.fg,
    secondFg: g.theme.fg2,
    rectFg: g.theme.fg,
    hubFg: g.theme.fg,
    alarmFg: '#f00',
    timerFg: '#0f0',
    activeFg: g.theme.fg2,
    autolight: true,
};

//////////////////////////////////////////////////////////////////////////////
/*         Assets (generated by resourcer.js, in this directory)            */

const heatshrink = require('heatshrink');
const dec = x => E.toString(heatshrink.decompress(atob(x)));
const romanPartsF = [
  dec(
    'wEBsEB3//7//9//+0AjUAguAg3AgYQJjfAgv+gH/8Fg/0gh/AgP4gf2h/j/+BCAP' +
    'wgFggEggEQgEMgEHwEDEIIyDuED3kD7+H9vn2k/hEPgMP4Xevd+j4QB7kA9kAmkA' +
    'hUGgOH8Hn3le4+GgH32PuvfGj+CCAMDgXD4dz+evt9DgcL7fXn87h8NCAMP+Ef/0' +
    'eg+egPugF2j0bCAPAh3wh88h8P/8BNwI'
  ), 97, dec('gUDgUGgUJgYFBhsBhMJhgA=='), 17
];const fontF = [
  dec(
    'AAUwAIM/4F/8HguHAmABBAoIJBBoIUBkEwsEw//wAIIdDBoUQBoIfC+HB+Hj2F/m' +
    'E+CIXAoHEsHMuHcmH8mHuuHH8GBGIUAwEBwEHwH/wH5+EBAIILCCAP8oH8EYXMmA' +
    'BB5wjCgYjCAYMP8E+uF8mHsCIWHCIgCBAIXw4fw54tBgBsBGgUAnKLC99w40wAII' +
    'FBBIINBCIM8gF+iHnmHDuHD8HnDYMAjizEMYJJBn+A+OAAYIHBBYKjDXYKvDYZYP' +
    'D40AAIYMBZYgkC4Hg4DnDuH/8H/BYIVCv/wnEAjwBCAoIJBEIYRFh0Ag8AgPAEYQ' +
    'RCJIJNBfYRXKnFAvlg9ihE8dwsfgkLFHMYgJF8DNCh+AUYWAA4ILBAAJGB/4PB+D' +
    '9CgADCEoIPCJobbBB4IBBAoJdDEgXggvwhuwAIcH8EDRIh/BhkwAIMOuAPCMYQDB' +
    'A4ILBCIcGsECoAPLU4oPDH42ggeAB4XEg/mh1zhkzh03g/+h/4J4nwg0AhjbDRII' +
    'vCt/wAIIVFAoKTBCYIXBDIYHHEIYVFGJJxHSI8P/8H/6hLF44BBM4IABg8gh6NEh' +
    'vwgngBoITBv/Av7PBV4kAsArCfYIVBuEABYNwA4I3BD4cPL4UAM4IXBBYQfC4kP8' +
    '0AucAmcAu8PXogA='
  ), 32, dec('gINMgUAhMHhIAGCQ0KAQIKBgwEBgcIBAQVEhIJBhAeIBQIADAoUDEQULBQcHg4FD' +
    'CII='), 16
];
const lockI = dec('iMSwMAgfwgf8geHgeB4PA8HguFwnH//9//+4gPf//v//3gE7//9//+8EHCAO///A');
const batteryI = dec('h8SwMAgPggfAv/4//x//j//H/+P/8f/0//gOOA==');
const chargeI = dec('h0MwIEBkEBwEMgFwgeAj/w/+AjkA8EDgEYgFAA==');
const GPSI = dec('iUQwMAhEAgsAgUggFEgEKvEBn0Aj+AgfgglygsJosgxNGiNIgWJ4FBEoM4gA');
const HRMI = dec('iMRwMAnken8fzfd7v+/3/v9/38/z+b5tiiM3/eP/+D/+AAIM/wEPwEDwEAAIIA==');
const compassI = dec('iMRwMAgfgg/8g8ng0Q40ImcOjcHg+DwfB4Ph2Hw7FsolmkUxwEwuFwj/wEIMAA==');

//////////////////////////////////////////////////////////////////////////////
/*                           Squeezable strings                             */

class Formattable {
    width(g) {return this.w != null ? this.w : (this.w = g.stringWidth(this.text));}
    print(g, x, y) {g.drawString(this.text, x, y); return this.width();}
}

class Fixed extends Formattable {
    constructor(text) {
        super();
        this.text = text;
    }
    squeeze() {return false;}
}

class Squeezable extends Formattable {
    constructor(named, index) {
        super();
        this.named = named;
        this.index = index;
        this.end = index + named.forms;
    }
    squeeze() {
        if (this.index >= this.end) return false;
        this.index++;
        this.w = null;
        return true;
    }
    get text() {return this.named.table[this.index];}
}

class Named {
  constructor(forms, table) {
    this.forms = forms;
    this.table = table;
  }
    on(index) {return new Squeezable(this, this.forms * index);}
}

//////////////////////////////////////////////////////////////////////////////
/*                                   Face                                   */

// Static geometry
const barW = 26, barH = g.getHeight(), barX = g.getWidth() - barW, barY = 0;
const faceW = g.getWidth() - barW, faceH = g.getHeight();
const faceX = 0, faceY = 0, faceCX = faceW / 2, faceCY = faceH / 2;
const rectX = faceX + 35, rectY = faceY + 24, rectW = 80, rectH = 128;

// Extended-Roman-numeral labels
const layout = E.toUint8Array(
  75, 23, // XII
  132, 24, // I
  132, 61, // II
  132, 97, // III
  132, 133, // IV
  132, 170, // V
  75, 171, // VI
  18, 170, // VII
  18, 133, // VIII
  18, 97, // IX
  18, 61, // X
  18, 24 // XI
);

const numeral = (n, options) => [
  'n', // 0
  'abc', // I
  'abdc', // II
  'abddc', // III
  'abefg', // IV
  'hfg', // V
  'hfibc', // VI
  'hfibdc', // VII
  'hfibddc', // VIII
  'abjk', // IX
  'kjk', // X
  'kjbc', // XI
  'kjbdc', // XII
  'kjbddc', // XIII
  'kjbefg', // XIV
  'kjefg', // XV
  'labc', // XVI
  'labdc', // XVII
  'labddc', // XVIII
  'kjbjk', // XIX
  'kjjk', // XX
  'mabc', // XXI
  'mabdc', // XXII
  'mabddc', // XXIII
][options.o24h ? n % 24 : (n + 11) % 12 + 1];

const formatMonth = new Named(4, [
  'January',   'Jan.',  'Jan', 'I',
  'February',  'Feb.',  'Feb', 'II',
  'March',     'Mar.',  'Mar', 'III',
  'April',     'Apr.',  'Apr', 'IV',
  'May',       'May',   'May', 'V',
  'June',      'June',  'Jun', 'VI',
  'July',      'July',  'Jul', 'VII',
  'August',    'Aug.',  'Aug', 'VIII', // VIII *is* narrower than Aug, our I is thin.
  'September', 'Sept.', 'Sep', 'IX',
  'October',   'Oct.',  'Oct', 'X',
  'November',  'Nov.',  'Nov', 'XI',
  'December',  'Dec.',  'Dec', 'XII'
]);
const formatDom = {
  on: d => new Fixed(d.toString())
};
const formatDow = new Named(4, [
  'Sunday',    'Sun.',   'Sun', 'Su',
  'Monday',    'Mon.',   'Mon', 'M',
  'Tuesday',   'Tues.',  'Tue', 'Tu',
  'Wednesday', 'Weds.',  'Wed', 'W',
  'Thursday',  'Thurs.', 'Thu', 'Th',
  'Friday',    'Fri.',   'Fri', 'F',
  'Saturday',  'Sat.',   'Sat', 'Sa'
]);

const hceil = x => Math.ceil(x / 3600000) * 3600000;
const hfloor = x => Math.floor(x / 3600000) * 3600000;
const isString = x => typeof x == 'string';
const imageWidth = i => isString(i) ? i.charCodeAt(0) : i.width;
const imageHeight = i => isString(i) ? i.charCodeAt(1) : i.height;

const events = {
    // Items are {time: number, wall: boolean, priority: number,
    //            past: bool, future: bool, precision: number,
    //            colour: colour, dramatic?: bool, event?: any}
    fixed: [{time: Number.POSITIVE_INFINITY}], // indexed by ms absolute
    wall: [{time: Number.POSITIVE_INFINITY}], // indexed by nominal ms + TZ ms
    
    clean: function(now, l) {
        let o = now.getTimezoneOffset() * 60000;
        let tf = now.getTime() + l, tw = tf - o;
        // Discard stale events:
        while (this.wall[0].time <= tw) this.wall.shift();
        while (this.fixed[0].time <= tf) this.fixed.shift();
    },
    
    scan: function(now, from, to, f) {
        result = Infinity;
        let o = now.getTimezoneOffset() * 60000;
        let t = now.getTime() - o;
        let c, p, i, l = from - o, h = to - o;
        for (i = 0; (c = this.wall[i]).time < l; i++) ;
        for (; (c = this.wall[i]).time < h; i++) {
            if ((p = c.time < t) ? c.past : c.future)
                result = Math.min(result, f(c, new Date(c.time + o), p));
        }
        l += o; h += o; t += o;
        for (i = 0; (c = this.fixed[i]).time < l; i++) ;
        for (; (c = this.fixed[i]).time < h; i++) {
            if ((p = c.time < t) ? c.past : c.future)
                result = Math.min(f(c, new Date(c.time), p));
        }
        return result;
    },

    span: function(now, from, to, width) {
        let o = now.getTimezoneOffset() * 60000;
        let t = now.getTime() - o;
        let lfence = [], rfence = [];
        this.scan(now, from, to, (e, d, p) => {
            if (p) {
                for (let j = 0; j <= e.priority; j++) {
                    if (d < (lfence[e.priority] || t)) lfence[e.priority] = d;
                }
            } else {
                for (let j = 0; j <= e.priority; j++) {
                    if (d > (rfence[e.priority] || t)) rfence[e.priority] = d;
                }
            }
        });
        for (let j = 0; ; j += 0.5) {
            if ((rfence[Math.ceil(j)] - lfence[Math.floor(j)] || 0) <= width) {
                return [lfence[Math.floor(j)] || now, rfence[Math.ceil(j)] || now];
            }
        }
    },

    insert: function(t, wall, e) {
        let v = wall ? this.wall : this.fixed;
        e.time = t = t - (wall ? t.getTimezoneOffset() * 60000 : 0);
        v.splice(v.findIndex(x => x.time > t), 0, e);
    },

    loadFromSystem: function(options) {
        alarms.forEach(x => {
            if (x.on) {
                const t = new Date();
                let h = x.hr;
                let m = h % 1 * 60;
                let s = m % 1 * 60;
                let ms = s % 1 * 1000;
                t.setHours(h - h % 1, m - m % 1, s - s % 1, ms);
                // There's a race condition here, but I'm not sure what we can do about it.
                if (t < Date.now() || x.last === t.getDate()) t.setDate(t.getDate() + 1);
                this.insert(t, true, {
                    priority: 0,
                    past: false, // System alarms seem uninteresting if past?
                    future: true,
                    precision: x.timer ? 1000 : 60000,
                    colour: x.timer ? options.timerFg : options.alarmFg,
                    event: x
                });
            }
        });
        return this;
    },
};

//////////////////////////////////////////////////////////////////////////////
/*                          The main face logic                             */

class Sidebar {
    constructor(g, x, y, w, h, options) {
        this.g = g;
        this.options = options;
        this.x = x;
        this.y = this.initY = y;
        this.h = h;
        this.rate = Infinity;
        this.doLocked = Sidebar.status(_ => Bangle.isLocked(), lockI);
        this.doHRM = Sidebar.status(_ => Bangle.isHRMOn(), HRMI);
        this.doGPS = Sidebar.status(_ => Bangle.isGPSOn(), GPSI, Sidebar.gpsColour(options));
    }
    reset(rate) {this.y = this.initY; this.rate = rate; return this;}
    print(t) {
        this.y += 4 + t.print(
            this.g.setColor(this.options.barFg).setFontAlign(-1, 1, 1),
            this.x + 3, this.y + 4
        );
        return this;
    }
    pad(n) {this.y += n; return this;}
    free() {return this.h - this.y;}
    static status(p, i, c) {
        return function() {
            if (p()) {
                this.g.setColor(c ? c() : this.options.barFg)
                    .drawImage(i, this.x + 4, this.y += 4);
                this.y += imageHeight(i);
            }
            return this;
        };
    }
    static gpsColour(o) {
        const fix = Bangle.getGPSFix();
        return fix && fix.fix ? o.activeFg : o.barFg;
    }
    doPower() {
        const c = Bangle.isCharging();
        const b = E.getBattery();
        if (c || b < 50) {
            let g = this.g, x = this.x, y = this.y, options = this.options;
            g.setColor(options.barFg).drawImage(batteryI, x + 4, y + 4);
            g.setColor(b <= 10 ? '#f00' : b <= 30 ? '#ff0' : '#0f0');
            const h = 13 * (100 - b) / 100;
            g.fillRect(x + 8, y + 7 + h, x + 17, y + 20);
            // Espruino disallows blank leading rows in icons, for some reason.
            if (c) g.setColor(options.barBg).drawImage(chargeI, x + 4, y + 8);
            this.y = y + imageHeight(batteryI) + 4;
        }
        return this;
    }
    doCompass() {
        if (Bangle.isCompassOn()) {
            const c = Bangle.getCompass();
            const a = c && this.rate <= 1000;
            this.g.setColor(a ? this.options.activeFg : this.options.barFg).drawImage(
                compassI,
                this.x + 4 + imageWidth(compassI) / 2,
                this.y + 4 + imageHeight(compassI) / 2,
                a ? {rotate: c.heading / 180 * Math.PI} : undefined
            );
            this.y += 4 + imageHeight(compassI);
        }
        return this;
    }
}

class Roman {
    constructor(g, events) {
        this.g = g;
        this.state = null;
        const options = this.options = new RomanOptions();
        this.events = events.loadFromSystem(this.options);
        this.timescales  = [1000, [1000, 60000], 60000, 3600000];
        this.sidebar = new Sidebar(g, barX, barY, barW, barH, options);
        this.hours = Roman.hand(g, 3, 0.5, 12, _ => options.hourFg);
        this.minutes = Roman.hand(g, 2, 0.9, 60, _ => options.minuteFg);
        this.seconds = Roman.hand(g, 1, 0.9, 60, _ => options.secondFg);
    }

    reset() {this.state = null;}

    doIcons(which) {this.state.iconsOk = null;}

    // Watch hands. These could be improved, graphically.
    // If we restricted them to 60 positions, we could feasibly hand-draw them?
    static hand(g, w, l, d, c) {
        return p => {
            g.setColor(c());
            p = ((12 * p / d) + 1) % 12;
            let h = l * rectW / 2;
            let v = l * rectH / 2;
            let poly =
                p <= 2 ? [faceCX + w, faceCY, faceCX - w, faceCY,
                          faceCX + h * (p - 1), faceCY - v,
                          faceCX + h * (p - 1) + 1, faceCY - v]
                : p < 6 ? [faceCX + 1, faceCY + w, faceCX + 1, faceCY - w,
                           faceCX + h, faceCY + v / 2 * (p - 4),
                           faceCX + h, faceCY + v / 2 * (p - 4) + 1]
                : p <= 8 ? [faceCX - w, faceCY + 1, faceCX + w, faceCY + 1,
                            faceCX - h * (p - 7), faceCY + v,
                            faceCX - h * (p - 7) - 1, faceCY + v]
                : [faceCX, faceCY - w, faceCX, faceCY + w,
                   faceCX - h, faceCY - v / 2 * (p - 10),
                   faceCX - h, faceCY - v / 2 * (p - 10) - 1];
            g.fillPoly(poly);
        };
    }

    static pos(p, r) {
        let h = r * rectW / 2;
        let v = r * rectH / 2;
        p = (p + 1) % 12;  
        return p <= 2 ? [faceCX + h * (p - 1), faceCY - v]
            : p < 6 ? [faceCX + h, faceCY + v / 2 * (p - 4)]
            : p <= 8 ? [faceCX - h * (p - 7), faceCY + v]
            : [faceCX - h, faceCY - v / 2 * (p - 10)];
    }
    
    alert(e, date, now, past) {
        const g = this.g;
        g.setColor(e.colour);
        const dt = date - now;
        if (e.precision < 60000 && dt >= 0 && e.future && dt <= 59000) { // Seconds away
            const p = Roman.pos(date.getSeconds() / 5, 0.95);
            g.drawLine(faceCX, faceCY, p[0], p[1]);
            return 1000;
        } else if (e.precision < 3600000 && dt >= 0 && e.future && dt <= 3540000) { // Minutes away
            const p = Roman.pos(date.getMinutes() / 5 + date.getSeconds() / 300, 0.8);
            g.drawLine(p[0] - 5, p[1], p[0] + 5, p[1]);
            g.drawLine(p[0], p[1] - 5, p[0], p[1] + 5);
            return dt < 119000 ? 1000 : 60000; // Turn on second hand two minutes up.
        } else if (e.precision < 43200000 && dt >= 0 ? e.future : e.past) { // Hours away
            const p = Roman.pos(date.getHours() + date.getMinutes() / 60, 0.6);
            const poly = [p[0] - 4, p[1], p[0], p[1] - 4, p[0] + 4, p[1], p[0], p[1] + 4];
            if (date >= now) g.fillPoly(poly);
            else g.drawPoly(poly, true);
            return 3600000;
        }
        return Infinity;
    }
    
    render(d, rate) {
        const g = this.g;
        const state = this.state || (g.clear(true), this.state = {});
        const options = this.options;
        const events = this.events;
        events.clean(d, -39600000); // 11h

        // Sidebar: icons and date
        if (d.getDate() !== state.date || !state.iconsOk) {
            const sidebar = this.sidebar;
            state.date = d.getDate();
            state.iconsOk = true;
            g.setColor(options.barBg).fillRect(barX, barY, barX + barW, barY + barH);

            sidebar.reset(rate).doLocked().doPower().doGPS().doHRM().doCompass();
            g.setFontCustom.apply(g, fontF);
            let formatters = [];
            let month, dom, dow;
            if (options.calendric > 1) {
                formatters.push(month = formatMonth.on(d.getMonth()));
            }
            if (options.calendric > 0) {
                formatters.push(dom = formatDom.on(d.getDate()));
            }
            if (options.dow) {
                formatters.push(dow = formatDow.on(d.getDay()));
            }
            // Obnoxiously inefficient iterative method :(
            let ava = sidebar.free() - 3, use, i = 0, j = 0;
            while ((use = formatters.reduce((l, f) => l + f.width(g) + 4, 0)) > ava &&
                   j < formatters.length)
                for (j = 0;
                     !formatters[i++ % formatters.length].squeeze() &&
                     j < formatters.length;
                     j++) ;
            if (dow) sidebar.print(dow);
            sidebar.pad(ava - use);
            if (month) sidebar.print(month);
            if (dom) sidebar.print(dom);
        }

        // Hour labels and (purely aesthetic) box; clear inner face.
        let keyHour = d.getHours() < 12 ? 1 : 13;
        let alertSpan = events.span(d, hceil(d) - 39600000, hfloor(d) + 39600000, 39600000);
        let l = alertSpan[0].getHours(), h = alertSpan[1].getHours();
        if ((l - keyHour + 24) % 24 >= 12 || (h - keyHour + 24) % 24 >= 12) keyHour = l;
        if (keyHour !== state.keyHour) {
            state.keyHour = keyHour;
            g.setColor(options.bg)
                .fillRect(faceX, faceY, faceX + faceW, faceY + faceH)
                .setFontCustom.apply(g, romanPartsF)
                .setFontAlign(0, 1)
                .setColor(options.fg);
            // In order to deal with timezone changes more logic will be required,
            // since the labels may be in unusual locations (even offset when
            // a non-integral zone is involved). The value of keyHour can be
            // anything in [hr-12, hr] mod 24.
            for (let h = keyHour; h < keyHour + 12; h++) {
                g.drawString(
                    numeral(h % 24, options),
                    faceX + layout[h % 12 * 2], 
                    faceY + layout[h % 12 * 2 + 1]
                );
            }
            g.setColor(options.rectFg)
                .drawRect(rectX, rectY, rectX + rectW - 1, rectY + rectH - 1);
        } else {
            g.setColor(options.bg)
                .fillRect(rectX + 1, rectY + 1, rectX + rectW - 2, rectY + rectH - 2)
                .setColor(options.fg);
        }

        // Alerts
        let requestedRate = events.scan(
            d, hfloor(alertSpan[0] + 0), hceil(alertSpan[1] + 0) + 1,
            (e, t, p) => this.alert(e, t, d, p)
        );
        if (rate > requestedRate) rate = requestedRate;
        
        // Hands
        // Here we are using incremental hands for hours and minutes.
        // If we quantised, we could use hand-crafted bitmaps, though.
        this.hours(d.getHours() + d.getMinutes() / 60);
        if (rate < 3600000) {
            this.minutes(d.getMinutes() + d.getSeconds() / 60);
        }
        if (rate < 60000) this.seconds(d.getSeconds());
        g.setColor(options.hubFg).fillCircle(faceCX, faceCY, 3);
        return requestedRate;
    }
}

//////////////////////////////////////////////////////////////////////////////
/*                             Master clock                                 */

class Clock {
    constructor(face) {
        this.face = face;
        this.timescales = face.timescales;
        this.options = face.options;
        this.rates = {};

        this.options.on('done', () => this.start());
        
        this.listeners = {
            charging: _ => {face.doIcons('charging'); this.active();},
            lock: _ => {face.doIcons('locked'); this.active();},
            faceUp: up => {this.conservative = !up; this.active();},
            twist: _ => this.options.autolight && Bangle.setLCDPower(true),
            drag: e => {
                if (this.t0) {
                    if (e.b) {
                        e.x < this.xN && (this.xN = e.x) || e.x > this.xX && (this.xX = e.x);
                        e.y < this.yN && (this.yN = e.y) || e.y > this.yX && (this.yX = e.y);
                    } else if (this.xX - this.xN < 20) {
                        if (e.y - this.e0.y < -50) {
                            this.options.resolution > 0 && this.options.resolution--;
                            this.rates.clock = this.timescales[this.options.resolution];
                            this.active();
                        } else if (e.y - this.e0.y > 50) {
                            this.options.resolution < this.timescales.length - 1 &&
                                this.options.resolution++;
                            this.rates.clock = this.timescales[this.options.resolution];
                            this.active();
                        } else if (this.yX - this.yN < 20 && Date.now() - this.t0 > 500) {
                            this.stop();
                            this.options.interact();
                        }
                        this.t0 = null;
                    }
                } else if (e.b) {
                    this.t0 = Date.now(); this.e0 = e;
                    this.xN = this.xX = e.x; this.yN = this.yX = e.y;
                }
            }
        };
    }

    redraw(rate) {
        const now = this.updated = new Date();
        if (this.refresh) this.face.reset();
        this.refresh = false;
        rate = this.face.render(now, rate);
        if (rate !== this.rates.face) {
            this.rates.face = rate;
            this.active();
        }
        return this;
    }

    inactive() {
        this.timeout && clearTimeout(this.timeout);
        this.exception && clearTimeout(this.exception);
        this.interval && clearInterval(this.interval);
        this.timeout = this.exception = this.interval = this.rate = null;
        this.face.reset(); // Cancel any ongoing background rendering
        return this;
    }
    
    active() {
        const prev = this.rate;
        const now = Date.now();
        let rate = Infinity;
        for (const k in this.rates) {
            let r = this.rates[k];
            r === +r || (r = r[+this.conservative])
            r < rate && (rate = r);
        }
        const delay = rate - now % rate + 1;
        this.refresh = true;
        if (rate !== prev) {
            this.inactive();
            this.redraw(rate);
            if (rate < 31622400000) { // A year!
                this.timeout = setTimeout(
                    () => {
                        this.inactive();
                        this.interval = setInterval(() => this.redraw(rate), rate);
                        if (delay > 1000) this.redraw(rate);
                        this.rate = rate;
                    }, delay
                );
            }
        } else if (rate > 1000) {
            if (!this.exception) this.exception = setTimeout(() => {
                this.redraw(rate);
                this.exception = null;
            }, this.updated + 1000 - Date.now());
        }
        return this;
    }

    stop() {
        this.inactive();
        for (const l in this.listeners) {
            Bangle.removeListener(l, this.listeners[l]);
        }
        return this;
    }

    start() {
        this.inactive(); // Reset to known state.
        this.conservative = false;
        this.rates.clock = this.timescales[this.options.resolution];
        this.active();
        for (const l in this.listeners) {
            Bangle.on(l, this.listeners[l]);
        }
        Bangle.setUI('clock');
        return this;
    }
}

//////////////////////////////////////////////////////////////////////////////
/*                                 Main                                     */

const clock = new Clock(new Roman(g, events)).start();
