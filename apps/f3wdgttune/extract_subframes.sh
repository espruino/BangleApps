#!/bin/sh

magick tuner-splash-frame1.png -crop 30x90+45+0 +repage splash-chunk1.png
magick tuner-splash-frame2.png -crop 30x90+45+0 +repage splash-chunk2.png

magick tuner-splash-frame1.png -crop 45x90+0+0 +repage splash-chunk-L.png
magick tuner-splash-frame1.png -crop 45x90+75+0 +repage splash-chunk-R.png
magick tuner-splash-frame1.png -crop 120x30+0+90 +repage splash-chunk-B.png
