const bob = require("heatshrink").decompress(atob("nk8hAaXlYLWAEsqvN/0gBBql5lQ2tquj1XV5wBJ52j0hACPsdP1QsBAQQAGBIIBF51/P8OkN5R1GIxF5HLmAFgoDLPZfOpzmZ6vPFwomCPaA6DAYOjeq2A1YyCdI4HGQJQ8F1T2SJ4Oq1XW1es1mtAQOrPoPUAIh3J54ZHIAR5S62s64cBwIBGQIOqHQK4HKQYVDAAIFC1g+BHh9VHAQAFDwQDDHoJ5E54BB6AaBKQ5YGqo6MwJzGHQ4BDeIj/BR4JxDABY8BvI6OOYgaEHwZADHgQ6BZA42GAIusPJNW64eFqzJDlcrERA8BHQI2FqwaBDYYGBPI45GCoIgCLoVWQ5NWXA2rKhaiGLAwOGEAmADxJPDVA51ElQaMC4ouEWALdEHRg8Dc4woCDJo8EAIYxCHQQIFHiwaRegJ5EcYWsHgbrKbBA8GDSrNDO4wfRKgR3FDSh3CN4UrdwZbSHYZ5DHajMFHYQGCHalWO4jtQDQwABwAGCAAQfTKoK0EHahwCeARdFHakASIZWVZ4Q8CO4YgWO4QbCO6hWGEIKYZKzZ3DLog7UG4I6C1lWDSdWO4bpCO4bwUwKYEHajMDwOAlUkLojTUd4gaTZoRWC0YIB1eJLqo4EWiqRE0mjlcr1QkEeKFWOooBCHiB2CC4WA5wzB52rEQgfPHQwABAYJXOHQ2iO4XO6omFEJh1BEAgBGPJlWDIQbC0ej50qgHV1XPEwohKcwRbEvJ3EBQTrLFomkOwOjlR3C5w8GMAR8ClYuBLIgOCvN4HgIZFDQYbBlaOBR4YNCwA5B0XOpzvBHgWqTw4AFxB1EvQ6BAAI8GDZILEdgQBCqp3DPIRfIEQwABvJ1CvGkvGiwA6IAYoBCv6wCAAVOlQ6DAIWkL5ABEwN40Z1CAYJfCv7zEAJNWOYZ3KAIWq5yYHFYLOBLIrVCAIh7BOIzpECoYDDpw7BHAQDG1WqwGkAIN/CwIABLY4LDAAZ9BwAABvLCBC5IBBvOrO44BEAAmjAIPN0XOAJyHIAAgPEquBHBi4BAId+HwWiHxqJDRpYBDq2I1R3LIAQ6BAAOpPogABGgIDDOomk0nP5pIGd42Aq1ewI8CeZI6CHAJhCEAIDCdIo2B0er1esAQIZBC4Z9JlVW1leeKGp0es5+s6+s6ABB0oFBAIervWr0ulub7OqtWmdexJ4BGxB5G0V6pF6wItB0t6p9PvQABvINBudJudPzwXCHQwBDlY6BO4WIwPPPJbvDvA0BFgNzAAIDGugGCzrtHdYh1DAIOBrzxBPIgAIeIXNHgoBCGwYADzoVB0fNOpMyHQdW5+Bro7BHgQAB6jxJAAOjOYhxCAIukOoPN5ujdZFWqyyD0d6AwUrquBwAuB1I1FHgRJBMoQ9BWg1zzw0BDYI6B0R3DAAJ1BvMyp8rAAV4IQWBIodewAeCHAZ5IAAJoBAAXHHAJWDO4TtEdYQvEHgejAwIKClcqIQRdDXYbzFeoQBIGwIDDOot/VgQ6FAAIGBlgBCAAMzmZPBF4LzDACB1FAAOi1WjvFVr0zGYQ7GAAMAAYpPBwNeAIOIwOrfYOA1eA1WkAIWjAIekv4PBwCVBruBq5eBEYIABlcBF4wCEHw55CHwQABIQQBBABkzAILlCHQR1CFYavEPgsAAAIDEDQNdAwQAaHQNWEwQ0DHAh3KleBLoI7dHQKuFWQo0EAIsISoKdBHbyyHNgwADlVVpwEBDANWro7fd4Q6HO495vF5QgIYCd75eBHYUINAN5lQ3EA"));

const locale = require("locale");

const black = 0x0000;
const white = 0xFFFF;

let hour;
let minute;
let date;

function draw() {
  const d = new Date();

  const newHour = ('0' + d.getHours()).substr(-2);
  const newMinute = ('0' + d.getMinutes()).substr(-2);
  const newDate = locale.date(d).trim();

  g.setFontAlign(0, 0, 0);

  if (newHour !== hour) {
    g.setFontVector(48);
    g.setColor(black);
    g.drawString(hour, 64, 92);
    g.setColor(white);
    g.drawString(newHour, 64, 92);
    hour = newHour;
  }

  if (newMinute !== minute) {
    g.setFontVector(48);
    g.setColor(black);
    g.drawString(minute, 172, 92);
    g.setColor(white);
    g.drawString(newMinute, 172, 92);
    minute = newMinute;
  }

  if (newDate !== date) {
    g.setFontVector(12);
    g.setColor(black);
    g.drawString(date, 120, 228);
    g.setColor(0xFFFF);
    g.drawString(newDate, 120, 228);
    date = newDate;
  }
}

function drawAll() {
  hour = '';
  minute = '';
  date = '';
  g.drawImage(bob, 0, 0, { scale: 4 });
  draw();
}

Bangle.on('lcdPower', function(on) {
  if (on) {
    drawAll();
  }
});

Bangle.loadWidgets();
Bangle.drawWidgets();
setInterval(draw, 1000);
drawAll();

setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
