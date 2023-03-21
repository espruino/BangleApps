# Gallery

A simple gallery app

## Usage

Upon opening the gallery app, you will be presented with a list of images that you can display. Tap the image to show it. Brightness will be set to full, and the screen timeout will be disabled. When you are done viewing the image, you can tap the screen to go back to the list of images. Press BTN1 to flip the image upside down.

## Adding images

Once this app is installed you can manage images by pressing the Disk icon next to it or by following the manual steps below:

1. The gallery app does not perform any scaling, and does not support panning. Therefore, you should use your favorite image editor to produce an image of the appropriate size for your watch. (240x240 for Bangle 1 or 176x176 for Bangle 2.) How you achieve this is up to you. If on a Bangle 2, I recommend adjusting the colors here to comply with the color restrictions.

2. Upload your image to the [Espruino image converter](https://www.espruino.com/Image+Converter). I recommend enabling compression and choosing one of the following color settings:
    * 16 bit RGB565 for Bangle 1
    * 3 bit RGB for Bangle 2
    * 1 bit black/white for monochrome images that you want to respond to your system theme. (White will be rendered as your foreground color and black will be rendered as your background color.)

3. Set the output format to an image string, copy it into the [IDE](https://www.espruino.com/ide/), and set the destination to a file in storage. The file name should begin with "gal-" (without the quotes) and end with ".img" (without the quotes) to appear in the gallery. Note that the gal- prefix and .img extension will be removed in the UI. Upload the file.
