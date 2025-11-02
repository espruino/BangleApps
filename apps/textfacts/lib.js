exports = {};
exports.getCount = function() {
  return 237;
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
  var idxs = E.toUint8Array(atob("J1guOzAsMVJHQ0I1WEVpRUlBPzhCHkQzYj8zkDErTDI4HCo1J0g8PkAuYyZUWTFSJic3REEuKkE7TypEJT0tOzgoSDlDIlgbIWEkOSkbMjckPzkYQTI0WD0nH1Y1JzchJEhGVUUoOTpMJUNYNSJbQk5UKFoxK0wyOBwqNSdIPD5ALmMmVFlXMk9FLyI0EzkiWkUfVjU1Qk47OzhIOUMiWBshYSQ5GzI3PzkYQTI0WD0nNyFIRlVEKDk6TENXW1oxK0syOBwqNUg8PkAuY1RZKG42PTs5OlhJRCU/PDIyQEVXJCMiJyUkKCYjJyQp"));
  if (n<0 || n>=idxs.length) return;
  var idx = n ? E.sum(new Uint8Array(idxs.buffer,0,n))+1 : 0;
  var len = idxs[n]-1;
  return require("Storage").read("textsource.txt").substring(idx, idx+len);
};
exports.getRandomText = function() {
  let n = Math.floor(Math.random()*exports.getCount());
  return { idx : n, txt : exports.getText(n) };
};
