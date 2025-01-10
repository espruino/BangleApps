// タイマー設定
let totalTime = 1;       // タイマーの設定（1周にかかる時間）。単位: 分
let outerRadius = 10;    // 外側の円の半径
let innerRadius = 1;     // 中心部の黒円の半径

// タイマー管理
let elapsedSeconds = 0;  // 経過秒数
let isRunning = false;   // タイマー動作中かどうか
let timerInterval = null;

// 円グラフの一部（扇形）を描画する関数
function pie(f, a0, a1, invert) {
  if (!invert) return pie(f, a1, a0 + 1, true);
  const t0 = Math.tan(a0 * 2 * Math.PI), t1 = Math.tan(a1 * 2 * Math.PI);
  let i0 = Math.floor(a0 * 4 + 0.5), i1 = Math.floor(a1 * 4 + 0.5);
  const x = f.getWidth()/2, y = f.getHeight()/2;
  const poly = [
    x + (i1 & 2 ? -x : x) * (i1 & 1 ? 1 : t1),
    y + (i1 & 2 ?  y : -y) / (i1 & 1 ? t1 : 1),
    x, y,
    x + (i0 & 2 ? -x : x) * (i0 & 1 ? 1 : t0),
    y + (i0 & 2 ?  y : -y) / (i0 & 1 ? t0 : 1),
  ];
  if (i1 - i0 > 4) i1 = i0 + 4;
  for (i0++; i0 <= i1; i0++)
    poly.push((3*i0 & 2) ? f.getWidth() : 0, (i0 & 2) ? f.getHeight() : 0);
  return f.setColor(0).fillPoly(poly);
}

// 円グラフを描画する関数
function drawTimer(g) {
  const totalSeconds = totalTime * 60;
  const fraction = elapsedSeconds / totalSeconds;
  const centerX = g.getWidth() / 2;
  const centerY = g.getHeight() / 2;

  // 背景のクリア
  g.clear();
  g.setColor('#FFFFFF').fillCircle(centerX, centerY, outerRadius); // 外円

  // 塗りつぶし（円グラフ）
  pie(g, 0, fraction, true);

  // 中心を黒円で塗りつぶして整形
  g.setColor('#000000').fillCircle(centerX, centerY, innerRadius);
}

// タイマーの更新
function updateTimer(g) {
  if (isRunning) {
    elapsedSeconds++;
    const totalSeconds = totalTime * 60;
    // 一周を超えたらタイマーを停止してメッセージを表示
    if (elapsedSeconds >= totalSeconds) {
      elapsedSeconds = 0;
      isRunning = false;
      clearInterval(timerInterval);
      timerInterval = null;

      // ---- Time Up! と画面表示 ----
      g.clear();
      g.setFontAlign(0, 0);
      g.setFont("6x8", 2);
      g.drawString("Time Up!", g.getWidth() / 2, g.getHeight() / 2);

      return; // ここで処理を中断
    }
    // 通常描画
    drawTimer(g);
  }
}

// タイマー開始（起動時に1回だけ呼び出す）
function startTimer(g) {
  if (!isRunning) {
    isRunning = true;
    timerInterval = setInterval(() => updateTimer(g), 1000);
  }
}

// タイマーのリセット（動作は継続もしくは再スタート用）
function resetTimer(g) {
  elapsedSeconds = 0;
  drawTimer(g);
}

// LCD が点灯したら再描画
Bangle.on('lcdPower', (on) => {
  if (on) drawTimer(g);
});

// ------------ ダブルプレス判定を行う部分 -------------
let lastPressTime = 0;          // 前回押された時刻(ms)
const doublePressMs = 500;      // ダブルプレスと判定する最大間隔(ms)

// Bangle.js 2 向けにボタン操作を定義（1つのボタンだけ）
Bangle.setUI({
  mode: "custom",
  btn: () => {
    const now = Date.now();
    // 前回押下から一定時間以内なら「ダブルプレス」と判定
    if (now - lastPressTime < doublePressMs) {
      // ダブルプレス時は「リセット＋再スタート」
      resetTimer(g);
      startTimer(g);
    } else {
      // ここではシングルプレス時の処理は行わない
      lastPressTime = now;
    }
  }
});

// 初期描画
drawTimer(g);
// 実行時にタイマーを自動スタート
startTimer(g);
