/* Library for 'custom' HTML files that are to
be used from within BangleApps

See: README.md / `apps.json`: `custom` element
*/

/* Call with a JS object:

sendCustomizedApp({
  id : "7chname",

  storage:[
    {name:"-7chname", content:app_source_code},
    {name:"+7chname", content:JSON.stringify({
      name:"My app's name",
      icon:"*7chname",
      src:"-7chname"
    })},
    {name:"*7chname", content:'require("heatshrink").decompress(atob("mEwg...4"))', evaluate:true},
  ]
});
*/
function sendCustomizedApp(app) {
  window.postMessage(app);
}
