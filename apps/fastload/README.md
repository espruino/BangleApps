#### ⚠️EXPERIMENTAL⚠️

# Fastload Utils

Use this with caution. When you find something misbehaving please check if the problem actually persists when removing this app.

This allows fast loading of all apps with two conditions:
* Loaded app contains `Bangle.loadWidgets`. This is needed to prevent problems with apps not expecting widgets to be already loaded.
* Current app can be removed completely from RAM.

#### ⚠️ KNOWN ISSUES ⚠️

* Fastload currently does not play nice with the automatic reload option of the apploader. App installs and upgrades are unreliable since the fastload causes code to run after reset and interfere with the upload process.

## Settings

* Activate app history and navigate back through recent apps instead of immediately loading the clock face
* If Quick Launch is installed it can be excluded from app history
* Allows to redirect all loads usually loading the clock to the launcher instead
* The "Fastloading..." screen can be switched off
* Enable checking `setting.json` and force a complete load on changes

## App history

* Long press of hardware button clears the app history and loads the clock face
* Installing the 'Fast Reset' app allows doing fastloads directly to the clock face by pressing the hardware button just a little longer than a click. Useful if there are many apps in the history and the user want to access the clock quickly.

## Technical infos

This is still experimental but it uses the same mechanism as `.bootcde` does.
It checks the app to be loaded for widget use and stores the result of that and a hash of the js in a cache.

# Creator

[halemmerich](https://github.com/halemmerich)

# Contributors
[thyttan](https://github.com/thyttan)
