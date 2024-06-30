{
  let _setWatch = setWatch;
  global.setWatch = (fn,pin,opt) => {
    let name = global.__FILE__ || "";
    if (opt && opt.edge && opt.edge!="both" && !name.includes("run")) opt.edge = "rising";
    return _setWatch(fn, pin, opt);
  };
}
