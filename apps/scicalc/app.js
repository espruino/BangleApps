const W = g.getWidth();
const H = g.getHeight();

const dispH = H/5;
const butH = H-dispH;

const buttons = [[['7', '8', '9'],
                  ['4', '5', '6'],
                  ['1', '2', '3'],
                  ['E', '0', '.']],
                 [['<', 'M', 'C'],
                  ['+', '-', '*'],
                  ['/', '(', ')'],
                  ['^', ',', '=']],
                 [['Sin', 'Cos', 'Tan'],
                  ['Asi', 'Aco', 'Ata'],
                  ['Pi', '1/x', '+/-'],
                  ['Log', 'Exp', 'Pow']
                 ]];

var curPage = 0;
var inputStr = '';
var memory = '';
var qResult = false;

function drawPage (p) {
  g.clearRect(0, dispH, W-1, H-1);
  g.setFont('Vector', butH/5).setFontAlign(0, 0, 0).setColor(g.theme.fg);
  for (x=0; x<3; ++x)
    for (y=0; y<4; ++y)
      g.drawString(buttons[p][y][x], (x+0.5)*W/3, dispH+(y+0.7)*butH/4);
  g.setColor(0.5, 0.5, 0.5);
  for (x=1; x<3; ++x) g.drawLine(x*W/3, dispH+0.2*butH/4-2, x*W/3, H-1);
  for (y=1; y<4; ++y) g.drawLine(0, dispH+(y+0.2)*butH/4, W-1, dispH+(y+0.2)*butH/4);
  g.setColor(g.theme.fg).drawLine(0, dispH+0.2*butH/4-2, W-1, dispH+0.2*butH/4-2);
}

function updateDisp(s, len) {
  var fh = butH/5; 
  if (s.toString().length>len) s = s.toString().substr(0,len);
  g.setFont("Vector", butH/5).setColor(g.theme.fg).setFontAlign(1, 0, 0);
  while (g.stringWidth(s) > W-1) {
    fh /= 1.05;
    g.setFont("Vector", fh);
  }
  g.clearRect(0, 0, W-1, dispH-1).drawString(s, W-2, dispH/2);
  g.setColor(g.theme.fg).drawLine(0, dispH+0.2*butH/4-2, W-1, dispH+0.2*butH/4-2);
}

function processInp (s) {
  var idx = s.indexOf("^");
  if (idx > 0) s = "Math.pow(" + s.slice(0,idx) + "," + s.slice(idx+1, s.length) + ")";
  ['Sin', 'Cos', 'Tan', 'Asin', 'Acos', 'Atan', 'Log', 'Exp', 'Pow'].forEach((x) => {
    var i = s.indexOf(x);
    while (i>-1) { 
      s = s.slice(0,i)+"Math."+s.slice(i,i+1).toLowerCase()+s.slice(i+1, s.length);
      i = s.indexOf(x, i+6);
    }
  });
  idx = s.indexOf('Pi');
  if (idx>-1) s = s.slice(0,idx) + "Math.PI" + s.slice(idx+2, s.length);
  idx = 0;
  s.split('').forEach((x)=>{ if (x=='(') idx++; if (x==')') idx-- });
  s += ')'.repeat(idx);
  return s;
}

function compute() {
  var res;
  console.log(processInp(inputStr));
  try { res = eval(processInp(inputStr)); }
  catch(e) { res = "error"; }
  inputStr = res === undefined ? '' : res.toString();
  qResult = true;
  updateDisp(inputStr, 19);
}

function touchHandler(e, d) {
  var x = Math.floor(d.x/(W/3));
  var y = Math.floor((d.y-dispH-0.2*butH/4)/(butH/4));
  var c = buttons[curPage][y][x];
  if (c=="=") { // do the computation
    compute();
    return;
  }
  else if (c=="<" && inputStr.length>0) inputStr = inputStr.slice(0, -1); // delete last character
  else if (c=='M' && qResult) memory = inputStr;
  else if (c=='M') inputStr += memory;
  else if (c=="C") inputStr = ''; // clear
  else { 
    if ("Sin Cos Tan Log Exp Pow".indexOf(c)>-1 && c!='E') c += "(";
    if ("Asi Aco Ata".indexOf(c)>-1) c += "n(";
    if (c=='1/x') { inputStr = "1/("+inputStr+")"; compute(); return; }
    if (c=='+/-') { inputStr = "-("+inputStr+")"; compute(); return; }
    if (qResult && "+-*/^".indexOf(c)==-1) inputStr = c + inputStr + ")";
    else inputStr += c;
  }
  qResult = false;
  updateDisp(inputStr, 32);
}

function swipeHandler(d,e) {
  curPage -= e;
  if (curPage>buttons.length-1) curPage = 0;
  if (curPage<0) curPage = buttons.length-1;
  drawPage(curPage);
  if (d==1) compute();
  else if (d==-1) {
    if (inputStr.length>0) inputStr = inputStr.slice(0, -1); // delete last character
    qResult = false;
    updateDisp(inputStr, 32);
  }
}

Bangle.setUI({
  mode : "custom",
  touch : touchHandler,
  swipe : swipeHandler,
  btn : () => load(),
});

g.clear();
drawPage(curPage);
