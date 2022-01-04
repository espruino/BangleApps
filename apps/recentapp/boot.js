// cache load function
var _load = global.load;

// set new load function
global.load = (app) => {
  // write module file to storage
  require("Storage").write("recentapp", "exports=" + (
    app ? ("Object.assign({type:\"app\"}," +
      "require(\"Storage\").readJSON(\"" +
      app.replace(/\..*/,".info\",1)||{});")) :
    "{name:\"Default Clock\",id:\"clock\",type:\"clock\"};"
  ));
  // execute cached load function
  _load(app);
};
