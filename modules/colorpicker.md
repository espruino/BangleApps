# Color Picker
A module for showing a color picker for easy picking and setting of colors
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
* `onSelect`: (Required), function that is called when user selects a color. Saving logic goes here.
* `back`: (Required), function that is called to return to previous state. Color picker listeners are automatically removed.

## Author
RKBoss6

