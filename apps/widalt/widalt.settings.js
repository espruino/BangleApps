(function(back) {
  Bangle.getPressure().then((p)=>{
    E.showMenu({
      "" : { "title" : "Altimeter Widget" },
      "< Back" : () => back(),
      'QNH': {
        value: Math.floor(o.seaLevelPressure),
        min: 100, max: 10000,
        format: v=>(v+"hPa\nAlt: "+(44330 * (1.0 - Math.pow(p.pressure/v, 0.1903))).toFixed(0)+"m"),
        onchange: v => {Bangle.setOptions({seaLevelPressure:v});}
      }
    });
  });
})
