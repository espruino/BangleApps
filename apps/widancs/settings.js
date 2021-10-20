(function(back) {
  const ANCSFILE = "widancs.json";

  // initialize with default settings...
  let s = {
    'enabled': false,
    'category':[1,2,4]
  };
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  const d = storage.readJSON(ANCSFILE, 1) || {};
  const saved = d.settings || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  function save() {
    d.settings = s;
    storage.write(ANCSFILE, d);
  }
  
  function setcategory(){
    const names = ["Other","Call ","Missed Call","Voicemail","Messages ","Calendar","Email","News ","Fitness ","Busniness","Location ","Entertainment"];
    function hascat(n){return s.category.includes(n);}
    function setcat(n,v){
      if (v)
        s.category.push(n);
      else 
        s.category = s.category.filter((v,i,a)=>{return v!=n;});
    }
    const menu = {
    '': { 'title': 'Set Categories' }
    };
    for (var i=0; i<names.length;++i)
        menu[names[i]]={
             value:hascat(i),
             format:v=>v?'Yes':'No',
             onchange:setcat.bind(null,i)
        };
    menu['< Back'] = ()=>{save(); showMain();};
    return E.showMenu(menu);
  }

 function showMain(){
    return E.showMenu({
      'Enable ANCS': {
        value: s.enabled,
        format: () => (s.enabled ? 'Yes' : 'No'),
        onchange: () => {
          s.enabled = !s.enabled;
          save();
        },
      },
      'Set Category':setcategory,
      '< Back': back,
    });
  }
  
  showMain();
});