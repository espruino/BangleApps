(function() {
  
  var unreadImg = function() {
    return atob("GBiBAAAAAAAAAAAAAB//+D///D///D///D///D///D///D5mfD5mfD///D///D///D///D///D///B//+APgAAOAAAOAAAAAAAAAAA==");
  }
  var allImg = function() {
    return atob("GBiBAAAAAAAAAAB+AAD/AAPDwA8A8B4AeDgAHDgAHDwAPD8A/D/D/D/n/D///D///D///D///D///D///B//+AAAAAAAAAAAAAAAAA==");
  }

  var debug = function(o) {
    //console.log(o);
  }
  var msgUnread;
  var msgAll;
  var msgs = require("messages");

  var getAllMSGs = function() {
    if (msgAll === undefined) {
      debug("msgAll is undefined");
      msgAll = msgs.getMessages().filter(m => !['call', 'map', 'music'].includes(m.id)).length;
    }
    return msgAll; 
  }


  var getUnreadMGS = function() {
    if (msgUnread === undefined) {
      debug("msgUnread is undefined");
      msgUnread = msgs.getMessages().filter(m => m.new && !['call', 'map', 'music'].includes(m.id)).length;
    }
    return msgUnread; 
  }

  var msgCounter = function(type, msg) {
    var msgsNow = msgs.getMessages(msg);
    msgUnread = msgsNow.filter(m => m.new && !['call', 'map', 'music'].includes(m.id)).length; 
    msgAll = msgsNow.filter(m => !['call', 'map', 'music'].includes(m.id)).length;
    //TODO find nicer way to redraw current shown CI counter
    info.items[0].emit("redraw");
    info.items[1].emit("redraw");
  }

  var info = {
    name: "Messages", 
    img: unreadImg(),
    items: [
      { name : "Unread",
        get : () => {
          return {
            text : getUnreadMGS(),
            img : unreadImg()
          };
        },
        show : function() {
          Bangle.on("message", msgCounter);
        },
        hide : function() {
          Bangle.removeListener("message", msgCounter);
        },
        run : () => {
          require("messages").openGUI();
        }
      },
      { name : "All",
        get : () => {
          return {
            text : getAllMSGs(),
            img : allImg()
          };
        },
        show : function() {
          Bangle.on("message", msgCounter);
        },
        hide : function() {
          Bangle.removeListener("message", msgCounter);
        },
        run : () => {
          require("messages").openGUI();
        }
      }
    ]
  };
  return info;
})
