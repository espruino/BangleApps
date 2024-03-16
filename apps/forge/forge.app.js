// App Forge

"Bangle.loadWidgets()"; // Facilitates fastloading to this app via Fastload Utils, while still not loading widgets on standard `load` calls.

const st = require('Storage');

let l = /^a\..*\.js$/;
//l = /.*\.js/;
l = st.list(l, {sf:false});

print(l);

function on_load(x) {
  print("Loading", x);
  Bangle.buzz(50, 1); // Won't happen because load() is quicker
  g.reset().clear()
    .setFont("Vector", 40)
    .drawString("Loading", 0, 30)
    .drawString(x, 0, 80);
  g.flip();
  load(x);
}

var menu = {
    "< Back" : Bangle.load
};
if (l.length==0) Object.assign(menu, {"No apps":""});
else for (let id in l) {
    let i = id;
    menu[l[id]]=()=>{ on_load(l[i]); };
}

g.clear();
E.showMenu(menu);
