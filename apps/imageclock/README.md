# Imageclock

This app is a highly customizable watchface. To use it, you need to select
a watchface from another source.

## Usage

Choose the folder which contains the watchface, then clock "Upload to watch".

## Design watch faces

### Folder structure


* watchfacename
  * resources/
  * face.json
  * info.json


#### resources

This folder contains image files. It can have subfolders. These files will
be read and converted into a resource bundle used by the clock

#### face.json

This file contains the description of the watch face elements.

#### info.json

This file contains information for the conversion process, it will not be 
stored on the watch

## TODO

* Performance improvements
  * Mark elements with how often they need to be redrawn
  * Use less RAM (maybe dedicated parser for JSON working on a stack/queue)
* Allow watchfaces to declare if the want to show widgets
* Temporarily show widgets with slide up/down
* Analog Hands?
* Finalize the file format
* Description of the file format
* Allow additional files for upload declared in info.json

## Creator

[halemmerich](https://github.com/halemmerich)
