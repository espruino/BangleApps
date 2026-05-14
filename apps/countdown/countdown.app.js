const storage = require('Storage');
const SETTINGS_FILE = 'countdown.json';
const DEFAULT_GOAL = '2027-01-01';
const CURRENT_YEAR = new Date().getFullYear();

let isMenuOpen = false;

function toDateString(date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromDateString(dateString) {
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const y = +parts[0];
  const m = +parts[1];
  const d = +parts[2];
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  if (isNaN(date.getTime())) return null;
  return date;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function loadGoalDate() {
  const settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  const parsed = settings.goalDate && fromDateString(settings.goalDate);
  return parsed || fromDateString(DEFAULT_GOAL);
}

let goalDate = loadGoalDate();

function saveGoalDate(date) {
  goalDate = date;
  storage.writeJSON(SETTINGS_FILE, { goalDate: toDateString(date) });
}

function drawCountdown() {
  if (isMenuOpen) return;

  const nowMs = Date.now();
  let ms = goalDate.getTime() - nowMs;
  if (ms < 0) ms = 0;

  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  const text = `${d}d ${h}h ${m}m ${s.toString().padStart(2)}s`;

  g.clear();
  g.setFont('6x8', 2);
  g.setFontAlign(0, 0);
  g.drawString('COUNTDOWN', 88, 68);
  if (g.stringWidth(text) > g.getWidth() - 4) g.setFont('6x8', 1);
  g.drawString(text, 88, 88);
}

function showSettingsMenu() {
  isMenuOpen = true;

  let year = goalDate.getFullYear();
  let month = goalDate.getMonth() + 1;
  let day = goalDate.getDate();

  E.showMenu({
    '': { title: 'Goal Date' },
    '< Back': function() {
      isMenuOpen = false;
      E.showMenu();
      drawCountdown();
    },
    Year: {
      value: year,
      min: CURRENT_YEAR,
      max: 2100,
      step: 1,
      onchange: function(v) {
        year = v;
      }
    },
    Month: {
      value: month,
      min: 1,
      max: 12,
      step: 1,
      onchange: function(v) {
        month = v;
      }
    },
    Day: {
      value: day,
      min: 1,
      max: 31,
      step: 1,
      onchange: function(v) {
        day = v;
      }
    },
    Save: function() {
      const maxDay = getDaysInMonth(year, month);
      if (day > maxDay) day = maxDay;
      saveGoalDate(new Date(year, month - 1, day, 0, 0, 0, 0));
      isMenuOpen = false;
      E.showMenu();
      drawCountdown();
    }
  });
}

setWatch(function() {
  if (isMenuOpen) return;
  showSettingsMenu();
}, BTN, { repeat: true, edge: 'falling', debounce: 20 });

setInterval(drawCountdown, 1000);
drawCountdown();
