#!/usr/bin/nodejs

// https://stackoverflow.com/questions/49129643/how-do-i-merge-an-array-of-uint8arrays

var pc = 1;
const hs = require('./heatshrink.js');

if (pc) {
    fs = require('fs');
    var print=console.log;
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
    let data = [];
    var directory = '';
    var json = {};
    for (f of files) {
        let f_rec = {};
        d = fs.readFileSync(dir+f);
        if (0) {
            cs = hs.compress(d);
            f_rec.comp = "hs";
        } else
            cs = d;
        print("Processing", f, cur, d.length, cs.length);
        data.push(cs);
        f_rec.st = cur;
        var len = cs.length;
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
    fs.writeFileSync(tar, header);
    for (d of data)
        fs.appendFileSync(tar, Buffer.from(d));
    fs.appendFileSync(tar, directory);
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
  writeTar("delme.mtar", "delme/");
else {
  print(readTarFile("delme.mtar", "ahoj"));
  print(readTarFile("delme.mtar", "nazdar"));
}
    
