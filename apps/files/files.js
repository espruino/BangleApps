const storage = require('Storage');

const boolFormat = (v) => v ? "On" : "Off";

let m;

function showMainMenu() {
  const mainmenu = {
    '': {
      'title': 'App Manager',
    },
    'Free': {
      value: undefined,
      format: (v) => {
        return storage.getFree();
      },
      onchange: () => {}
    },
    'Compact': () => {
      E.showMessage('Compacting...');
      try {
        storage.compact();
      } catch (e) {
      }
      m = showMainMenu();
    },
    'Apps': ()=> m = showApps(),
    '< Back': ()=> {load();}
  };
  return E.showMenu(mainmenu);
}

function eraseApp(app) {
  E.showMessage('Erasing\n' + app.name + '...');
  storage.erase(app['']);
  storage.erase(app.icon);
  storage.erase(app.src);
}

function showAppMenu(app) {
  const appmenu = {
    '': {
      'title': app.name,
    },
    '< Back': () => m = showApps(),
    'Erase': () => {
      E.showPrompt('Erase\n' + app.name + '?').then((v) => {
        if (v) {
          Bangle.buzz(100, 1);
          eraseApp(app);
          m = showApps();
        } else {
          m = showAppMenu(app)
        }
      });
    }
  };
  return E.showMenu(appmenu);
}

function showApps() {
  const appsmenu = {
    '': {
      'title': 'Apps',
    },
    '< Back': () => m = showMainMenu(),
  };

  var list = storage.list(/\.info$/).filter((a)=> {
    return a !== 'setting.info';
  }).sort().map((app) => {
    var ret = storage.readJSON(app,1)||{};
    ret[''] = app;
    return ret;
  });

  if (list.length > 0) {
    list.reduce((menu, app) => {
      menu[app.name] = () => m = showAppMenu(app);
      return menu;
    }, appsmenu);
    appsmenu['Erase All'] = () => {
      E.showPrompt('Erase all?').then((v) => {
        if (v) {
          Bangle.buzz(100, 1);
          for (var n = 0; n < list.length; n++)
            eraseApp(list[n]);
        }
        m = showApps();
      });
    };
  } else {
    appsmenu['...No Apps...'] = {
      value: undefined,
      format: ()=> '',
      onchange: ()=> {}
    };
  }
  return E.showMenu(appsmenu);
}

m = showMainMenu();
