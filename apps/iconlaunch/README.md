# Icon launcher

A launcher inspired by smartphones, with an icon-only scrollable menu.

This launcher shows 9 apps per screen, making it much faster to navigate versus the default launcher.

![A screenshot](screenshot1.png)
![Another screenshot](screenshot2.png)

## Technical note

The app uses `E.showScroller`'s code in the app but not the function itself because `E.showScroller` doesn't report the position of a press to the select function.

### Fastload option

Fastload clears up the memory used by the launcher and directly evals the code of the app to load. This means if widgets are loaded (fullscreen option) it is possible that widgets stay loaded in apps not expecting that and the widgets may draw over the app.
