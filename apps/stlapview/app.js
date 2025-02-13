const storage = require("Storage");

Bangle.loadWidgets();
Bangle.drawWidgets();

function pad(number) {
  return ('00' + parseInt(number)).slice(-2);
}

function fileNameToDateString(fileName) {
  let timestamp = 0;
  let foundDigitYet = false;
  for (let character of fileName) {
    if ('1234567890'.includes(character)) {
      foundDigitYet = true;
      timestamp *= 10;
      timestamp += parseInt(character);
    } else if (foundDigitYet) break;
  }
  let date = new Date(timestamp);

  let dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  let completed = storage.readJSON(fileName).final;

  return `${dayOfWeek} ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` + (completed ? '' : ' (running)');
}

function msToHumanReadable(ms) {

  let hours = Math.floor(ms / 3600000);
  let minutes = Math.floor((ms % 3600000) / 60000);
  let seconds = Math.floor((ms % 60000) / 1000);
  let hundredths = Math.floor((ms % 1000) / 10);

  return `${hours}:${pad(minutes)}:${pad(seconds)}:${pad(hundredths)}`;
}

function view(fileName) {
  let lapTimes = [];
  let fileData = storage.readJSON(fileName).splits;
  for (let i = 0; i < fileData.length; i++) {
    if (i == 0) lapTimes.push(fileData[i]);
    else lapTimes.push(fileData[i] - fileData[i - 1]);
  }

  let fastestIndex = 0;
  let slowestIndex = 0;
  for (let i = 0; i < lapTimes.length; i++) {
    if (lapTimes[i] < lapTimes[fastestIndex]) fastestIndex = i;
    else if (lapTimes[i] > lapTimes[slowestIndex]) slowestIndex = i;
  }

  let lapMenu = {
    '': {
      'title': fileNameToDateString(fileName),
      'back': () => showMainMenu()
    },
  };
  lapMenu[`Total time: ${msToHumanReadable(fileData[fileData.length - 1])}`] = () => { };
  lapMenu[`Fastest lap: ${fastestIndex + 1}: ${msToHumanReadable(lapTimes[fastestIndex])}`] = () => { };
  lapMenu[`Slowest lap: ${slowestIndex + 1}: ${msToHumanReadable(lapTimes[slowestIndex])}`] = () => { };
  lapMenu[`Average lap: ${msToHumanReadable(fileData[fileData.length - 1] / fileData.length)}`] = () => { };

  for (let i = 0; i < lapTimes.length; i++) {
    lapMenu[`Lap ${i + 1}: ${msToHumanReadable(lapTimes[i])}`] = () => { };
  }

  lapMenu.Delete = () => {
    E.showMenu({
      '': {
        'title': 'Are you sure?',
        'back': () => { E.showMenu(lapMenu); }
      },
      'Yes': () => {
        storage.erase(fileName);
        showMainMenu();
      },
      'No': () => { E.showMenu(lapMenu); }
    });
  };

  E.showMenu(lapMenu);
}

function showMainMenu() {
  let LAP_FILES = storage.list(/stlap-[0-9]*\.json/);
  LAP_FILES.sort();
  LAP_FILES.reverse();

  let mainMenu = {
    '': {
      'title': 'Sessions',
      'back': () => load()
    }
  };

  for (let lapFile of LAP_FILES) {
    // `let` variables in JS have special behaviour in loops,
    // where capturing them captures that instance of the variable,
    // but for espruino we need to do a slightly older trick:
    mainMenu[fileNameToDateString(lapFile)] = ((lapFile) => () => view(lapFile))(lapFile);
  }

  if (LAP_FILES.length == 0) {
    mainMenu['No data'] = _ => { load(); };
  }

  E.showMenu(mainMenu);
}

showMainMenu();