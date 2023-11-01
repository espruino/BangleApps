(function(back) {
  const FILE = "grocery_list.json";
  const settings = require("Storage").readJSON(FILE,1)|| { products: [] };

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  const changeQuantity = (i) => {
    const menu = {
      "" : { title : /*LANG*/"Quantity" },
      "< Back" : () => edititem(i),
      "x 0.1" : {
        value : settings.products[i].quantity,
        min:0,
        max:9999,
        step:0.1,
        onchange : v => {
          settings.products[i].quantity=v;
          menu["x 1"].value = v;
          menu["x 10"].value  = v;
          menu["x 100"].value  = v;
        },
      },
      "x 1" : {
        value : settings.products[i].quantity,
        min:0,
        max:9999,
        step:1,
        onchange : v => {
          settings.products[i].quantity=v;
          menu["x 0.1"].value  = v;
          menu["x 10"].value  = v;
          menu["x 100"].value  = v;
        },
      },
      "x 10" : {
        value : settings.products[i].quantity,
        min:0,
        max:9999,
        step:10,
        onchange : v => {
          settings.products[i].quantity=v;
          menu["x 0.1"].value  = v;
          menu["x 1"].value  = v;
          menu["x 100"].value  = v;
        },
      },
      "x 100" : {
        value : settings.products[i].quantity,
        min:0,
        max:9999,
        step:100,
        onchange : v => {
          settings.products[i].quantity=v;
          menu["x 0.1"].value  = v;
          menu["x 1"].value  = v;
          menu["x 10"].value  = v;
        },
      },
    };
    E.showMenu(menu);
  };

  const edititem = (i) => {
    const menu = {};
    const textName = /*LANG*/"Name";
    const textQuantity = /*LANG*/"Quantity";
    const textChecked = /*LANG*/"Checked";
    const textDelete = /*LANG*/"Delete";
    menu[""] = { "title" : ''+settings.products[i].quantity+' '+settings.products[i].name };
    menu["< Back"] = () => {
      writeSettings();
      editlist();
    };
    menu[textName] = () => {
      require("textinput").input({text:settings.products[i].name}).then(result => {
        settings.products[i].name = result;
        edititem(i);
      });
    };
    menu[textQuantity] = () => changeQuantity(i);
    menu[textChecked] = {
      value : settings.products[i].ok,
      onchange : v => {
        settings.products[i].ok = v;
      }
    };
    menu[textDelete] = () => E.showPrompt(/*LANG*/"Delete" + " " + menu[""].title + "?").then(function(v) {
        if (v) {
          settings.products.splice(i, 1);
          writeSettings();
          editlist();
        } else {
          edititem(i);
        }
      });

    E.showMenu(menu);
  };

  const editlist = () => {
    const menu = settings.products.map((p,i) => ({
      title: ''+p.quantity+' '+p.name,
      format: () => p.ok?'[x]':'[ ]',
      onchange: v => setTimeout(() => edititem(i), 10),
    }));

    menu[''] = { 'title': 'Grocery list' };
    menu['< Back'] = ()=>settingsmenu();
    E.showMenu(menu);
  };

  const settingsmenu = () => {
    E.showMenu({
      "" : { "title" : "Grocery" },
      "< Back" : () => back(),
      /*LANG*/"Edit List": () => editlist(),
      /*LANG*/"Add item": () => {
        settings.products.push({
          "name":/*LANG*/"New",
          "quantity":1,
          "ok":false
        });
        edititem(settings.products.length-1);
      },
      /*LANG*/"Clear checked": () => E.showPrompt(/*LANG*/"Clear checked" + "?").then(function(v) {
        if (v) {
          settings.products = settings.products.filter(p => !p.ok);
          writeSettings();
        }
        settingsmenu();
      }),
    });
  };

  settingsmenu();
})
