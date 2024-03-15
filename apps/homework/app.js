
var homework = require("Storage").readJSON("homework.txt", "r");
var mainCheckHomeworkMenu;

var nhwmn = { // New homework Menu
  "": {
    "title": "New HW Subject:"
  }

};



function newHomeworkMenu() {
  E.showMessage("Getting subjects...");
  var rawsubjects = require("Storage").read("homework.subjects.txt"); // This code reads out the subjects list and removes the newline character at the end
  var splitsubjects = rawsubjects.split(",");
  var lastItem = splitsubjects[splitsubjects.length - 1];
  var thiscurrentsubject;
  //var command;
  lastItem = lastItem.slice(0, -1);
  splitsubjects[splitsubjects.length - 1] = lastItem;
  for (let i = 0; i < splitsubjects.length; i++) { // loop through array and add to menu
    thiscurrentsubject = splitsubjects[i];
    /*command =*/ addNewHomework(thiscurrentsubject);
    nhwmn[splitsubjects[i]] = addNewHomework.bind(null, thiscurrentsubject);
  }
  nhwmn["Back"] = function() {E.showMenu(mainMenu);};
  console.log(nhwmn);
  E.showMenu(nhwmn);
}
var mode = "mainmenu";
var statusmsg;
var mainMenu = {
  "": {
    title: "--Main Menu--"
  },
  "New Homework": function() {
    newHomeworkMenu();
    mode = "newhomework";
  },
  "Check Homework": function() {
    checkUnfinishedHomeworkAssembler();
  },
  "Reset Homework": function() {
    E.showPrompt("Are you sure you want to delete homework.txt?", {
      buttons: {
        /*LANG*/"No": false,
        /*LANG*/"Yes": true
      }
    }).then(function(v) {
      if (v) {
        require("Storage").write("homework.txt", '{"homework":[]}');
        homework = require("Storage").readJSON("homework.txt", "r");
        E.showMenu(mainMenu);

      }else{
      E.showMenu(mainMenu);
      }
    });
  },
};

function checkUnfinishedHomeworkAssembler() {
  homework = require("Storage").readJSON("homework.txt", "r");
  var hwcount = Object.keys(homework.homework).length;
  mainCheckHomeworkMenu = {
    '': {
      'title': 'Unfinished HW:'
    }
  };
  // This code snippet gets the unfinished HW and puts it in mainCheckHomeworkMenu
  // btw mainCheckHomeworkMenu displays all the homework, when tapping on it you get more details with checkPreciseHomework function
  for (var i = 0; i < hwcount; ++i) {
    if (homework.homework[i].done === false) {
      var currentsubject = i; //attempting to pass i
      mainCheckHomeworkMenu[homework.homework[i].subject] = checkPreciseHomework.bind(null, currentsubject);
    }

  }
  mainCheckHomeworkMenu["See Archived HW"] = function() {
    checkFinishedHomeworkAssembler();
  };
  mainCheckHomeworkMenu["Back to Main Menu"] = function() {
    mode = "mainmenu";
    E.showMenu(mainMenu);
  };
  console.log(mainCheckHomeworkMenu);
  E.showMenu(mainCheckHomeworkMenu);
}

function checkFinishedHomeworkAssembler() {
  homework = require("Storage").readJSON("homework.txt", "r");
  var hwcount = Object.keys(homework.homework).length;
  mainCheckHomeworkMenu = {
    '': {
      'title': 'Archived HW:'
    }
  };

  // This code snippet gets the unfinished HW and puts it in mainCheckHomeworkMenu
  // btw mainCheckHomeworkMenu displays all the homework, when tapping on it you get more details with checkPreciseHomework function (currently being written)
  for (var i = 0; i < hwcount; ++i) {
    if (homework.homework[i].done === true) {
      var currentsubject = i; //attempting to pass i
      mainCheckHomeworkMenu[homework.homework[i].subject] = checkPreciseHomework.bind(null, currentsubject);
    }

  }
  mainCheckHomeworkMenu["Back"] = function() {
    mode = "mainmenu";
    E.showMenu(mainMenu);
  };
  E.showMenu(mainCheckHomeworkMenu);
}

function checkPreciseHomework(subjectnum) { // P A I N
  homework = require("Storage").read("homework.txt", "r");
  homework = JSON.parse(homework);
  var subject = homework.homework[subjectnum].subject;
  var task = homework.homework[subjectnum].task;
  var taskmsg = "Task: " + homework.homework[subjectnum].task;
  if (homework.homework[subjectnum].done === false) {
    statusmsg = "Status: Unfinished";
  } else {
    statusmsg = "Status: Finished";
  }
  var datetimerecieved = homework.homework[subjectnum].datetimerecievehw;
  var datetimerecievedmsg = "Recieved: " + homework.homework[subjectnum].datetimerecievehw;
  var checkPreciseHomeworkMenu = {
    '': {
      'title': subject
    },
  };
  checkPreciseHomeworkMenu[subject] = function() {},
    checkPreciseHomeworkMenu[taskmsg] = function() {},
    checkPreciseHomeworkMenu[statusmsg] = function() {
      statusmsg = "Status: Finished";
      var d = new Date();
      var currenttime = require("locale").time(d, 1);
      var currentdate = require("locale").date(d);
      var datetime = (currenttime + " " + currentdate);
      delete homework.homework[subjectnum];
      homework.homework.push({
        subject: subject,
        task: task,
        done: true,
        datetimerecievehw: datetimerecieved,
        datetimehwdone: datetime
      });
      require("Storage").write("homework.txt", JSON.stringify(homework));
      checkUnfinishedHomeworkAssembler();
    },
    checkPreciseHomeworkMenu[datetimerecievedmsg] = function() {},
    checkPreciseHomeworkMenu["Back"] = function() {
      checkUnfinishedHomeworkAssembler();
    },

    E.showMenu(checkPreciseHomeworkMenu);


}
/*
function pushHomework(subject, status, datetimehwdone) {
  homework = require("Storage").readJSON("homework.txt", "r");
}
*/

function addNewHomework(subject) { // Pass subject
  console.log(subject);
  require("textinput").input().then(result => {
    if (result === "") {
      mode = "newhomework";
      newHomeworkMenu();
    } else {
      var d = new Date();
      // update time and date
      var currenttime = require("locale").time(d, 1);
      var currentdate = require("locale").date(d);
      var datetime = (currenttime + " " + currentdate);
      homework.homework.push({
        subject: subject,
        task: result,
        done: false,
        datetimerecievehw: datetime
      }); // TODO: when HW is done, add datetimeendhw !!!
      console.log("subject is" + subject);

      //homework.homework[subject] = result;
      require("Storage").write("homework.txt", JSON.stringify(homework));
      E.showMenu(mainMenu);

    }
  });

}

function main() { // why does this still exist
  if (mode === "mainmenu") {
    E.showMenu(mainMenu);

  } else if (mode === "newhomework") {
    newHomeworkMenu()

  }
}
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
main();
//loop = setInterval(main, 1);
