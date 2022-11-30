# Fastload Utils

*EXPERIMENTAL* Use this with caution. When you find something misbehaving please check if the problem actually persists when removing this app.

This allows fast loading of all apps with two conditions:
* Loaded app contains `Bangle.loadWidgets`. This is needed to prevent problems with apps not expecting widgets to be already loaded.
* Current app can be removed completely from RAM.

## Settings

* Allows to redirect all loads usually loading the clock to the launcher instead
* The "Fastloading..." screen can be switched off

## Technical infos

This is still experimental but it uses the same mechanism as `.bootcde` does.
It checks the app to be loaded for widget use and stores the result of that and a hash of the js in a cache.

# Creator

[halemmerich](https://github.com/halemmerich)
