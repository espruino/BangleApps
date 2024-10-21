exports = {};
exports.getCount = function() {
  return 162;
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
  var idxs = E.toUint8Array(atob("PVguLS4qQScgVTtRLC4vMTwyKiowJjI+PzAnSigsLCssHTFSOkRCMiZHSjhUWVNSPUNCLU8uRzVCNk1RQ0Y7ZDwxMDU7QFgkMTM1RTJpIzFFO0I8KDRJPVNBQDIuPzsyMjFQOEdGPyguODI4LkhCQB5BNi8uRCsqMTVOVjNFTmI1O0QyPyk5PC89M0gwTjE7QixTRSI2QSY1RkY1SUs5OBsw"));
  if (n<0 || n>=idxs.length) return;
  var idx = n ? E.sum(new Uint8Array(idxs.buffer,0,n))+1 : 0;
  var len = idxs[n]-1;
  return require("Storage").read("textsource.txt").substring(idx, idx+len);
};
exports.getRandomText = function() {
  let n = Math.floor(Math.random()*exports.getCount());
  return { idx : n, txt : exports.getText(n) };
};