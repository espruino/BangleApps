#### ⚠️EXPERIMENTAL⚠️

# Fastload Utils

**Use this with caution.** When you find something misbehaving please check if the problem actually persists without Fastload Utils
before filing an issue.

This allows fast loading of all apps with two conditions:
* Loaded app contains `Bangle.loadWidgets`. This is needed to prevent problems with apps not expecting widgets to be already loaded.
* Current app can be removed completely from RAM.

**Fastload has no way of knowing whether an app can be removed completely from RAM, so if it can't your
Bangle will just end up with a memory leak or undefined behaviour**

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

## Technical Notes

Fastload uses the same mechanism as `.bootcde` does to check the app to be loaded for widget use and stores the result of that and a hash of the js in a cache.

Fastload calls `Bangle.load` to fast load an app, and this checks if `Bangle.uiRemove` exists and if so calls it to upload the app, and loads a new app using `eval`. `Bangle.uiRemove` is set when
UI elements (`layout`, `Bangle.setUI`, scrollers, etc) are supplied with a `remove` callback - and so it's assumed that the remove callback will remove *everything* related to the app from RAM.

The problem is that apart from clocks, very few apps do actually completely remove themselves from RAM when the `remove` callback is called, so the possibility of memory leaks is very high.


# Creator

[halemmerich](https://github.com/halemmerich)

# Contributors

[thyttan](https://github.com/thyttan)
