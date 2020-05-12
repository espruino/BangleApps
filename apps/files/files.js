const store = require('Storage');

const boolFormat = (v) => v ? "On" : "Off";

function showMainMenu() {
  const mainmenu = {
    '': {
      'title': 'App Manager',
    },
    'Free': {
      value: undefined,
      format: (v) => {
        return store.getFree();
      },
      onchange: () => {}
    },
    'Compact': () => {
      E.showMessage('Compacting...');
      try {
        store.compact();
      } catch (e) {
      }
      showMainMenu();
    },
    'Apps': ()=> showApps(),
    'Sort Apps': () => showSortAppsMenu(),
    '< Back': ()=> {load();}
  };
  E.showMenu(mainmenu);
}

function isGlob(f) {
  return /[?*]/.test(f);
}

function globToRegex(pattern) {
  const ESCAPE = '.*+-?^${}()|[]\\';
  const regex = pattern.replace(/./g, c => {
    switch (c) {
      case '?': return '.';
      case '*': return '.*';
      default: return ESCAPE.includes(c) ? ('\\' + c) : c;
    }
  });
  return new RegExp('^'+regex+'$');
}

function eraseFiles(app) {
  app.files.split(",").forEach(f=>store.erase(f));
}

function eraseData(app) {
  if(!app.data) return;
  const d=app.data.split(';'),
    files=d[0].split(','),
    sFiles=(d[1]||'').split(',');
  let erase = f=>store.erase(f);
  files.forEach(f=>{
    if (!isGlob(f)) erase(f);
    else store.list(globToRegex(f)).forEach(erase);
  });
  erase = sf=>store.open(sf,'r').erase();
  sFiles.forEach(sf=>{
    if (!isGlob(sf)) erase(sf);
    else store.list(globToRegex(sf+'\u0001'))
      .forEach(fs=>erase(fs.substring(0,fs.length-1)));
  });
}
function eraseApp(app, files,data) {
  E.showMessage('Erasing\n' + app.name + '...');
  if (files) eraseFiles(app);
  if (data) eraseData(app);
}
function eraseOne(app, files,data){
  E.showPrompt('Erase\n'+app.name+'?').then((v) => {
    if (v) {
      Bangle.buzz(100, 1);
      eraseApp(app, files, data);
      showApps();
    } else {
      showAppMenu(app);
    }
  });
}
function eraseAll(apps, files,data) {
  E.showPrompt('Erase all?').then((v) => {
    if (v) {
      Bangle.buzz(100, 1);
      for(var n = 0; n<apps.length; n++)
        eraseApp(apps[n], files,data);
    }
    showApps();
  });
}

function showAppMenu(app) {
  let appmenu = {
    '': {
      'title': app.name,
    },
    '< Back': () => showApps(),
  };
  if (app.data) {
    appmenu['Erase Completely']    = () => eraseOne(app, true, true);
    appmenu['Erase App,Keep Data'] = () => eraseOne(app, true, false);
    appmenu['Only Erase Data']     = () => eraseOne(app, false, true);
  } else {
    appmenu['Erase'] = () => eraseOne(app, true, false);
  }
  E.showMenu(appmenu);
}

function showApps() {
  const appsmenu = {
    '': {
      'title': 'Apps',
    },
    '< Back': () => showMainMenu(),
  };

  var list = store.list(/\.info$/).filter((a)=> {
    return a !== 'setting.info';
  }).sort().map((app) => {
    var ret = store.readJSON(app,1)||{};
    ret[''] = app;
    return ret;
  });

  if (list.length > 0) {
    list.reduce((menu, app) => {
      menu[app.name] = () => showAppMenu(app);
      return menu;
    }, appsmenu);
    appsmenu['Erase All'] = () => {
      E.showMenu({
        '': {'title': 'Erase All'},
        'Erase Everything':     () => eraseAll(list, true, true),
        'Erase Apps,Keep Data': () => eraseAll(list, true, false),
        'Only Erase Data':      () => eraseAll(list, false, true),
        '< Back': () => showApps(),
      });
    };
  } else {
    appsmenu['...No Apps...'] = {
      value: undefined,
      format: ()=> '',
      onchange: ()=> {}
    };
  }
  E.showMenu(appsmenu);
}

function showSortAppsMenu() {
  const sorterMenu = {
    '': {
      'title': 'App Sorter',
    },
    '< Back': () => showMainMenu(),
    'Sort: manually': ()=> showSortAppsManually(),
    'Sort: alph. ASC': () => {
      E.showMessage('Sorting:\nAlphabetically\nascending ...');
      sortAlphabet(false);
    },
    'Sort: alph. DESC': () => {
      E.showMessage('Sorting:\nAlphabetically\ndescending ...');
      sortAlphabet(true);
    }
  };
  E.showMenu(sorterMenu);
}

function showSortAppsManually() {
  const appsSorterMenu = {
    '': {
      'title': 'Sort: manually',
    },
    '< Back': () => showSortAppsMenu(),
  };
  let appList = getAppsList();
  if (appList.length > 0) {
    appList.reduce((menu, app) => {
      menu[app.name] = {
        value: app.sortorder || 0,
        min: 0,
        max: appList.length,
        step: 1,
        onchange: val => setSortorder(app, val)
      };
      return menu;
    }, appsSorterMenu);
  } else {
    appsSorterMenu['...No Apps...'] = {
      value: undefined,
      format: ()=> '',
      onchange: ()=> {}
    };
  }
  E.showMenu(appsSorterMenu);
}

function setSortorder(app, val) {
  app = store.readJSON(app.id + '.info', 1);
  app.sortorder = val;
  store.write(app.id + '.info', JSON.stringify(app));
}

function getAppsList() {
  return store.list('.info').map((a)=> {
    let app = store.readJSON(a, 1) || {};
    if (app.type !== 'widget') {
      return {id: app.id, name: app.name, sortorder: app.sortorder};
    }
  }).filter((a) => a).sort(sortHelper());
}

function sortAlphabet(desc) {
  let appsSorted = desc ? getAppsList().reverse() : getAppsList();
  appsSorted.forEach((a, i) => {
    setSortorder(a, i);
  });
  showSortAppsMenu();
}

function sortHelper() {
  return (a, b) => (a.name > b.name) - (a.name < b.name);
}

showMainMenu();
