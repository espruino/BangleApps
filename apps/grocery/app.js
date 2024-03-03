{
const filename = 'grocery_list.json';
const settings = require("Storage").readJSON(filename,1)|| { products: [] };
let menu;

const updateSettings = function() {
  require("Storage").writeJSON(filename, settings);
  Bangle.buzz();
};

const twoChat = function(n) {
  if(n<10) return '0'+n;
  return ''+n;
};

const sortMenu = function() {
  mainMenu.sort((a,b) => {
    const byValue = a.value-b.value;
    return byValue !== 0 ? byValue : a.index-b.index;
  });
  if (menu) {
    menu.draw();
  }
};

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

mainMenu[''] = {
  'title': 'Grocery list',
  remove: () => {
  },
};
mainMenu['< Back'] = ()=>{load();};

Bangle.loadWidgets();
menu = E.showMenu(mainMenu);
Bangle.drawWidgets();
}
