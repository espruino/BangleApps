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

  var getAllMGS = function() {
    if (msgAll === undefined) {
      debug("msgAll is undefined");
      msgAll = msgs.getMessages().filter(m => !['call', 'map', 'music'].includes(m.id)).map(m => m.src).length;
    }
    return msgAll; 
  }


  var getUnreadMGS = function() {
    if (msgUnread === undefined) {
      debug("msgUnread is undefined");
      msgUnread = msgs.getMessages().filter(m => m.new && !['call', 'map', 'music'].includes(m.id)).map(m => m.src).length;
    }
    return msgUnread; 
  }

  var msgCounter = function(type, msg) {
    var msgsNow = msgs.getMessages(msg);
    msgUnread = msgsNow.filter(m => m.new && !['call', 'map', 'music'].includes(m.id)).map(m => m.src).length; 
    if (msgUnread === undefined) {
      msgUnread = "?";
    }
    msgAll = msgsNow.filter(m => !['call', 'map', 'music'].includes(m.id)).map(m => m.src).length; 
    if (msgAll === undefined) {
      msgAll = "?";
    }
    info.items[0].emit("redraw");
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
            text : getAllMGS(),
            img : allImg() // TODO This is omited if category image is not set
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
