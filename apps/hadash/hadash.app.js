/*
 * Home-Assistant Dashboard - Bangle.js
 */

const APP_NAME = 'hadash';

var scroller;

// Load settings
var settings = Object.assign({
  menu: [
    { type: 'state', title: 'Check for updates', id: 'update.home_assistant_core_update' },
    { type: 'service', title: 'Create Notification', domain: 'persistent_notification', service: 'create',
        data: { 'message': 'test notification', 'title': 'Test'} },
    { type: 'menu', title: 'Sub-menu', data:
      [
        { type: 'state', title: 'Check for Supervisor updates', id: 'update.home_assistant_supervisor_update' },
        { type: 'service', title: 'Restart HA', domain: 'homeassistant', service: 'restart', silent: true, data: {} }
      ]
    },
    { type: 'service', title: 'Custom Notification', domain: 'persistent_notification', service: 'create',
        data: { 'title': 'Not via input'},
        input: { 'message': { options: [], value: 'Pre-filled text' },
                 'notification_id': { options: [ 123, 456, 136 ], value: 999, label: "ID" } } },
  ],
  HAbaseUrl: '',
  HAtoken: '',
}, require('Storage').readJSON(APP_NAME+'.json', true) || {});


// wrapper to show a menu (preserving scroll position)
function showScrollerMenu(menu) {
  const r = E.showMenu(menu).scroller;
  scroller = r;
  return r;
}


// query an entity state
function queryState(title, id, level) {
  menus[level][''].scroll = scroller.scroll;
  E.showMessage('Fetching entity state from HA', { title: title });
  Bangle.http(settings.HAbaseUrl+'/states/'+id, {
    headers: {
      'Authorization': 'Bearer '+settings.HAtoken,
      'Content-Type': 'application/json'
    },
  }).then(data => {
    //console.log(data);
    let HAresp = JSON.parse(data.resp);
    let title4prompt = title;
    let msg = HAresp.state;
    if ('attributes' in HAresp) {
      if ('friendly_name' in HAresp.attributes)
        title4prompt = HAresp.attributes.friendly_name;
      if ('unit_of_measurement' in HAresp.attributes)
        msg += HAresp.attributes.unit_of_measurement;
    }
    E.showPrompt(msg, { title: title4prompt, buttons: {OK: true} }).then((v) => { showScrollerMenu(menus[level]); });
  }).catch( error => {
    console.log(error);
    E.showPrompt('Error querying state!', { title: title, buttons: {OK: true} }).then((v) => { showScrollerMenu(menus[level]); });
  });
}


// call a service
function callService(title, domain, service, data, level, silent) {
  menus[level][''].scroll = scroller.scroll;
  E.showMessage('Calling HA service', { title: title });
  Bangle.http(settings.HAbaseUrl+'/services/'+domain+'/'+service, {
    method: 'POST',
    body: data,
    headers: {
      'Authorization': 'Bearer '+settings.HAtoken,
      'Content-Type': 'application/json'
    },
  }).then(data => {
    //console.log(data);
    if (! silent) {
      return E.showPrompt('Service called successfully', { title: title, buttons: {OK: true} });
    }
  }).then(() => {
    showScrollerMenu(menus[level]);
  }).catch( error => {
    console.log(error);
    E.showPrompt('Error calling service!', { title: title, buttons: {OK: true} }).then((v) => { showScrollerMenu(menus[level]); });
  });
}


// callbacks for service input menu entries
function serviceInputChoiceChange(v, key, entry, level) {
  entry.input[key].value = entry.input[key].options[v];
  getServiceInputData(entry, level);
}

function serviceInputFreeform(key, entry, level) {
  require("textinput").input({text: entry.input[key].value}).then(result => {
    entry.input[key].value = result;
    getServiceInputData(entry, level);
  });
}

// get input data before calling a service
function getServiceInputData(entry, level) {
  menus[level][''].scroll = scroller.scroll;
  let serviceInputMenu = {
    '': {
      'title': entry.title,
      'back': () => showScrollerMenu(menus[level])
    },
  };
  let CBs = {};
  for (let key in entry.input) {
    // pre-fill data with default values
    if ('value' in entry.input[key])
      entry.data[key] = entry.input[key].value;

    let label = ( ('label' in entry.input[key] && entry.input[key].label) ? entry.input[key].label : key );
    let key4CB = key;

    if ('options' in entry.input[key] && entry.input[key].options.length) {
      // give choice from a selection of options
      let idx = -1;
      for (let i in entry.input[key].options) {
        if (entry.input[key].value == entry.input[key].options[i]) {
          idx = i;
        }
      }
      if (idx == -1) {
        idx = entry.input[key].options.push(entry.input[key].value) - 1;
      }
      // the setTimeout method can not be used for the "format" CB since it expects a return value:
      CBs[`${key}_format`] = ((key) => function(v) { return entry.input[key].options[v]; })(key);
      serviceInputMenu[label] = {
        value: parseInt(idx),
        min: 0,
        max: entry.input[key].options.length - 1,
        format: CBs[key+'_format'],
        onchange: (v) => setTimeout(serviceInputChoiceChange, 10, v, key4CB, entry, level)
      };

    } else {
      // free-form text input
      serviceInputMenu[label] = () => setTimeout(serviceInputFreeform, 10, key4CB, entry, level);
    }
  }
  // menu entry to actually call the service:
  serviceInputMenu['Call service'] = function() { callService(entry.title, entry.domain, entry.service, entry.data, level, entry.silent); };
  E.showMenu(serviceInputMenu);
}


// menu hierarchy
var menus = [];


// add menu entries
function addMenuEntries(level, entries) {
  for (let i in entries) {
    let entry = entries[i];
    let entryCB;

    // is there a menu entry title?
    if (! ('title' in entry) || ! entry.title)
      entry.title = 'TBD';

    switch (entry.type) {
      case 'state':
        /*
         * query entity state
         */
        if ('id' in entry && entry.id) {
          entryCB = () => setTimeout(queryState, 10, entry.title, entry.id, level);
        }
        break;

      case 'service':
        /*
         * call HA service
         */
        if (! ('silent' in entry))
          entry.silent = false;
        if ('domain' in entry && entry.domain && 'service' in entry && entry.service) {
          if (! ('data' in entry))
            entry.data = {};
          if ('input' in entry) {
            // get input for some data fields first
            entryCB = () => setTimeout(getServiceInputData, 10, entry, level);
          } else {
            // call service straight away
            entryCB = () => setTimeout(callService, 10, entry.title, entry.domain, entry.service, entry.data, level, entry.silent);
          }
        }
        break;

      case 'menu':
        /*
         * sub-menu
         */
        entryCB = () => setTimeout(showSubMenu, 10, level + 1, entry.title, entry.data);
        break;
    }

    // only attach a call-back to menu entry if it's properly configured
    if (! entryCB) {
      menus[level][entry.title + ' - not correctly configured!'] = {};
    } else {
      menus[level][entry.title] = entryCB;
    }
  }
}


// create and show a sub menu
function showSubMenu(level, title, entries) {
  menus[level - 1][''].scroll = scroller.scroll;
  menus[level] = {
    '': {
      'title': title,
      'back': () => showScrollerMenu(menus[level - 1])
    },
  };
  addMenuEntries(level, entries);
  showScrollerMenu(menus[level]);
}


/*
 * create the main menu
 */
menus[0] = {
  '': {
    'title': 'HA-Dash',
    'back': () => load()
  },
};
addMenuEntries(0, settings.menu);

// check required configuration
if (! settings.HAbaseUrl || ! settings.HAtoken) {
  E.showAlert('The app is not yet configured!', 'HA-Dash').then(() => showScrollerMenu(menus[0]));
} else {
  showScrollerMenu(menus[0]);
}

