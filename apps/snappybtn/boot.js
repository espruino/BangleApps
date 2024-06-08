{
  let _setWatch = setWatch;
  global.setWatch = (fn,pin,opt) => {
    if (opt && opt.edge && opt.edge!="both" && global.__FILE__!="runplus.app.js") opt.edge = "rising";
    return _setWatch(fn, pin, opt);
  };
}
