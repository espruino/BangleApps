exports = {};
exports.getCount = function() {
  return 316;
};
exports.getText = function(n) {
  /*
  var s = require("Storage").read("textsource.txt");
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
  var idxs = E.toUint8Array(atob("J1guOzAsMVJHQ0I1WEVpRUlBPzhCHkQzYj8zMUVJGylDIS8tKk5XRSc3RCZBLipBO08qRCU9LTgoSDlDIlgbIWEkOSkbMjckPzkYQTI0WD0nH1Y1JzchJEhGVUUoOTpMJUNYNSJbQk5UKFoxK0wyOBwqNSdIPD5ALmMmVFkxUiYnN0RBLipBO08qRCU9LTs4KEg5QyJYGyFhJDkpGzI3JD85GEEyNFg9Jx9WNSc3ISRIRlVFKDk6TCVDWDUiW0JOVChaMStMMjgcKjUnSDw+QC5jJlRZVzJPRS8iNBM5IlpFH1Y1NUJOOzs4SDlDIlgbIWEkORsyNz85GEEyNFg9JzchSEZVRCg5OkxDV1taMStLMjgcKjVIPD5ALmNUWShuNj07OTpYSUQlPzwyMkBFVyQjIiclJCgmIyckKQ=="));

  if (n<0 || n>=idxs.length) return;
  var idx = n ? E.sum(new Uint8Array(idxs.buffer,0,n))+1 : 0;
  var len = idxs[n]-1;
  return require("Storage").read("textsource.txt").substring(idx, idx+len);
};
exports.getRandomText = function() {
  let n = Math.floor(Math.random()*exports.getCount());
  return { idx : n, txt : exports.getText(n) };
};
