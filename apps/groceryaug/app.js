var filename = 'grocery_list_aug.json';
var settings = require("Storage").readJSON(filename,1)|| { products: [] };

function updateSettings() {
  require("Storage").writeJSON(filename, settings);
  Bangle.buzz();
}


const mainMenu = settings.products.reduce(function(m, p, i){
const name = p.name;
  m[name] = {
    value: p.ok,
    format: v => v?'[x]':'[ ]',
    onchange: v => {
      settings.products[i].ok = v;
      updateSettings();
    }
  };
  return m;
}, {
  '': { 'title': 'Grocery list' }
});
mainMenu['< Back'] = ()=>{load();};
E.showMenu(mainMenu);
