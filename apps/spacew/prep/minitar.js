#!/usr/bin/nodejs

var pc = 1;
var hack = 0;
const hs = require('./heatshrink.js');

if (pc) {
    fs = require('fs');
    var print=console.log;
} else {
  
}

function writeDir(json) {
    json_str = JSON.stringify(json, "", " ");
    dirent = '' + json_str.length;
    while (dirent.length < 6)
        dirent = dirent + ' ';
    return dirent + json_str;
}

function writeTar(tar, dir) {
    var h_len = 16;
    var cur = h_len;
    files = fs.readdirSync(dir);
    data = '';
    var directory = '';
    var json = {};
    for (f of files) {
        d = fs.readFileSync(dir+f);
        cs = d;
        //cs = String.fromCharCode.apply(null, hs.compress(d))
        print("Processing", f, cur, d.length, cs.length);
        //if (d.length == 42) continue;
        data = data + cs;
        var f_rec = {};
        f_rec.st = cur;
        var len = d.length;
        f_rec.si = len;
        cur = cur + len;
        json[f] = f_rec;
        json_str = JSON.stringify(json, "", " ");
        if (json_str.length < 16000)
            continue;
        directory += writeDir(json);
        json = {};
    }
    directory += writeDir(json);
    directory += '-1    ';

    size = cur;
    header = '' + size;
    while (header.length < h_len) {
        header = header+' ';
    }
    if (!hack)
        fs.writeFileSync(tar, header+data+directory);
    else
        fs.writeFileSync(tar, directory);
}

function readTarFile(tar, f) {
  const st = require('Storage');
  json_off = st.read(tar, 0, 16) * 1;
  print(json_off);
  json = st.read(tar, json_off, -1);
  files = JSON.parse(json);
  rec = files[f];
  return st.read(tar, rec.st, rec.si);
}

if (pc)
  writeTar("delme.mtaz", "delme/");
else {
  print(readTarFile("delme.mtar", "ahoj"));
  print(readTarFile("delme.mtar", "nazdar"));
}
    
