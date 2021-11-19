var filename = 'grocery_list.json';
var settings = require("Storage").readJSON(filename,1)|| { products: [] };

function updateSettings() {
  require("Storage").writeJSON(filename, settings);
  Bangle.buzz();
}

function twoChat(n){
  if(n<10) return '0'+n;
  return ''+n;
}

const mainMenu = settings.products.reduce(function(m, p, i){
  const name = twoChat(p.quantity)+' '+p.name;
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
