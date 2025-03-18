
WIDGETS["casiologo"]={
    area:"tl",
    width: Bangle.CLOCK?70:0,
    draw: function () {
      if (!Bangle.CLOCK != !this.width) { // if we're the wrong size for if we have a clock or not...
        this.width = Bangle.CLOCK?70:0;
        return setTimeout(Bangle.drawWidgets,1); // widget changed size - redraw
      }
      if (!this.width) return;
      g.reset().setColor(g.theme.dark?"#fff":"#000").drawImage(
        atob("OgwCAAAAAAAAAAAAAAAAAAAA///wA//AD//8D8D///A////AP/wD///w/D///8P9B/wL//A/AD8Pw/wC/D8AD8D8PwPwAAD8PwAPw/AAAA/D8D///A/D8AD8PwAAA/gPwP//8Pw/AA/D8AD8P//8AAA/T8PwAPw/wD/P///z8AP0/D/Af8P///z/AL8///8Pw////A///w/AA/T///D8D///AAAAAAAAAAAAAAAAAAAA"),
        this.x+10,
        this.y+6)
    }
  };
