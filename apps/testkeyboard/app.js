Bangle.loadWidgets();
Bangle.drawWidgets();
require("textinput").input({text:"Foo"}).then(result => {
  console.log("Text input", E.toJS(result));
});
