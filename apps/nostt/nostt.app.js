class View {

  constructor() {

    this.navigationState = {
      prevPage: {
        p: undefined,
        s: undefined,
      },
      prevSubPage: {
        p: undefined,
        s: undefined,
      },
      nextPage: {
        p: undefined,
        s: undefined,
      },
      nextSubPage: {
        p: undefined,
        s: undefined,
      },
      currentPage: {
        p: undefined,
        s: undefined,
      },
    };

    this.colorArray = {
      0: [0, 0, 0],
      1: [1, 0, 0],
      2: [0, 1, 0],
      3: [1, 1, 0],
      4: [0, 0, 1],
      5: [1, 0, 1],
      6: [0, 1, 1],
      7: [1, 1, 1],
      16: [0, 0, 0],
      17: [1, 0, 0],
      18: [0, 1, 0],
      19: [1, 1, 0],
      20: [0, 0, 1],
      21: [1, 0, 1],
      22: [0, 1, 1],
      23: [1, 1, 1],
    };


  }

  start() {
    g.clear();
    if (this.nextStartPage) {
      this.show(this.nextStartPage);
      this.nextStartPage = undefined;
    }
    else {
      if (this.navigationState.currentPage.p) {
        this.show(this.navigationState.currentPage.p);
      }
      else {
        this.show(101); //load default
      }
    }

  }

  split_at_fourty(res, value) {
    res.push(value.substring(0, 40));
    if (value.length > 40) { // at least two rows
      return this.split_at_fourty(res, value.substring(40));
    }
    else {
      return res;
    }

  }

//    strToUtf8Bytes(str) {
//        const utf8 = [];
//        for (let ii = 0; ii < str.length; ii++) {
//          let charCode = str.charCodeAt(ii);
//          if (charCode < 0x80) utf8.push(charCode);
//          else if (charCode < 0x800) {
//            utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
//          } else if (charCode < 0xd800 || charCode >= 0xe000) {
//            utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
//          } else {
//            ii++;
//            // Surrogate pair:
//            // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and
//            // splitting the 20 bits of 0x0-0xFFFFF into two halves
//            charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
//            utf8.push(
//              0xf0 | (charCode >> 18),
//              0x80 | ((charCode >> 12) & 0x3f),
//              0x80 | ((charCode >> 6) & 0x3f),
//              0x80 | (charCode & 0x3f),
//            );
//          }
//        }
//        return utf8;
//      }

  loadPrevPage() {
    if (this.navigationState.prevPage.p) {
      this.show(this.navigationState.prevPage.p, this.navigationState.prevPage.s);
    }
  }

  loadNextPage() {
    if (this.navigationState.nextPage.p) {
      this.show(this.navigationState.nextPage.p, this.navigationState.nextPage.s);
    }
  }

  loadPrevSubPage() {
    if (this.navigationState.prevSubPage.p) {
      this.show(this.navigationState.prevSubPage.p, this.navigationState.prevSubPage.s);
    }
  }

  loadNextSubPage() {
    if (this.navigationState.nextSubPage.p) {
      this.show(this.navigationState.nextSubPage.p, this.navigationState.nextSubPage.s);
    }
  }

  handleSwipe(lr, ud){
    if (lr == -1 && ud == 0) {
      this.loadNextPage();
    }
    if (lr == 1 && ud == 0) {
      this.loadPrevPage();
    }
    if (lr == 0 && ud == 1) {
      this.loadPrevSubPage();
    }
    if (lr == 0 && ud == -1) {
      this.loadNextSubPage();
    }
  }

  show(pageId, subPageId) {
    if(!subPageId){
      subPageId = 1;
    }

    if (Bangle.http) {
      Bangle.http('https://teletekst-data.nos.nl/page/' + pageId + '-' + subPageId).then((data) => {

        const res = data.resp;
        g.clear();


        this.navigationState = {
          prevPage: {
            p: undefined,
            s: undefined,
          },
          prevSubPage: {
            p: undefined,
            s: undefined,
          },
          nextPage: {
            p: undefined,
            s: undefined,
          },
          nextSubPage: {
            p: undefined,
            s: undefined,
          },
          currentPage: {
            p: pageId,
            s: subPageId,
          },
        };

        // set next -, previous -, next sub - and previous sub page
        let navNIndex = res.indexOf('pn=n_');
        if (navNIndex > -1) {
          this.navigationState.nextPage.p = parseInt(res.substring(navNIndex + 5, navNIndex + 8));
          this.navigationState.nextPage.s = parseInt(res.substring(navNIndex + 9, navNIndex + 10));
        }
        let navPIndex = res.indexOf('pn=p_');
        if (navPIndex > -1) {
          this.navigationState.prevPage.p = parseInt(res.substring(navPIndex + 5, navPIndex + 8));
          this.navigationState.prevPage.s = parseInt(res.substring(navPIndex + 9, navPIndex + 10));
        }
        let navPSIndex = res.indexOf('pn=ps');
        if (navPSIndex > -1) {
          this.navigationState.prevSubPage.p = parseInt(res.substring(navPSIndex + 5, navPSIndex + 8));
          this.navigationState.prevSubPage.s = parseInt(res.substring(navPSIndex + 9, navPSIndex + 10));
        }
        let navNSIndex = res.indexOf('pn=ns');
        if (navNSIndex > -1) {
          this.navigationState.nextSubPage.p = parseInt(res.substring(navNSIndex + 5, navNSIndex + 8));
          this.navigationState.nextSubPage.s = parseInt(res.substring(navNSIndex + 9, navNSIndex + 10));
        }

        let split = E.toString(res.split('<pre>')[1].split('</pre>')[0]);

        this.render(split);
      });
    }
  }




  render(source) {

    g.setFontAlign(-1, -1);
    g.setFont('4x6');


    const bytes = E.toUint8Array(E.decodeUTF8(source));
    let rowIndex = 0;
    let totalIndex = 0;
    let charIndex = 0;

    for (let charByte of bytes) {
      {
        if ((charByte >= 0 && charByte <= 7) || (charByte >= 16 && charByte <= 23)) {
          const color = this.colorArray[charByte];
          g.setColor(color[0], color[1], color[2]);
        }
      }
      g.drawString(source[totalIndex], (charIndex * 4) + 6, rowIndex * 7);
      charIndex++;
      totalIndex++;
      if (charIndex == 40) {
        rowIndex++;
        charIndex = 0;
        g.flip();
      }
    }
  }


}

const BUTTON_BORDER_WITH = 2;

class Button {
//    position;
//    value;
//    highlightTimeoutId;


  constructor(position, value) {
    this.position = position;
    this.value = value;
  }

  draw(highlight) {
    g.setColor(g.theme.fg);
    g.fillRect(
        this.position.x1,
        this.position.y1,
        this.position.x2,
        this.position.y2
    );

    if (highlight) {
      g.setColor(g.theme.bgH);
    } else {
      g.setColor(g.theme.bg);
    }
    g.fillRect(
        this.position.x1 + BUTTON_BORDER_WITH,
        this.position.y1 + BUTTON_BORDER_WITH,
        this.position.x2 - BUTTON_BORDER_WITH,
        this.position.y2 - BUTTON_BORDER_WITH
    );

    g.setColor(g.theme.fg);
    g.setFontAlign(0, 0);
    g.setFont("Vector", 35);
    g.drawString(
        this.value,
        this.position.x1 + (this.position.x2 - this.position.x1) / 2 + 2,
        this.position.y1 + (this.position.y2 - this.position.y1) / 2 + 2
    );
  }

  handleTouchInput(n, e) {
    if (
        e.x >= this.position.x1 &&
        e.x <= this.position.x2 &&
        e.y >= this.position.y1 &&
        e.y <= this.position.y2
    ) {
      this.draw(true); // draw to highlight
      this.highlightTimeoutId = setTimeout(() => {
        this.draw();
        this.highlightTimeoutId = undefined;
      }, 100);
      return this.value;
    }
    else {
      return undefined;
    }
  }

  disable() {
    // disable button
    if (this.highlightTimeoutId) {
      clearTimeout(this.highlightTimeoutId);
      this.highlightTimeoutId = undefined;
    }
  }

}

class Input {

  constructor(callback) {
    this.inputCallback = callback;
    this.inputVal = "";

    let button1 = new Button({ x1: 1, y1: 35, x2: 58, y2: 70 }, '1');
    let button2 = new Button({ x1: 60, y1: 35, x2: 116, y2: 70 }, '2');
    let button3 = new Button({ x1: 118, y1: 35, x2: 174, y2: 70 }, '3');

    let button4 = new Button({ x1: 1, y1: 72, x2: 58, y2: 105 }, '4');
    let button5 = new Button({ x1: 60, y1: 72, x2: 116, y2: 105 }, '5');
    let button6 = new Button({ x1: 118, y1: 72, x2: 174, y2: 105 }, '6');

    let button7 = new Button({ x1: 1, y1: 107, x2: 58, y2: 140 }, '7');
    let button8 = new Button({ x1: 60, y1: 107, x2: 116, y2: 140 }, '8');
    let button9 = new Button({ x1: 118, y1: 107, x2: 174, y2: 140 }, '9');

    let buttonOK = new Button({ x1: 1, y1: 142, x2: 58, y2: 174 }, "OK");
    let button0 = new Button({ x1: 60, y1: 142, x2: 116, y2: 174 }, "0");
    let buttonDelete = new Button({ x1: 118, y1: 142, x2: 174, y2: 174 }, "<-");

    this.inputButtons = [
      button1,
      button2,
      button3,
      button4,
      button5,
      button6,
      button7,
      button8,
      button9,
      buttonOK,
      button0,
      buttonDelete,
    ];
  }

  handleTouchInput(n, e) {
    let res = 'none';
    for (let button of this.inputButtons) {
      const touchResult = button.handleTouchInput(n, e);
      if (touchResult) {
        res = touchResult;
      }
    }

    switch (res) {
      case 'OK':
        if(this.inputVal.length == 3){
          this.inputCallback(parseInt(this.inputVal));
        }
        break;
      case '<-':
        this.removeNumber();
        this.drawField();
        break;
      case 'none':
        break;
      default:
        this.appendNumber(parseInt(res));
        this.drawField();
    }

  }


  hide() {
    for (let button of this.inputButtons) {
      button.disable();
    }
  }

  start(preset) {
    if (preset) {
      this.inputVal = preset.toString();
    }
    else {
      this.inputVal = '';
    }

    this.draw();
  }

  appendNumber(number) {
    if (number === 0 && this.inputVal.length === 0) {
      return;
    }

    if (this.inputVal.length <= 2) {
      this.inputVal = this.inputVal + number;
    }
  }

  removeNumber() {
    if (this.inputVal.length > 0) {
      this.inputVal = this.inputVal.slice(0, -1);
    }
  }

  reset() {
    this.inputVal = "";
  }

  draw() {
    g.clear();
    this.drawButtons();
    this.drawField();
  }

  drawButtons() {
    for (let button of this.inputButtons) {
      button.draw();
    }
  }

  drawField() {
    g.clearRect(0, 0, 176, 34);
    g.setColor(g.theme.fg);
    g.setFontAlign(-1, -1);
    g.setFont("Vector:26x40");
    g.drawString(this.inputVal, 2, 0);
  }
}

// require('./Input');

class NOSTeletekstApp {

  constructor() {
    console.log("this is the teletekst app!");
    this.isLeaving = false;
    this.viewMode= 'VIEW';
    this.view = new View();
    this.input = new Input((newVal)=>this.inputHandler(newVal));
    this.view.start();

    Bangle.setUI({
      mode: "custom",
      remove: () => {
        this.isLeaving = true;
        console.log("teletext app: i am packing my stuff, goodbye");
        require("widget_utils").show(); // re-show widgets
      },
      touch: (n, e) => {
        if (this.viewMode == 'VIEW') {
          // we need to go to input mode
          this.setViewMode('INPUT');
          return;
        }
        if (this.viewMode == 'INPUT') {
          this.input.handleTouchInput(n, e);
          return;

        }
      },
      swipe: (lr, ud) => {
        if (this.viewMode == 'VIEW') {
          this.view.handleSwipe(lr,ud);
        }
        if (this.viewMode == 'INPUT') {
          if(lr == 1 && ud == 0){
            this.setViewMode('VIEW');
          }
        }
      }

    });

  }

  inputHandler(input){
    // set viewMode back to view
    this.view.nextStartPage = input;
    this.setViewMode('VIEW');
  }

  setViewMode(newViewMode){
    this.viewMode = newViewMode;
    if(newViewMode=='INPUT'){
      this.input.start();
    }
    if(newViewMode=='VIEW'){
      this.input.hide();
      this.view.start();
    }
  }


}
new NOSTeletekstApp();