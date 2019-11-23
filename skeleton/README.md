The Skeleton files
==================

Maybe it's helpfull to start with some skeleton files 
and avoid some common pitfalls, as starting from scratch.

Take a look into the sections and use the files to quickly start programming Bangle.js apps and widgets.

* Start with choosing a _7chname_ id, eg _mygreat_.

* Clock apps use prefix _clock_ for the name, eg _clock-mygreate_

* Use prefix _widget_ when writing a widget. eg _widget-mygreate_

| files | target location app/ | content |
| :-- | :-- | :-- |
|_for apps_
|add\_my-great-app\_to\_apps.json| insert into apps.json|describes your app to bootloader and library |
|my-great-app.json| 7chname/ | short app-name and storage names |
|my-great-app.js| 7chname/ | your app code|
|my-great-app-icon.js| 7chname/ | decoded version of the png file |
|_for widgets_
|add\_my-great-widget\_to\_apps.json| insert into apps.json|describes my widget to bootloader and library |
|my-great-widget.json| 7chname/ | short widget name and storage names |
|my-great-widget.js| 7chname/ | widget code |
|_some snippets_
|colors.js| - | valid colors as name value pair |
|wrap_my-great-app.js|-| wrapper to store app or widget data and send to device for testing|

## Files for APP's

To write a app you need a few files in folder _apps/7chname_ and add a few lines of JSON to file apps.json

Apps are listed in Bangle.js menue, accessable from a clock app via middle button.

### add\_my-great-app\_to\_apps.json

```
{ "id": "7chname",
  "name": "My app's human readable name",
  "icon": "my-great-app.png",
  "description": "A detailed description of my great app",
  "tags": "",
  "storage": [
    {"name":"+7chname","url":"my-great-app.json"},
    {"name":"-7chname","url":"my-great-app.js"},
    {"name":"*7chname","url":"my-great-app-icon.js","evaluate":true}
  ],
},
```
- id is the unique app identified.
- name, icon and description present the app in the library.
- tags is used for grouping apps in the library, separate multiple entries by comma.
- storage is used to identify the app files and how to handle them, like "evaluate": true | false (dafault) 

Known tags: `tool`, `system`, `clock`, `game`, `sound`, `gps`, `widget` or empty.

Copy and paste lines from `add_my-great-app_to_apps.json`.

### my-great-app.json

```
{
  "name":"Short Name",
  "icon":"*7chname",
  "src":"-7chname"
}
```

The Storage module is _8chname_ based, so all app parts are only allowed _7chname_ in length, firstchar is reserved as content type identifier.

### my-great-app.js

Write your app code as encapsulation using anonymous functions with private functional scope.

```
(() => {

    // section  for const and vars if needed

    ...

    // section for functions, classes

    ...

    function < your main function > () {
    
        ... 
        
    }

    // special function to handle display switch on
    Bangle.on('lcdPower', (on) => {
        if (on) {
            <your main function>();
    }});

	// clear screen and launch
	g.clear();
	<your main funtion>();

})();
```

If you like store and restore data with your app, than use the prefix _@_ and your _7chname_, eg _@mygreat_ as name.

Make sure to read [Coding Hints](coding-hints).

### my-great-app.png

The png file is displayed in the app loader next to the app name.

Use your favorite icon creator and go for a 48x48 png file.

Check avaiable colors to draw a fancy colored icon for your app.

### my-great-app-icon.js

The icon image and short description is used in the menue entry as selection posibility.

Use the Espruino [image converter](https://www.espruino.com/Image+Converter) and upload your my-great-app.png file.

Follow this steps to create a readable icon as image string.

1. upload a png file
2. set _X_ Use Compression
3. set _X_ Transparency
4. set Defusion: _flat_
5. set Colours: _1 bit_, _4 bit_ or _8 bit Web Palette_ 
6. set Output as: _Image String_

Replace this line with the image converter output
 
```
require("heatshrink").decompress(atob("mEwwJC/AH4A/AH4AgA=="));
```

Keep in mind to use this converter for creating images you like to draw with `g.drawImage()` with your app.

## Files for WIDGET's

To write a widget you need a few files in folder apps and add a few lines of JSON to file apps.json

Be aware of this: Widgets are not listed as menue entry. 

### add\_my-great-app\_to\_apps.json

```
{ "id": "7chname",
  "name": "My widget's human readable name",
  "icon": "my-great-widget.png",
  "description": "A detailed description of my great widget",
  "tags": "widget",
  "storage": [
    {"name":"+7chname","url":"my-great-widget.json"},
    {"name":"-7chname","url":"my-great-widget.js"},
  ],
},
```
### my-great-widget.js

Write your widget code as encapsulation using anonymous functions with private functional scope.

```
(() => {

    // add the width 
    var xpos = WIDGETPOS.tr-<the widget width>;
    WIDGETPOS.tr-=<the widget width plus some extra pixel to keep distance to others>;
    
    // draw your widget at xpos
    function draw() {
    
    	// add your code 
        
    }
    
    // add your widget
    WIDGETS["mywidget"]={draw:draw};

})()
```

### my-great-widget.png

Same as my-great-app.png

### my-great-widget-icon.js

Same as my-great-app-icon.png


## App development and testing

Use the wrapper technic from file `wrap_my-great-app.js`, copy paste your code and upload Espruino via Web IDE 

Todo: add a wrapper script for this 

```
// replace with your 7chname app name
var appname = "mygreat";

require("Storage").write('*'+appname,`
  // place out of image conterver here
`);

// 
require("Storage").write("+"+appname,{
  "name":"My Great App","type":"",
  "icon":"*"+appname,
  "src":"-"+appname,
});

require("Storage").write("-"+appname,`
// place content of my-greate-app.json here
`
```

Or fork BANGLEJS, got Setting and activate GitHub Pages and you are good to run your personal `Bangle App Launcher` (https://\<your-github-username\>.github.io/BangleApps/index.html). 

Now you can use the `Bangle App Launcher` to upload and test you new app  

Be aware of the delay between commit and avaiable on github.io

##### One way to develop and test your work

1. Use WebIDE for the development
2. Wrap code and run tests on device
3. Run final test with personal `Bangle App Launcher`

##Appendex

### API Reference

[Reference](http://www.espruino.com/Reference#software)

[Bangle Class](https://banglejs.com/reference#Bangle)

[Graphics Class](https://banglejs.com/reference#Graphics)

###Coding hints

- use `g.setFont(.., size)` to multiply the font size, eg ("6x8",3) : "18x24"

- use `g.drawString(..,true)` to draw with background color to overwrite existing text

- use `g.clearRect()` to clear parts of the screen, instead of using `g.clear()`

- use `g.fillPoly()` or `g.drawImage()` for complex graphic elements

- using `g.clear()` can cause screen flicker

- using `g.setLCDBrightness()` can save you power during long periods with lcd on

- chaining graphics methodes, eg `g.setColor(0xFD20).setFontAlign(0,0).setfont("6x8",3)`

### Graphic areas 

The screen is parted in a widget and app area for lcd mode `direct`(default).

| areas | as rectangle or point |
| :-:| :-: | 
| Widget | (0,0,239,23) | 
| Apps | (0,24,239,239) |
| BTN1 | (230, 55)  |
| BTN2 | (230, 140) |
| BTN3 | (230, 210) |  
| BTN4 | (0,0,119, 239)| 
| BTN5 |  (120,0,239,239) | 

- Use `g.setFontAlign(0, 0, 3)` to draw rotated string to BTN1-BTN3 with `g.drawString()`. 

- For BTN4-5 the touch area is named

### Available colors 

| color-name | color-value|
| :-: | :-: |
| Black | 0x0000 | 
| Navy | 0x000F |
| DarkGreen | 0x03E0 |
| DarkCyan | 0x03EF |
| Maroon | 0x7800 |
| Purple | 0x780F |
| Olive | 0x7BE0
| LightGray | 0xC618
| DarkGrey | 0x7BEF
| Blue | 0x001F
| Green | 0x07E0 |
| Cyan | 0x07FF |
| RED | 0xF800 |
| Magenta | 0xF81F |
| Yellow | 0xFFE0 |
| White | 0xFFFF |
| Orange | 0xFD20 |
| GreenYellow | 0xAFE5 |
| Pink | 0xF81F |




