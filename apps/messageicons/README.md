# Message Icons
Provides icons for phone apps that are utilized by `message gui` and any other message display app. 

## Adding your own icons
- Clone the repo on your local machine, if you haven't done so already.
- Locate the image you want to use as an icon. Make sure it is 24x24px, and has a black foreground and transparent background (you can color the foreground one color only later on)
- Upload it to the `icons` folder in the `messageicons` folder.
- Add your app name and the corresponding image you added to the `icon_names.json` file
- Go lower in the `generate.js` code, and find the color definitions. There, add the color for the foreground of the icon, and the corresponding app.
- Run the `generate.js` script. Be sure you have the `png-js` dependency needed. (you can install it by running `npm install png-js` in the terminal)

  
<i><b>Don't modify the Lib.js file at all. When someone adds new icons, your old ones will be wiped</b></i>

The app now removes the following special characters at the end: `*!?.-_`, and also removes extra whitespaces, for better matching of 'marked' app names (eg. Slack* ). All other characters not listed there will not be removed at the end.

