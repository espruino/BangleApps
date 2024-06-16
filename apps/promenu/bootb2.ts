type ActualMenuItem = Exclude<Menu["..."], MenuOptions | undefined>;

E.showMenu = (items?: Menu): MenuInstance => {
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
  if (items) delete items[""];
  const menuItems = Object.keys(items);

  const fontHeight = options.fontHeight||25;

  let selected = options.scroll || options.selected || 0;

  const ar = Bangle.appRect;
  g.reset().clearRect(ar);

  const x = ar.x;
  const x2 = ar.x2;
  let y = ar.y;
  const y2 = ar.y2 - 12; // padding at end for arrow
  if (options.title)
    y += 22;

  let lastIdx = 0;
  let selectEdit: undefined | ActualMenuItem = undefined;

  const l = {
    draw: (rowmin?: number, rowmax?: number) => {
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

        const hl = (idx === selected && !selectEdit);
        if(g.theme.dark){
          fillRectRnd(x, iy, x2, iy + fontHeight - 3, 7, hl ? g.theme.bgH : g.theme.bg + 40);
        }else{
          fillRectRnd(x, iy, x2, iy + fontHeight - 3, 7, hl ? g.theme.bgH : g.theme.bg - 20);
        }

        g.setColor(hl ? g.theme.fgH : g.theme.fg);
        g.setFontAlign( - 1, -1);

        let v;
        if (typeof item === "object") {
          v = "format" in item
            ? (item.format as any)(item.value) // <T>format(), value: T
            : item.value;
          if (typeof v !== "string") v = `${v}`;
        } else {
          v = "";
        }

        /*???*/{
          if(name.length >= 17 - v.length && typeof item === "object"){
            g.drawString(name.substring(0, 12 - v.length) + "...", x + 3.7, iy + 2.7);
          }else if(name.length >= 15){
            g.drawString(name.substring(0, 15) + "...", x + 3.7, iy + 2.7);
          }else{
            g.drawString(name, x + 3.7, iy + 2.7);
          }

          let xo = x2;
          if (selectEdit && idx === selected) {
            xo -= 24 + 1;
            g.setColor(g.theme.fgH)
              .drawImage(
                "\x0c\x05\x81\x00 \x07\x00\xF9\xF0\x0E\x00@",
                xo,
                iy + (fontHeight - 10) / 2,
                {scale:2},
              );
          }
          g.setFontAlign(1, -1);
          g.drawString(v, xo - 2, iy + 1);
        }

        g.setColor(g.theme.fg);
        iy += fontHeight;
        idx++;
      }
      g.setFontAlign( - 1, -1);
      g.setColor((idx < menuItems.length)?g.theme.fg:g.theme.bg).fillPoly([72, 166, 104, 166, 88, 174]);
      g.flip();
    },
    select: () => {
      const item = items![menuItems[selected]] as ActualMenuItem;

      if (typeof item === "function") {
        item();
      } else if (typeof item === "object") {
        if (typeof item.value === "number") {
          selectEdit = selectEdit ? undefined : item;
        } else {
          if (typeof item.value === "boolean")
            item.value = !item.value;

          if (item.onchange)
            item.onchange(item.value as boolean);
        }
        l.draw();
      }
    },
    move: (dir: number) => {
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
            item.onchange(item.value);

          l.draw(selected, selected);
        }

      } else {
        const lastSelected = selected;
        selected = (selected + dir + /*keep +ve*/menuItems.length) % menuItems.length;
        l.draw(Math.min(lastSelected, selected), Math.max(lastSelected, selected));
      }
    },
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

  Bangle.setUI({
    mode: "updown",
    back,
    remove: () => {
      Bangle.removeListener("swipe", onSwipe);
    },
  } as SetUIArg<"updown">,
  dir => {
    if (dir) l.move(dir);
    else l.select();
  });

  return l;
};
