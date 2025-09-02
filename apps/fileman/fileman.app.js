const STOR = require("Storage");

const n = 9;
var nstart = 0;
var nend;
var m;
var files;

function delete_file(fn) {
  E.showPrompt(/*LANG*/"Delete\n"+fn+"?", {buttons: {/*LANG*/"No":false, /*LANG*/"Yes":true}}).then(function(v) {
    if (v) {
      if (fn.charCodeAt(fn.length-1)==1) {
        var fh = STOR.open(fn.substr(0, fn.length-1), "r");
        fh.erase();
      }
      else STOR.erase(fn);
    }
  }).then(function() { files=get_pruned_file_list(); }).then(drawMenu);
}

function get_length(fn) {
  var len;
  if (fn.charCodeAt(fn.length-1)==1) {
    var fh = STOR.open(fn.substr(0, fn.length-1), "r");
    len = fh.getLength();
  }
  else len = STOR.read(fn).length;
  return len;
}

function display_file(fn, qJS) {
  g.clear().setColor(1, 1, 1);
  var qStorageFile = (fn.charCodeAt(fn.length-1)==1);
  var np = 0;
  Terminal.println("");
  var file_len = get_length(fn);
  var fb = (qStorageFile ? STOR.open(fn.substr(0, fn.length-1), "r") : STOR.read(fn));
  for (var i=0; i<file_len; ++i) {
    if (np++ > 38) {
      Terminal.println("");
      np = 0;
    }
    var c = (qStorageFile ? fb.read(1) : fb[i]);
    if (c=="\n") np = 0;
    if (qJS && !qStorageFile && c==";" && fb[i+1]!="\n") {
      Terminal.println(";");
      np = 0;
    }
    else Terminal.print(c);
  }
  Terminal.println("");
}

function visit_file(fn) {
  var menu = {
    '' : {'title' : fn + (fn.charCodeAt(fn.length-1)==1 ? "(S)" : "")}
  };
  var qJS = fn.endsWith(".js");
  menu['Length: '+get_length(fn)+' bytes'] = function() {};
  menu['Display file'] = function () { display_file(fn, qJS); };
  if (qJS && !fn.endsWith(".wid.js")) menu['Load file'] = function() { load(fn); }
  if (fn.endsWith(".img")) menu['Display image'] = function() { g.clear().drawImage(STOR.read(fn),0,20); }
  menu['Delete file'] = function () { delete_file(fn); }
  menu['< Back'] = drawMenu;
  E.showMenu(menu);
}

function showFree() {
  var free = (require("Storage").getFree() / (1024*1024)).toFixed(2) + " MB\n";
  E.showAlert(free).then( function() { drawMenu(); } );
}

function jumpTo(v) {
  nstart = Math.round((v/100)*files.length);
  if (nstart >= files.length) { nstart = 0; }
  drawMenu();
}

function drawUtilMenu() {
  var menu = {
    '' : {'title' : "Utils"}
  };
  menu['Show free'] = showFree;
  for (let i=0; i<10; i++) {
    let v = i*10;
    menu['Jump to '+v+'%'] = function() { jumpTo(v); };
  }
  menu['< Back'] = drawMenu;
  E.showMenu(menu);
}

function drawMenu() {
  nend = (nstart+n<files.length)?nstart+n : files.length;
  var menu = {
    '': { 'title': 'Dir('+nstart+'-'+nend+')/'+files.length }
  };
  menu["< prev"] = function() {
    nstart -= n;
    if (nstart<0) nstart = files.length-n>0 ? files.length-n : 0;
    menu = {};
    drawMenu();
  };
  menu["> next"] = function() {
    if (nstart+n<files.length) nstart += n;
    else nstart = 0;
    menu = {};
    drawMenu();
    m.move(-1);
  };
  menu["[utils...]"] = function() {
    drawUtilMenu();
  };
  for (var i=nstart; i<nend; ++i) {
    menu[files[i]] = visit_file.bind(null, files[i]);
  }
  m = E.showMenu(menu);
}

function get_pruned_file_list() {
  // get storagefile list
  var sf = STOR.list(/\x01$/).map(s=>s.slice(0,-1));
  var sffilter = f=>!sf.includes(f.slice(0,-1)) || f.endsWith("\x01");
  // get files - put '.' last
  var fl = STOR.list(/^[^\.]/).filter(sffilter);
  fl.sort();
  fl = fl.concat(STOR.list(/^\./).filter(sffilter).sort());
  return fl;
}

files = get_pruned_file_list();
drawMenu();
