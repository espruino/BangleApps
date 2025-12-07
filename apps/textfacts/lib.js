exports = {};
exports.getCount = function() {
  return 317;
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
  var idxs = E.toUint8Array(atob("Vy4tLipBJyBVO1EsLi8xPDIqKjAmMj4/MCdKKCwsKywdMVI6REIyJkdKOFRZU1I9Q0ItTy5HNUI2TVFDRjtkPDEwNTtAWCQxMzVFMmkjMUU7QjwoNEk9U0FAMi4/OzIyMVA4R0Y/KC44MjguSEJAHkE2Ly5EKyoxNU5WM0VOYjU7RDI/KTk8Lz0zSDBOMTtCLFFFIjZBJjVGRjVJSzk4GykvIS8tHCNCMCwgJikTOiI0IyUlKSYlITAuKyIsGyFXGiMiGzIvHS8mGCIcIjIoIBsnGScgEx0pJyIhHyIeLx4fJSIbICApJCEnJCElIScQHyAgLyIjJiYxHiEqHCMQKBgkJiEmHBwgHiAdHB4hHRwcIB0iVC8nQC0xZkQuP0lALi81QUdBNTo2OT0gKEJFNCwvTD0rOjg/Mjg7NCs="));

  if (n<0 || n>=idxs.length) return;
  var idx = n ? E.sum(new Uint8Array(idxs.buffer,0,n))+1 : 0;
  var len = idxs[n]-1;
  return require("Storage").read("textsource.txt").substring(idx, idx+len);
};
exports.getRandomText = function() {
  let n = Math.floor(Math.random()*exports.getCount());
  return { idx : n, txt : exports.getText(n) };
};
