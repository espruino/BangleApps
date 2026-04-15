(function(back) {
  const FILE = "goofster.settings.json";
  // Load settings
  var settings = Object.assign({
    bgColor: "#57FF4F",
    noseColor: "#ff0000",
    widgetsOn: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  const CHOICES = ["Zero","One","Two","Three"];

  var color_options = [
  'Green', 'Orange', 'Cyan', 'Purple', 'Red', 'Blue', 'Yellow', 'White',
  'Purple', 'Pink', 'Light Green', 'Brown', 'Turquoise', 'Magenta', 'Lime',
  'Gold', 'Sky Blue', 'Rose', 'Lavender', 'Amber', 'Indigo', 'Teal',
  'Crimson', 'Maroon', 'Firebrick', 'Dark Red', 'Aqua', 'Emerald', 'Royal Blue',
  'Sunset Orange', 'Turquoise Blue', 'Hot Pink', 'Goldenrod', 'Deep Sky Blue'
  ];

  var bg_code = [
    '#57FF4F', '#FF9900', '#0094FF', '#FF00DC', '#ff0000', '#0000ff', '#ffef00', '#FFFFFF',
    '#FF00FF', '#6C00FF', '#99FF00', '#8B4513', '#40E0D0', '#FF00FF', '#00FF00', '#FFD700',
    '#87CEEB', '#FF007F', '#E6E6FA', '#FFBF00', '#4B0082', '#008080', '#DC143C', '#800000',
    '#B22222', '#8B0000', '#00FFFF', '#008000', '#4169E1', '#FF4500', '#40E0D0', '#FF69B4',
    '#DAA520', '#00BFFF'
  ];
  // Show the menu
  E.showMenu({
    "" : { "title" : "Goofster" },
    "< Back" : () => back(),
    'Background Colour': {
      value: 0 | bg_code.indexOf(settings.bgColor),
      min: 0, max: 33,
      format: v => color_options[v],
      onchange: v => {
        settings.bgColor = bg_code[v];
        writeSettings();
      }
      // format: ... may be specified as a function which converts the value to a string
      // if the value is a boolean, showMenu() will convert this automatically, which
      // keeps settings menus consistent
    },
    'Nose Colour': {
      value: 0 | bg_code.indexOf(settings.noseColor),
      min: 0, max: 33,
      format: v => color_options[v],
      onchange: v => {
        settings.noseColor = bg_code[v];
        writeSettings();
      }
      },
      // format: ... may be specified as a function which converts the value to a string
      // if the value is a boolean, showMenu() will convert this automatically, which
      // keeps settings menus consistent
      'Widgets On?': {
      value: !!settings.widgetsOn,  // !! converts undefined to false
      onchange: v => {
        settings.widgetsOn = v;
        writeSettings();
      }
      },
    }
  );
});
