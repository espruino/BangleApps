Bangle.js App Loader (and Apps)
================================

Try it live at [banglejs.com/apps](https://banglejs.com/apps)

## How does it work?

* A list of apps is in `apps.json`
* Each element references an app in `apps/<id>` which is uploaded
* When it starts, BangleAppLoader checks the JSON and compares
it with the files it sees in the watch's storage.
* To upload an app, BangleAppLoader checks the files that are
listed in `apps.json`, loads them, and sends them over Web Bluetooth.

## What filenames are used

Filenames in storage are limited to 8 characters. To
easily distinguish between file types, we use the following:

* `+stuff` is JSON for an app
* `*stuff` is an image
* `-stuff` is JS code
* `=stuff` is JS code for stuff that is run at boot time - eg. handling settings or creating widgets on the clock screen

## Developing your own app

* Head over to [the Web IDE](https://www.espruino.com/ide/) and ensure `Save on Send` in settings set to the *default setting* of `To RAM`
* We'd recommend that you start off using code from 'Example Applications' (below) to get started...
* Load [`app.js`](apps/_example_app/app.js) or [`widget.js`](apps/_example_widget/widget.js) into the IDE and start developing.
* The `Upload` button will load your app to Bangle.js temporarily

## Adding your app to the menu

* Come up with a unique 7 character name, we'll assume `7chname`
* Create a folder called `apps/<id>`, lets assume `apps/7chname`
* We'd recommend that you copy files from 'Example Applications' (below) as a base, or...
* `apps/7chname/app.png` should be a 48px icon
* Use http://www.espruino.com/Image+Converter to create `apps/7chname/app-icon.js`, using a 1 bit, 4 bit or 8 bit Web Palette "Image String"
* Create an entry in `apps/7chname/app.json` as follows:

```
{
  "name":"Short Name",
  "icon":"*7chname",
  "src":"-7chname"
}
```

See `app.json /  widget.json` below for more info on the correct format.

* Create an entry in `apps.json` as follows:

```
{ "id": "7chname",
  "name": "My app's human readable name",
  "icon": "app.png",
  "description": "A detailed description of my great app",
  "tags": "",
  "storage": [
    {"name":"+7chname","url":"app.json"},
    {"name":"-7chname","url":"app.js"},
    {"name":"*7chname","url":"app-icon.js","evaluate":true}
  ],
},
```

## Testing

### Online

This is the best way to test...

* Fork the https://github.com/espruino/BangleApps git repository
* Add your files
* Go to GitHub Settings and activate GitHub Pages
* Run your personal `Bangle App Loader` at https://\<your-github-username\>.github.io/BangleApps/index.html to load apps onto your device
* Your apps should be inside it - if there are problems, check your web browser's 'developer console' for errors

Be aware of the delay between commits and updates on github.io - it can take a few minutes (and a 'hard refresh' of your browser) for changes to take effect.

### Offline

You can add the following to the Espruino Web IDE:

```
// replace with your 7chname app name
var appname = "mygreat";

require("Storage").write('*'+appname,
  // place app-icon.js contents here
);

//
require("Storage").write("+"+appname,{
  "name":"My Great App","type":"",
  "icon":"*"+appname,
  "src":"-"+appname,
});

require("Storage").write("-"+appname,`
// place contents of app.js here
// be aware of double-quoting templated strings
`
```

When you upload code this way, your app will be uploaded to Bangle.js's menu
without you having to use the `Bangle App Loader`

## Example Applications

To make the process easier we've come up with some example applications that you can use as a base
when creating your own. Just come up with a unique 7 character name, copy `apps/_example_app`
or `apps/_example_widget` to `apps/7chname`, and add `apps/_example_X/add_to_apps.json` to
`apps.json`.

### App Example

The app example is available in [`apps/_example_app`](apps/_example_app)

Apps are listed in the Bangle.js menu, accessible from a clock app via the middle button.

* `add_to_apps.json` - insert into `apps.json`, describes the widget to bootloader and loader
* `app.png` - app icon - 48x48px
* `app-icon.js` - JS version of the icon (made with http://www.espruino.com/Image+Converter) for use in Bangle.js's menu
* `app.json` - short app name for Bangle.js menu and storage filenames
* `app.js` - app code

#### `app-icon.js`

The icon image and short description is used in the menu entry as selection posibility.

Use the Espruino [image converter](https://www.espruino.com/Image+Converter) and upload your `app.png` file.

Follow this steps to create a readable icon as image string.

1. upload a png file
2. set _X_ Use Compression
3. set _X_ Transparency (optional)
4. set Diffusion: _flat_
5. set Colours: _1 bit_, _4 bit_ or _8 bit Web Palette_
6. set Output as: _Image String_

Replace this line with the image converter output:

```
require("heatshrink").decompress(atob("mEwwJC/AH4A/AH4AgA=="));
```

Keep in mind to use this converter for creating images you like to draw with `g.drawImage()` with your app.


### Widget Example

The widget example is available in [`apps/_example_widget`](apps/_example_widget)

* `add_to_apps.json` - insert into `apps.json`, describes the widget to bootloader and loader
* `widget.json` - short widget name and storage names
* `widget.js` - widget code

### `app.json` / `widget.json` format

This is the file that's loaded onto Bangle.js, which gives information
about the app.

```
{
  "name":"Short Name", // for Bangle.js menu
  "icon":"*7chname", // for Bangle.js menu
  "src":"-7chname", // source file
  "type":"widget/clock/app", // optional, default "app"
     // if this is 'widget' then it's not displayed in the menu
     // if it's 'clock' then it'll be loaded by default at boot time
  "version":"1.23",
     // added by BangleApps loader on upload based on apps.json
  "files:"file1,file2,file3",
     // added by BangleApps loader on upload - lists all files
     // that belong to the app so it can be deleted
}
```

### `apps.json` format

```
{ "id": "appid",              // 7 character app id
  "name": "Readable name",    // readable name
  "icon": "icon.png",         // icon in apps/
  "description": "...",       // long description
  "type":"...",               // optional(if app) - 'app' or 'widget'
  "tags": "",                 // comma separated tag list for searching

  "custom": "custom.html",    // if supplied, apps/custom.html is loaded in an
                              // iframe, and it must post back an 'app' structure
                              // like this one with 'storage','name' and 'id' set up

  "allow_emulator":true,      // if 'app.js' will run in the emulator, set to true to
                              // add an icon to allow your app to be tested

  "storage": [                // list of files to add to storage
    {"name":"-appid",         // filename to use in storage
     "url":"",                // URL of file to load (currently relative to apps/)
     "content":"..."          // if supplied, this content is loaded directly
     "evaluate":true          // if supplied, data isn't quoted into a String before upload
                              // (eg it's evaluated as JS)
    },
  "sortorder" : 0,            // optional - choose where in the list this goes.
                              // this should only really be used to put system
                              // stuff at the top
  ]
}
```

* name, icon and description present the app in the app loader.
* tags is used for grouping apps in the library, separate multiple entries by comma. Known tags are `tool`, `system`, `clock`, `game`, `sound`, `gps`, `widget` or empty.
* storage is used to identify the app files and how to handle them

## Coding hints

- use `g.setFont(.., size)` to multiply the font size, eg ("6x8",3) : "18x24"

- use `g.drawString(text,x,y,true)` to draw with background color to overwrite existing text

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

## Available colors

You can use `g.setColor(r,g,b)` OR `g.setColor(16bitnumber)` - some common 16 bit colors are below:

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

## API Reference

[Reference](http://www.espruino.com/Reference#software)

[Bangle Class](https://banglejs.com/reference#Bangle)

[Graphics Class](https://banglejs.com/reference#Graphics)

## 'Testing' folder

The [`testing`](testing) folder contains snippets of code that might be useful for your apps.

* `testing/colors.js` - 16 bit colors as name value pairs
* `testing/gpstrack.js` - code to store a GPS track in Bagle.js storage and output it back to the console
* `testing/map` - code for splitting an image into map tiles and then displaying them

## Credits

The majority of icons used for these apps are from [Icons8](https://icons8.com/) - we have a commercial license but icons are also free for Open Source projects.
