/* global document, Util, Puck, Set */
/* exported denormalizeSettings */

var fruitfulElement = document.querySelector("#fruitful tbody");
var decenteringElement = document.querySelector("#decentering tbody");
var btnSave = document.getElementById("btnSave");
var btnCancel = document.getElementById("btnCancel");
var settings = {};

const FIRST_CAT_IDX = 1;

// #region XXX: Ensure these are kept in sync between settings.js, loader-settings.js, and app.js
const SETTINGS_FILE = "harvester.json";
function getDefaultSettings() {
  var id1 = Math.round(Date.now()), id2 = id1 + 1; // XXX: Use proper UUIDs, probably with TS
  return {
    fruitful: [
      {},
      {
        color: 'Green', fg: '#0f0', gy: '#020',
        title: 'Work',
        target_min: 480, sec_today: 0, id: id1,
      },
    ],
    hour_color: 'Green',
    hour_fg: '#0f0',
    cur_mode: 0,
    last_reset: null,
    decentering: [
      {},
      {
        title: 'Social Media', sec_today: 0, id: id2,
        fg: '#f00', gy: '#200', color: 'Red',
      }
    ],
    fallow_denominator: 3,
    fallow_buffer: 0,
  };
}
function normalizeCat(cat, i, _arr) {
  if (0 === i) return cat; // XXX: Skip sentinels
  // TODO: Normalize or guess at next colors?
  cat.fg = cat.fg || g.theme.fg;
  cat.gy = cat.gy || '#222';
  cat.title = cat.title || '??';
  cat.sec_today = 0 | cat.sec_today;
  if (cat.target_min) cat.target_min = 0 | cat.target_min;
  if (!cat.id) {
    // TODO: Use proper UUID, probably via TS library
    if (!normalizeCat._seq) {
      normalizeCat._seq = 0;
    }
    cat.id = Math.round(Date.now()) + normalizeCat._seq++;
  }
  return cat;
}
function normalizeSettings(s) {
  var def = getDefaultSettings();
  if (s.fruitful) {
    s.fruitful = s.fruitful.map(normalizeCat);
  } else {
    s.fruitful = def.fruitful;
  }
  if (s.decentering) {
    s.decentering = s.decentering.map(normalizeCat);
  } else {
    s.decentering = def.decentering;
  }
  if (s.total_sec_by_cat) {
    for (let i = 1; i < s.fruitful.length; i++) {
      s.fruitful[i].sec_today = s.total_sec_by_cat[i];
    }
    for (let i = 1; i < s.decentering.length; i++) {
      s.decentering[i].sec_today = s.total_sec_by_cat[s.total_sec_by_cat.length - i];
    }
    s.fallow_buffer = s.total_sec_by_cat[0];
  }

  s.hour_color = s.hour_color || def.hour_color;
  s.hour_fg = s.hour_fg || def.hour_fg;
  s.fallow_denominator = s.fallow_denominator || def.fallow_denominator;
  s.cur_mode = s.cur_mode || def.cur_mode;
  s.fallow_buffer = s.fallow_buffer || def.fallow_buffer;
  return s;
}
function denormalizeSettings(s, pendingTimeCat) {
  delete s.hr_12; // TODO: Allow setting this independently
  if (pendingTimeCat){
    for (let i = 1; i < s.fruitful.length; i++) {
      s.fruitful[i].sec_today = pendingTimeCat[i];
    }
    for (let i = 1; i < s.decentering.length; i++) {
      s.decentering[i].sec_today = pendingTimeCat[pendingTimeCat.length - i];
    }
    s.fallow_buffer = pendingTimeCat[0];
  }
  if (s.total_sec_by_cat) {
    delete s.total_sec_by_cat;
  }
  return s;
}
// #endregion

// #region XXX: Ensure these are kept in sync between settings.js and loader-settings.js
const color_options = [
      'Lavender', 'Purple', 'Deep Blue', 'Medium Blue', 'Cyan', 'Dark Green', 'Green',
      'Yellow', 'Orange', 'Red', 'Brick', 'Gray', 'Blk/Wht' ];
const fg_code = [
      '#f0f', '#80f', '#00f', '#08f', '#0ff', '#080', '#0f0',
      '#ff0', '#f80', '#f00', '#800', '#888', null ];
const gy_code = [
      '#202', '#202', '#002', '#022', '#022', '#020', '#020',
      '#220', '#220', '#200', '#200', '#222', null ];
// #endregion

var needsNewLogFile = false;
function registerChange(affectsLog) {
  btnSave.disabled = false;
  btnCancel.disabled = false;
  if (true === affectsLog) needsNewLogFile = true;
}

function parseCategory(elem) {
  let color = elem.querySelector('*[name=color]').value;
  let iColor = color_options.indexOf(color);
  var cat = {
    title: elem.querySelector('input[name=title]').value,
    color: color, fg: fg_code[iColor], gy: gy_code[iColor],
  };
  let targetMin = elem.querySelector('input[name=target_min]')?.value;
  if (targetMin) cat.target_min = 0 | targetMin;
  return cat;
}

function saveToBangle() {
  Util.showModal('Saving settings...');
  console.log('Settings before save', settings);
  settings.fruitful = [{}];
  for (let fElem of fruitfulElement.children) {
    settings.fruitful.push(parseCategory(fElem));
  }
  settings.decentering = [{}];
  for (let dElem of decenteringElement.children) {
    settings.decentering.push(parseCategory(dElem));
  }

  if (needsNewLogFile) {
    console.log('Writing new log file for altered category list');
    Puck.eval('logStartNew(logCurFilenames()) != undefined', () => {});
    needsNewLogFile = false;
  }
  
  Util.writeStorage(SETTINGS_FILE, JSON.stringify(settings), _data => {
    Puck.eval('reloadFromWeb()', () => {
      btnSave.disabled = true;
      btnCancel.disabled = true;
      Util.hideModal();
    });
  });
}

function loadFromBangle() {
  Util.showModal('Loading settings...');
  // TODO: Unsnarl this budding callback chasm
  Puck.eval('logCurFilenames()', filenames => {
    let ul = document.getElementById('logs');
    for (let f of filenames) {
      let li = document.createElement('li'),filename = f;
      // TODO: Add deletion
      li.textContent = filename.replace(/^harvester-|\.csv$/g, '');
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        li.style.cursor = 'wait';
        Util.readStorageFile(filename, data => {
          li.style.cursor = 'pointer';
          Util.saveCSV(filename.replace(/\.csv$/, ''), data);
        });
      });
      ul.appendChild(li);
    }
    Util.readStorageJSON(SETTINGS_FILE, data => {
      settings = normalizeSettings(data);
      fruitfulElement.innerHTML = '';
      for (let i = FIRST_CAT_IDX; i < settings.fruitful.length; i++) {
        fruitfulElement.appendChild(createCategoryEdit(i, settings.fruitful[i]));
      }
      decenteringElement.innerHTML = '';
      for (let i = FIRST_CAT_IDX; i < settings.decentering.length; i++) {
        decenteringElement.appendChild(createCategoryEdit(-i, settings.decentering[i]));
      }

      btnSave.disabled = true;
      btnCancel.disabled = true;
      Util.hideModal();
    });
  });
}

/* exported deleteCategory */
function deleteCategory(evt) {
  var elemCat = evt.target.closest('[data-idx]');
  if (!elemCat) {
    console.log("Couldn't find elements to delete", evt);
    return;
  }
  var elemContainer = elemCat.parentNode;
  elemContainer.removeChild(elemCat);
  registerChange(true);
}

function createCategoryEdit(idx, {title, color, target_min}) {
  let elemCat = document.createElement('tr');
  elemCat.dataset.idx = idx;
  let iColor = color_options.indexOf(color);
  let colorList = '';
  for (let i = 0; i < color_options.length; i++) {
    let sel = iColor === i ? 'selected' : '';
    colorList += `<option style='background-color: ${fg_code[i]};' ${sel}>${color_options[i]}</option>`;
  }
  let h = `
  <td><select name=color onchange="registerChange()">${colorList}</select></td>
  <td><input name=title type=text minlength=1 maxlength=40 value='${title}' oninput="registerChange()" /></td>
  `;
  if (target_min) {
    h += `
    <td><input list=targets name=target_min type=number min=1 max=720
               value='${target_min}' onchange="registerChange()" /></td>
    `;
  }
  h += `
  <td><button onclick="deleteCategory(event)">X</button></td>
  `;
  elemCat.innerHTML = h;
  return elemCat;
}

function addNewCategory(isFruitful) {
  let elemContainer = isFruitful ? fruitfulElement : decenteringElement;
  let i = elemContainer.children.length + 1;
  let allCatElems = Array.from(fruitfulElement.children).concat(Array.from(decenteringElement.children));
  let usedColors = new Set(allCatElems.map(cat => parseCategory(cat).color));
  let availColors = color_options.filter(color => !usedColors.has(color));
  let newColor = availColors[0] ||
                 color_options[(Math.floor(Math.random() * color_options.length))];
  let skeleton = {title: 'Category ' + i, color: newColor};
  if (isFruitful) skeleton.target_min = 15;
  elemContainer.appendChild(createCategoryEdit(i, skeleton));
  registerChange(true);
}

btnSave.addEventListener("click", saveToBangle);
btnCancel.addEventListener("click", loadFromBangle);
document.getElementById('addFruitful').addEventListener("click", () => addNewCategory(true));
document.getElementById('addDecentering').addEventListener("click", () => addNewCategory(false));
// Called by app loader on start
/* exported onInit */
function onInit() {
  loadFromBangle();
}

// TODO: Add buttons below each section to add new categories
