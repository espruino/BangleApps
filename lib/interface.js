/* Library for 'interface' HTML files that are to
be used from within BangleApps

See: README.md / `apps.json`: `interface` element

This exposes a 'Puck' object like the puck.js library,
and calls `onInit` when it's ready. `Puck` can be used
for sending/receiving data to the correctly connected
device with Puck.eval/write.
*/
var __id = 0, __idlookup = [];
var Puck = {
  eval : function(data,callback) {
    __id++;
    __idlookup[__id] = callback;
    window.postMessage({type:"eval",data:data,id:__id});
  },write : function(data,callback) {
    __id++;
    __idlookup[__id] = callback;
    window.postMessage({type:"write",data:data,id:__id});
  }
};
window.addEventListener("message", function(event) {
  var msg = event.data;
  if (msg.type=="init") {
    onInit();
  } else if (msg.type=="evalrsp" || msg.type=="writersp") {
    var cb = __idlookup[msg.id];
    delete __idlookup[msg.id];
    cb(msg.data);
  }
}, false);
