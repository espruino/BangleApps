(function () {
  require('Font7x11Numeric7Seg').add(Graphics)
  g.clear()
  g.setFont7x11Numeric7Seg()
  let interval = null
  let middleX = 120
  let middleY = 160
  let baseline = middleY - 4
  let lineLength = 30
  let lineY1 = middleY - 7
  let lineY2 = middleY + 9

  function step () {
    g.clear()
    let d = new Date()
    let hour = d.getHours()
    if (hour <= 9) hour = '0' + hour
    let minute = d.getMinutes()
    if (minute <= 9) minute = '0' + minute
    let second = d.getSeconds()
    if (second <= 9) second = '0' + second
    g.setColor(0.5, 0.5, 0.5)
    g.drawLine(middleX - lineLength, lineY1, middleX + lineLength, lineY1)
    g.drawLine(middleX - lineLength, lineY2, middleX + lineLength, lineY2)
    g.setColor(1, 1, 1)
    g.drawString(hour, middleX - 34, baseline, false)
    g.drawString(minute, middleX - 8, baseline, false)
    g.drawString(second, middleX + 18, baseline, false)
  }

  function stop () {
    if (interval) clearInterval(interval)
  }

  function start () {
    if (interval) clearInterval(interval)
    interval = setInterval(step, 1000)
    step()
  }

  start()

  Bangle.on('lcdPower', function (on) {
    if (on) {
      drawWidgets()
      start()
    } else {
      stop()
    }
  })
})()
