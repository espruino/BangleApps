require("datetimeinput").input().then(result => {
  E.showPrompt(`${result}\n\n${require("time_utils").formatDuration(Math.abs(result-Date.now()))}`, {buttons:{"Ok":true}}).then(function() {
    load();
  });
});
