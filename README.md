Bangle.js App Loader (and Apps)
================================

Try it live at [banglejs.com/apps](https://banglejs.com/apps)

### How does it work?

* A list of apps is in `apps.json`
* Each element references an app in `apps/` which is uploaded
* When it starts, BangleAppLoader checks the JSON and compares
it with the files it sees in the watch's storage.
* To upload an app, BangleAppLoader checks the files that are
listed in `apps.json`, loads them, and sends them over Web Bluetooth.

### What filenames are used

Filenames in storage are limited to 8 characters. To
easily distinguish between file types, we use the following:

* `+stuff` is JSON for an app
* `*stuff` is an image
* `-stuff` is JS code
* `=stuff` is JS code for stuff that is run at boot time - eg. handling settings or creating widgets on the clock screen

### Developing your own app

* Start writing your code in the IDE, with `Save on Send` in settings set to
the *default* of `To RAM`
* When you have your app as you want it, add it as a file in `apps/`, lets assume `apps/my-great-app.js`
* Come up with a unique 7 character name, we'll assume `7chname`
* Create `apps/my-great-app.png` as a 48px icon
* Use http://www.espruino.com/Image+Converter to create as 1 bit, 4 bit or 8 bit Web Palette "Image String" and save it as `apps/my-great-app-icon.js`
* Create an entry in `apps/my-great-app.json` as follows:   

```
{
  "name":"Short Name",
  "icon":"*7chname",
  "src":"-7chname"
}
```

* Create an entry in `apps.json` as follows:   

```
{ "id": "7chname",
  "name": "My app's human readable name",
  "icon": "my-great-app.png",
  "description": "A detailed description of my great app",
  "tags": "",
  "storage": [
    {"name":"+7chname","url":"my-great-app.json"},
    {"name":"-7chname","url":"my-great-app.js"},
    {"name":"*7chname","url":"my-great-app.js","evaluate":true}
  ],
},
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

### Credits

The majority of icons used for these apps are from [Icons8](https://icons8.com/) - we have a commercial license but icons are also free for Open Source projects.
