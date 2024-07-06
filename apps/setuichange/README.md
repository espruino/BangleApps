# setUI Proposals Preview

Try out changes to setUI that may or may not eventually en up in the Bangle.js firmware.

## Usage

Just install it and it modifies setUI at boot time.

## Features

- Add custom handlers on top of the standard modes as well. Previously this was only possible for mode == "custom".
  - The goal here is to make it possible to move all input handling inside `setUI` where today some apps add on extra handlers outside of `setUI` calls.
- Change the default behaviour of the hardware button to act immediately on press down. Previously it has been acting on button release.
  - This makes the interaction slightly snappier.
  - In addition to the existing `btn` key a new `btnRelease` key can now be specified. `btnRelease` will let you listen to the rising edge of the hardware button.

## Requests

Please report your experience and thoughts on this issue:
[ Discussion: HW buttons should act on 'rising' edge #3435 ](https://github.com/espruino/BangleApps/issues/3435) or on the related forum conversation [Making Bangle.js more responsive](https://forum.espruino.com/conversations/397606/).

## Creator

The changes done here were done by thyttan with help from Gordon Williams.
