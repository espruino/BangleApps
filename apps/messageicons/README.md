# Message Icons
Provides icons for phone apps that are utilized by `message gui` and any other message display app. 

## Adding your own icons
- Clone the repo on your local machine, if you haven't done so already.
- Locate the image you want to use as an icon. Make sure it is 24x24px, and has a black foreground and transparent background (you can color the foreground one color only later on)
- Upload it to the `icons` folder in the `messageicons` folder.
- Add your app name and the corresponding image you added to the `icon_names.json` file
- Run the `generate.js` script. Be sure you have the `png-js` dependency needed. (you can install it by running `npm install png-js` in the terminal)
- Once finished generating, navigate to the `lib.js` file, and add the color for your foreground and the corresponding app. 
