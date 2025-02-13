(
  function(back) {
    var FILE = "snepwatch.json";

    /* Load settings */
    var settings = Object.assign ({
      /* Default Values */
      outline_r: 1,
      outline_g: 0,
      outline_b: 0,
      fill_r: 0.5,
      fill_g: 0,
      fill_b: 0,
      bg_r: 0,
      bg_g: 0,
      bg_b: 0,
      text: 1
      ,
    }, require ('Storage').readJSON (FILE, true) || {});

    function write_settings () {
      require ('Storage').writeJSON (FILE, settings);
    }

    /* Show the menu */
    var main_menu = {
      "" : { "title": "Snepwatch",
           back : function() { back (); }},
      "Outline Colour": function () { E.showMenu (outline_menu); },
      "Fill Colour": function () { E.showMenu (fill_menu); },
      "Background Colour": function () { E.showMenu (background_menu); },
      "Text": { value: (settings.text == 1),
            format: v => v ? "Light" : "Dark",
            onchange: v => { settings.text = v; write_settings (); }},
    };

    var outline_menu = {
      "": { title : "Outline Colour",
           back : function() { E.showMenu (main_menu); } },
      "Red": { value: settings.outline_r,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.outline_r = v; write_settings (); }},
      "Green": { value: settings.outline_g,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.outline_g = v; write_settings (); }},
      "Blue": { value: settings.outline_b,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.outline_b = v; write_settings (); }},
    };

    var fill_menu = {
      "" : { title : "Fill Colour",
           back : function() { E.showMenu (main_menu); } },
      "Red": { value: settings.fill_r,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.fill_r = v; write_settings (); }},
      "Green": { value: settings.fill_g,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.fill_g = v; write_settings (); }},
      "Blue": { value: settings.fill_b,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.fill_b = v; write_settings (); }},
    };

    var background_menu = {
      "" : { title : "Background Colour",
           back : function() { E.showMenu (main_menu); } },
      "Red": { value: settings.bg_r,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.bg_r = v; write_settings (); }},
      "Green": { value: settings.bg_g,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.bg_g = v; write_settings (); }},
      "Blue": { value: settings.bg_b,
           min: 0, max: 1, step: 0.5, wrap: true,
           onchange: v => { settings.bg_b = v; write_settings (); }},
    };

    E.showMenu (main_menu);
  }
)
