App Modules
===========

These are modules used by apps - you can use them from a Bangle.js app with:

```
var testmodule = require("testmodule");
testmodule.test()
```

Development
-----------

When apps that use these modules are uploaded via the
app loader, the module is automatically included in the app's source. However
when developing via the IDE the module won't get pulled in by default
so you may see the error "Module <module_name> not found" in the IDE when sending code to the Bangle.

To fix this you have three options:


### Change the Web IDE search path to include Bangle.js modules

This is nice and easy (and the results are the same as if the app was
uploaded via the app loader), however you cannot then make/test changes
to the module.

* In the IDE, Click the `Settings` icon in the top right
* Click `Communications` and scroll down to `Module URL`
* Now change the module URL from the default of `https://www.espruino.com/modules`
to `https://banglejs.com/apps/modules|https://www.espruino.com/modules`

The next time you upload your app, the module will automatically be included.

**Note:** You can optionally use `https://raw.githubusercontent.com/espruino/BangleApps/master/modules|https://www.espruino.com/modules`
as the module URL to pull in modules direct from the development app loader (which could be slightly newer than the ones on https://banglejs.com/apps)


### Host your own App Loader and upload from that

This is reasonably easy to set up, but it's more difficult to make changes and upload:

* Follow the steps here to set up your own App Loader: https://www.espruino.com/Bangle.js+App+Loader
* Make changes to that repository
* Refresh and upload your app from the app loader (you can have the IDE connected
  at the same time so you can see any error messages)


### Upload the module to the Bangle's internal storage

This allows you to develop both the app and module very quickly, but the app is
uploaded in a slightly different way to what you'd get when you use the App Loader
or the method below:

* Load the module's source file in the Web IDE
* Click the down-arrow below the upload button, then `Storage`
* Click `New File`, type `your_module_name` as the name (with no `.js` extension), click `Ok`
* Now Click the `Upload` icon.

You can now upload the app direct from the IDE. You can even leave a second Web IDE window open
(one for the app, one for the module) to allow you to change the module.


