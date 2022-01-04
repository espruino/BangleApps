# recentApp

This app is a tiny boot script that rewrites the `recentapp` module to storage, each time
the [`load(filename)`](https://www.espruino.com/Reference#l__global_load) function is used.
The output of this module is an object containing the JSON data of `filename.info`.


## Required by

This list should help to tracking all apps that require this boot script:
* tap2act


## Usage

Use the following code to recieve the info file JSON data as object:
```
require("recentapp")
```

Example output on active alarm app, opened with `load(alarm.app.js)`:
```
{
  type: "app",
  id: "alarm",
  name: "Alarms",
  src: "alarm.app.js",
  icon: "alarm.img",
  version: "0.14",
  tags: "tool,alarm,widget",
  files: "alarm.info,alarm." ... ".img,alarm.wid.js",
  data: "alarm.json"
}
```

Example output for the default clock, opened with `load()`:
```
{
  name: "Default Clock",
  id: "clock",
  type: "clock"
}
```


## Additional information

* To ensure compatibility, if type is undefined in the info file, its default value is: `type: "app"`


## Creator
Storm64 ([storm64](https://github.com/storm64))
