type ActualMenuItem = Exclude<Menu["..."], MenuOptions | undefined>;

type PromenuSettings = {
  naturalScroll: boolean,
  wrapAround: boolean,
};

const enum Consts {
  NAME_SCROLL_PAD = 5,
}

const prosettings = (require("Storage").readJSON("promenu.settings.json", true) || {}) as PromenuSettings;
prosettings.naturalScroll ??= false;
prosettings.wrapAround ??= true;

E.showMenu = ((items?: Menu): MenuInstance | void => {
  if(items == null){
    g.clearRect(Bangle.appRect);
    return Bangle.setUI();
  }

  const RectRnd = (x1: number, y1: number, x2: number, y2: number, r: number) => {
    const pp = [];
    pp.push(...g.quadraticBezier([x2 - r, y1, x2, y1, x2, y1 + r]));
    pp.push(...g.quadraticBezier([x2, y2 - r, x2, y2, x2 - r, y2]));
    pp.push(...g.quadraticBezier([x1 + r, y2, x1, y2, x1, y2 - r]));
    pp.push(...g.quadraticBezier([x1, y1 + r, x1, y1, x1 + r, y1]));
    return pp;
  };
  const fillRectRnd = (x1: number, y1: number, x2: number, y2: number, r: number, c: ColorResolvable) => {
    g.setColor(c);
    g.fillPoly(RectRnd(x1, y1, x2, y2, r));
    g.setColor(255, 255, 255);
  };
  let options = items && items[""] || {};
  const menuItems = Object.keys(items).filter(x => x.length);

  const fontHeight = options.fontHeight||25;

  let selected = options.scroll || options.selected || 0;

  g.reset().clearRect(Bangle.appRect);

  let lastIdx = 0;
  let selectEdit: undefined | ActualMenuItem = undefined;

  const scroller = {
    scroll: selected,
  };
  let nameScroller: IntervalId | null = null;

  const drawLine = (
    name: string,
    v: string,
    item: ActualMenuItem,
    idx: number,
    x: number,
    y: number,
    nameScroll: number = 0,
  ) => {
    const { x2 } = Bangle.appRect;
    const hl = (idx === selected && !selectEdit);
    if(g.theme.dark){
      fillRectRnd(x, y, x2, y + fontHeight - 3, 7, hl ? g.theme.bgH : g.theme.bg + 40);
    }else{
      fillRectRnd(x, y, x2, y + fontHeight - 3, 7, hl ? g.theme.bgH : g.theme.bg - 20);
    }

    g.setFont12x20()
      .setColor(hl ? g.theme.fgH : g.theme.fg)
      .setFontAlign(-1, -1);

    const vplain = v.indexOf("\0") < 0;
    let truncated = false;
    let drawn = false;
    if(vplain){
      const isFunc = typeof item === "function";
      const lim = isFunc ? 15 : 17 - v.length;

      if(name.length >= lim){
        const len = isFunc ? 15 : 12 - v.length;
        const dots = name.length - nameScroll > len ? "..." : "";

        g.drawString(
          name.substring(nameScroll, nameScroll + len) + dots,
          x + 3.7,
          y + 2.7
        );
        drawn = true;
        truncated = true;
      }
    }
    if(!drawn)
      g.drawString(name, x + 3.7, y + 2.7);

    let xo = x2;
    if (selectEdit && idx === selected) {
      xo -= 24 + 1;
      g.setColor(g.theme.fgH)
        .drawImage(
          "\x0c\x05\x81\x00 \x07\x00\xF9\xF0\x0E\x00@",
          xo,
          y + (fontHeight - 10) / 2,
          {scale:2},
        );
    }
    g.setFontAlign(1, -1);
    g.drawString(v, xo - 2, y + 1);

    return truncated;
  };

  const l = {
    draw: (rowmin?: number, rowmax?: number) => {
      // always refresh appRect, a back button may have appeared
      let { x, x2, y, y2 } = Bangle.appRect;
      if(y === 0) y = 24; // always bump down for widgets/back button

      if (options.title) y += 22;
      y2 -= 12; // padding at end for arrow

      if (nameScroller) clearInterval(nameScroller), nameScroller = null;
      let rows = 0|Math.min((y2 - y) / fontHeight, menuItems.length);
      let idx = E.clip(selected - (rows>>1), 0, menuItems.length - rows);

      if (idx != lastIdx) rowmin=undefined; // redraw all if we scrolled
      lastIdx = idx;
      let iy = y;
      g.reset().setFontAlign(0, -1, 0).setFont12x20();
      if (options.predraw) options.predraw(g);
      if (rowmin === undefined && options.title)
        g.drawString(options.title, (x + x2) / 2, y - 21).drawLine(x, y - 2, x2, y - 2).
          setColor(g.theme.fg).setBgColor(g.theme.bg);
      iy += 4;
      if (rowmin !== undefined) {
        if (idx < rowmin) {
          iy += fontHeight * (rowmin - idx);
          idx = rowmin;
        }
        if (rowmax && idx + rows > rowmax) {
          rows = 1 + rowmax - rowmin;
        }
      }
      while (rows--) {
        const name = menuItems[idx];
        const item = items![name]! as ActualMenuItem;

        let v: string;
        if (typeof item === "object") {
          v = "format" in item
            ? (item.format as any)(item.value) // <T>format(), value: T
            : item.value;
          if (typeof v !== "string") v = `${v}`;
        } else {
          v = "";
        }

        const truncated = drawLine(name, v, item, idx, x, iy, 0);
        if (truncated && idx === selected){
          let nameScroll = 0;
          nameScroller = setInterval((
            name: string,
            v: string,
            item: ActualMenuItem,
            idx: number,
            x: number,
            iy: number,
          ) => {
            drawLine(name, v, item, idx, x, iy, nameScroll);
            nameScroll += 1;
            if (nameScroll >= name.length - Consts.NAME_SCROLL_PAD) nameScroll = 0;
          }, 300, name, v, item, idx, x, iy);
        }

        iy += fontHeight;
        idx++;
      }
      g.setFontAlign( - 1, -1);
      g.setColor((idx < menuItems.length)?g.theme.fg:g.theme.bg).fillPoly([72, 166, 104, 166, 88, 174]);
      g.flip();
    },
    select: (evt: TouchCallbackXY | undefined) => {
      const item = items![menuItems[selected]] as ActualMenuItem;

      if (typeof item === "function") {
        item(evt);
      } else if (typeof item === "object") {
        if (typeof item.value === "number") {
          selectEdit = selectEdit ? undefined : item;
        } else {
          if (typeof item.value === "boolean")
            item.value = !item.value;

          if (item.onchange)
            item.onchange(item.value as boolean, evt);
        }
        l.draw();
      }
    },
    move: (dir: number, evt: TouchCallbackXY | undefined) => {
      const item = selectEdit;

      if (typeof item === "object" && typeof item.value === "number") {
        const orig = item.value;

        item.value += (-dir||1) * (item.step||1);

        if ("min" in item && item.value < item.min)
          item.value = item.wrap ? item.max as number : item.min;

        if ("max" in item && item.value > item.max)
          item.value = item.wrap ? item.min as number : item.max;

        if (item.value !== orig) {
          if (item.onchange)
            item.onchange(item.value, evt);

          l.draw(selected, selected);
        }

      } else {
        const lastSelected = selected;
        if (prosettings.wrapAround) {
          selected = (selected + dir + /*keep +ve*/menuItems.length) % menuItems.length;
        } else {
          selected = E.clip(selected + dir, 0, menuItems.length - 1);
        }
        scroller.scroll = selected;
        l.draw(Math.min(lastSelected, selected), Math.max(lastSelected, selected));
      }
    },
    scroller,
  };

  l.draw();

  let back = options.back;
  if (!back) {
    const backItem = items && items["< Back"];
    if (typeof backItem === "function")
      back = backItem;
    else if (backItem && "back" in backItem)
      back = backItem.back;
  }
  let onSwipe: SwipeCallback | undefined;
  if (typeof back === "function") {
    const back_ = back;
    onSwipe = (lr/*, ud*/) => {
      if (lr < 0) back_();
    };
    Bangle.on('swipe', onSwipe);
  }

  const cb = (dir?: 1 | -1, evt?: TouchCallbackXY) => {
    if (dir) l.move(prosettings.naturalScroll ? -dir : dir, evt);
    else l.select(evt);
  };

  const touchcb = ((_button, xy) => {
      // since we've specified options.touch,
      // we need to pass through all taps since the default
      // touchHandler isn't installed in setUI
      cb(void 0, xy);
  }) satisfies TouchCallback;

  const uiopts = {
    mode: "updown",
    back: back as () => void,
    remove: () => {
      if (nameScroller) clearInterval(nameScroller);
      Bangle.removeListener("swipe", onSwipe);
      if(setUITouch)
          Bangle.removeListener("touch", touchcb);
      options.remove?.();
    },
  } satisfies SetUIArg<"updown">;

  // does setUI install its own touch handler?
  const setUITouch = process.env.VERSION >= "2v26";
  if (!setUITouch) {
      // old firmware, we can use its touch handler - no need for workaround
      (uiopts as any).touch = touchcb;
  }

  Bangle.setUI(uiopts, cb);

  if(setUITouch){
      // new firmware, remove setUI's touch handler and use just our own to
      // avoid `cb` drawing the menu (as part of setUI's touch handler)
      // followed by us drawing the menu (as part of our touch handler)
      //
      // work around details:
      // - https://github.com/espruino/Espruino/issues/2648
      // - https://github.com/orgs/espruino/discussions/7697#discussioncomment-13782299
      Bangle.removeListener("touch", (Bangle as any).touchHandler);
      delete (Bangle as any).touchHandler;

      Bangle.on("touch", touchcb);
  }

  return l;
}) as typeof E.showMenu;
