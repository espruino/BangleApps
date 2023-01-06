var filename = 'grocery_list.json';
var settings = require("Storage").readJSON(filename,1)|| { products: [] };
let menu;

function updateSettings() {
  require("Storage").writeJSON(filename, settings);
  Bangle.buzz();
}

function twoChat(n){
  if(n<10) return '0'+n;
  return ''+n;
}

function sortMenu() {
  mainMenu.sort((a,b) => {
    const byValue = a.value-b.value;
    return byValue !== 0 ? byValue : a.index-b.index;
  });
  if (menu) {
    menu.draw();
  }
}

const mainMenu = settings.products.map((p,i) => ({
  title: twoChat(p.quantity)+' '+p.name,
  value: p.ok,
  format: v => v?'[x]':'[ ]',
  index: i,
  onchange: v => {
    settings.products[i].ok = v;
    updateSettings();
    sortMenu();
  }
}));
sortMenu();

mainMenu[''] = { 'title': 'Grocery list' };
mainMenu['< Back'] = ()=>{load();};

Bangle.loadWidgets();
menu = E.showMenu(mainMenu);
Bangle.drawWidgets();
