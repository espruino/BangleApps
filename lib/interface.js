/* Library for 'interface' HTML files that are to
be used from within BangleApps

See: README.md / `apps.json`: `interface` element

This exposes a 'Puck' object (a simple version of
https://github.com/espruino/EspruinoWebTools/blob/master/puck.js)
and calls `onInit` when it's ready. `Puck` can be used for
sending/receiving data to the correctly connected
device with Puck.eval/write.

Puck.write(data,callback)
Puck.eval(data,callback)

There is also:

Util.readStorageFile(filename,callback)
Util.eraseStorageFile(filename,callback)
Util.showModal(title)
Util.hideModal()
*/
let __id = 0, __idlookup = [];
const Puck = {
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

const Util = {
  readStorageFile : function(filename,callback) {
    __id++;
    __idlookup[__id] = callback;
    window.postMessage({type:"readstoragefile",data:filename,id:__id});
  },
  eraseStorageFile : function(filename,callback) {
    Puck.write(`\x10require("Storage").open(${JSON.stringify(filename)},"r").erase()\n`,callback);
  },
  eraseStorage : function(filename,callback) {
    Puck.write(`\x10require("Storage").erase(${JSON.stringify(filename)})\n`,callback);
  },
  showModal : function(title) {
    if (!Util.domModal) {
      Util.domModal = document.createElement('div');
      Util.domModal.id = "status-modal";
      Util.domModal.classList.add("modal");
      Util.domModal.classList.add("active");
      Util.domModal.innerHTML = `<div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title h5">Please wait</div>
        </div>
        <div class="modal-body">
          <div class="content">
            Loading...
          </div>
        </div>
      </div>`;
      document.body.appendChild(Util.domModal);
    }
    Util.domModal.querySelector(".content").innerHTML = title;
    Util.domModal.classList.add("active");
  },
  hideModal : function() {
    if (!Util.domModal) return;
    Util.domModal.classList.remove("active");
  },
  saveCSV : function(filename, csvData) {
    let a = document.createElement("a"),
      file = new Blob([csvData], {type: "Comma-separated value file"});
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename+".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
};
window.addEventListener("message", function(event) {
  let msg = event.data;
  if (msg.type=="init") {
    onInit();
  } else if (msg.type=="evalrsp" || msg.type=="writersp"|| msg.type=="readstoragefilersp") {
    let cb = __idlookup[msg.id];
    delete __idlookup[msg.id];
    cb(msg.data);
  }
}, false);
