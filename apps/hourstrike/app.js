const storage = require('Storage');
var settings = storage.readJSON('hourstrike.json', 1);

function updateSettings() {
  storage.write('hourstrike.json', settings);
}

function showMainMenu() {
  var mode_txt = ['Off','1 min','5 min','10 min','1/4 h','1/2 h','1 h'];
  var mode_interval = [-1,60,300,600,900,1800,3600];
  const mainmenu = {'': { 'title': 'Hour Strike' }};
  mainmenu['Next strike '+settings.next_hour+':'+settings.next_minute] = function(){};
  mainmenu['Notify every'] = {
    value: mode_interval.indexOf(settings.interval),
    min: 0, max: 6, format: v => mode_txt[v],
    onchange: v => {
      settings.interval = mode_interval[v];
      if (v===0) {settings.next_hour = -1; settings.next_minute = -1;}
      updateSettings();}};
  mainmenu.Start = {
    value: settings.start, min: 0, max: 23, format: v=>v+':00',
    onchange: v=> {settings.start = v; updateSettings();}};
  mainmenu.End = {
    value: settings.end, min: 0, max: 23, format: v=>v+':59',
    onchange: v=> {settings.end = v; updateSettings();}};
  mainmenu.Strength = {
    value: settings.vlevel*10, min: 1, max: 10, format: v=>v/10,
    onchange: v=> {settings.vlevel = v/10; updateSettings();}};
  mainmenu['< Back'] = ()=>load();
  return E.showMenu(mainmenu);
}

showMainMenu();
