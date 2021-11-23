// check for alarms
(function() {
  var alarms = require('Storage').readJSON('schoolCalendarAlarms.json',1)||[];
  var time = new Date();
  E.showPrompt("School Calendar Alarm Test");
})();
