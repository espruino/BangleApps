# Color Picker
A module for showing a color picker for easy picking and setting of colors.

<img width="176" height="176" alt="d" src="https://github.com/user-attachments/assets/1fbde2f8-e25a-4a9b-9ce8-40803ae14adb" />

## Usage
Example usage:
```javascript
var menu={
  "Color Picker" : function(){
    require("colorpicker").show({
      onSelect:function(color){
        print(color);
      },
      showPreview:true,
      back:function(){
        E.showMenu(menu);
      }

    });
  }
}
E.showMenu(menu);

```
<b>Options:</b>

`require("colorpicker").show(opts)` takes in an object of options, listed below:
* `colors`: (Optional), specify a select list of colors to show instead of the default. Must not exceed 36 colors.
* `showPreview`: (Optional), choose whether or not to show a full-screen preview of the color you selected.
* `onSelect`: (Required), function that is called when user selects a color. Saving logic goes here. If in multi-select mode, this is called every time a new color is selected.
* `back`: (Required), function that is called to return to previous state. Color picker listeners are automatically removed.
* `multiSelect` (Optional), if true, then the color picker allows the user to select multiple colors and returns a list of colors in `onSelect`
* `startingSelection` (Optional, only for multi-select mode), array of colors selected at the start, for setting restoration.

## Author
RKBoss6

