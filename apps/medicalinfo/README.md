# Medical Information

This app displays basic medical information, and provides a common way to set up the `medicalinfo.json` file, which other apps can use if required.

## Medical information JSON file

When the app is loaded from the app loader, a file named `medicalinfo.json` is loaded along with the javascript etc.
The file has the following contents:

```
{
    "bloodType": "",
    "medicalAlert": [ "" ]
}
```

Weight and height are read from myprofile.

## Medical information editor

Clicking on the download icon of `Medical Information` in the app loader invokes the editor.
The editor downloads and displays the current `medicalinfo.json` file, which can then be edited.
The edited `medicalinfo.json` file is uploaded to the Bangle by clicking the `Upload` button.

## Creator

James Taylor ([jt-nti](https://github.com/jt-nti))
