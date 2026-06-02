# Intentional

Intentional is a configurable launcher for Bangle.js watches.

It can launch:

* Android intents through Gadgetbridge
* Installed Bangle.js applications
* Nested folders containing tasks and apps

Menu items are stored in `intentional.json` and can be edited using the built-in App Loader configurator.

## Features

* Launch Android intents
* Launch installed Bangle.js applications
* Nested folders
* Custom separators
* Drag-and-drop sorting
* Import and export configurations
* Browser-based configuration editor

## Set-Up

### Android Intents

To launch Android intents:

1. Install and configure Gadgetbridge.
2. Enable intent handling in Gadgetbridge.
3. Create matching profiles/tasks in Tasker (or another automation application).

Intentional sends the configured intent string to Gadgetbridge, which forwards it to Android.

Examples:

* Home automation
* Media controls
* Smart home scenes
* Custom phone automation

### Bangle.js Applications

Intentional can also launch installed Bangle.js applications directly from the watch.

Applications can be selected from a list of installed apps in the configurator.

## Configuration

The App Loader configurator allows you to:

* Add Tasks
* Add Apps
* Add Folders
* Add Separators
* Rename entries
* Reorder items
* Import configurations from a file
* Export configurations to a file
* Save configurations directly to the watch

## Example Structure

```json
{
  "items": [
    {
      "type": "task",
      "name": "Flashlight",
      "intent": "com.example.FLASHLIGHT"
    },
    {
      "type": "separator",
      "label": "Apps"
    },
    {
      "type": "app",
      "name": "About",
      "app": "about.app.js"
    }
  ]
}
```

# Acknowledgements
https://banglejs.com/apps/?id=folderlaunch

## Creator

[ZubaZ21](https://github.com/ZubaZ21)
