var DEBUG = true;

var main = () => {
  var button0 = new Button({ x1: 0, y1: 35, x2: 58, y1: 70 }, 0);

  button0.draw();

  button0.onClick((value) => {
    log("button with value clicked");
    log(value);
  });
};

// lib functions

var log = (message) => {
  if (DEBUG) {
    console.log(JSON.stringify(message));
  }
};

var touchHandlers = [];

Bangle.on("touch", (_button, xy) => {
  touchHandlers.forEach((touchHandler) => {
    touchHandler(xy);
  });
});

var BUTTON_BORDER_WITH = 2;

class Button {
  constructor(position, value) {
    this.position = position;
    this.value = value;

    this.onClickCallbacks = [];

    touchHandlers.push((xy) => {
      var x = xy.x;
      var y = xy.y;

      if (
        x >= this.position.x1 &&
        x <= this.position.x2 &&
        y >= this.position.y1 &&
        y <= this.position.y2
      ) {
        this.onClickCallbacks.forEach((onClickCallback) =>
          onClickCallback(this.value)
        );
      }
    });
  }

  draw() {
    g.clear();

    g.setColor(g.theme.fg);
    g.fillRect(
      this.position.x1,
      this.position.y1,
      this.position.x2,
      this.position.y2
    );

    g.setColor(g.theme.bg);
    g.fillRect(
      this.position.x1 + BUTTON_BORDER_WITH,
      this.position.y1 + BUTTON_BORDER_WITH,
      this.position.x2 - BUTTON_BORDER_WITH,
      this.position.y2 - BUTTON_BORDER_WITH
    );

    g.setColor(g.theme.fg);
    g.setFontAlign(0, 0);
    g.setFont("Vector", 40);
    g.drawString(
      this.value,
      this.position.x2 - this.position.x1,
      this.position.y2 - this.position.y1
    );
  }

  onClick(callback) {
    this.onClickCallbacks.push(callback);
  }
}

// start main function

main();
