let showMusic = () => {
  Bangle.CLOCK = 1; // To pass condition in messages library
  require('messages').pushMessage({"t":"add","artist":" ","album":" ","track":" ","dur":0,"c":-1,"n":-1,"id":"music","title":"Music","state":"play","new":true});
};

var settings = require('Storage').readJSON('messages.settings.json', true) || {}; //read settings if they exist else set to empty dict
if (!settings.openMusic) {
  settings.openMusic = true; // This app/hack works as intended only if this setting is true
  require('Storage').writeJSON('messages.settings.json', settings);
  E.showMessage("First run:\n\nMessages setting\n\n 'Auto-Open Music'\n\n set to 'Yes'");
  setTimeout(()=>{showMusic();}, 5000);
} else {
  showMusic();
}
