exports = {};
exports.getCount = function() {
  return 288;
};
exports.getText = function(n) {
  /*var s = require("Storage").read("textsource.txt");
  var idx = s.indexOf("\n");
  var lengths = [idx];
  while (idx>=0) {
    var next = s.indexOf("\n",idx+1);
    if (next>=0) {
      var len = next-idx;
      if (len>255) throw new Error("Line too long!");
      lengths.push(len);
    }
    idx = next;
  }
  print(`Count = ${lengths.length}`);
  print(`var idxs = E.toUint8Array(atob("${btoa(lengths)}"));`);*/
  var idxs = E.toUint8Array(atob("PUovVCpNWElbLi0uKkEsPydJTVhkKSBVNDFNO1EsTz5ELjIvMTwyKiowRl8mMj4/MCczSjczKEFRLCxKGE4rLyxdY1YdMURdX1I5V0oePEJQMiZHQEo4NVQyWVNSPUNCMS1PLS5GZhlHNUI2TVFDRkU+O2Q8YTEwNTtAKzxYGiQxSDM1RXAyMRlpIzFFO0I8MjE/KDRJNz07PVNBRUA4UzIuP0E6VFBDNEMqO0gyMjExUFA4KlQxR0Y/TChWTBouODI4NVJIQkAeLEFENi8vPi5EKx0mQCouMTUcTlBWM0VOYi81MztIRC8sRDI1PzwqLSk5LzwvPTkzQEgwSk4xPTtCLFNFHSJINkFNJjg1RipGNUlAHks5OShIQDgbME0q"));
  if (n<0 || n>=idxs.length) return;
  var idx = n ? E.sum(new Uint8Array(idxs.buffer,0,n))+1 : 0;
  var len = idxs[n]-1;
  return require("Storage").read("textsource.txt").substring(idx, idx+len);
};
exports.getRandomText = function() {
  let n = Math.floor(Math.random()*exports.getCount());
  return { idx : n, txt : exports.getText(n) };
};