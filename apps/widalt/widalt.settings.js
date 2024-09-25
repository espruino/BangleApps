(function(back) {
  var settings = Object.assign({
    interval: 60000,
  }, require('Storage').readJSON("widalt.json", true) || {});
  const o=Bangle.getOptions();
  Bangle.getPressure().then((p)=>{
    E.showMenu({
      "" : { "title" : "Altimeter Widget" },
      "< Back" : () => back(),
      'QNH': {
        value: Math.floor(o.seaLevelPressure),
        min: 100, max: 10000,
        format: v=>(v+"hPa\nAlt: "+(44330 * (1.0 - Math.pow(p.pressure/v, 0.1903))).toFixed(0)+"m"),
        onchange: v => {Bangle.setOptions({seaLevelPressure:v});}
      },
      'update Interval': {
        value: settings.interval/1000,
        min: 1, max: 60,
        format: v=>(v+"s"),
        onchange: v => {
          settings.interval=v*1000;
          require('Storage').writeJSON("widalt.json", settings);
        }
      }
    });
  });
})
