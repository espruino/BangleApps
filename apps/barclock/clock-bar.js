/* jshint esversion: 6 */
/**
 * A simple 24h digital clock showing seconds as a bar
 **/
{
  const timeFont = '6x8'
  const timeFontSize = 8 // 'hh:mm' fits exactly
  const dateFont = 'Vector'
  const dateFontSize = 20

  const screenSize = g.getWidth()
  const screenCenter = screenSize / 2

  const timeY = screenCenter
  const barY = 155 // just below time
  const barThickness = 6 // matches time digit size
  const dateY = screenSize - dateFontSize // at bottom of screen

  const SECONDS_PER_MINUTE = 60

  function timeText(date) {
    const d = date.toString().split(' ')
    const time = d[4].substr(0, 5)
    const t = time.split(':')
    const hours = t[0],
      minutes = t[1]
    return `${hours}:${minutes}`
  }

  function dateText(date) {
    const d = date.toString().split(' ')
    const dayName = d[0],
      month = d[1],
      day = d[2]
    return `${dayName}  ${day} ${month}`
  }

  function drawDateTime(date) {
    g.setFontAlign(0, 0) // centered

    g.setFont(timeFont, timeFontSize)
    g.drawString(timeText(date), screenCenter, timeY, true)

    g.setFont(dateFont, dateFontSize)
    g.drawString(dateText(date), screenCenter, dateY, true)
  }

  function drawBar(date) {
    const seconds = date.getSeconds()
    const fraction = seconds / SECONDS_PER_MINUTE
    g.fillRect(0, barY, fraction * screenSize, barY + barThickness)
  }
  function eraseBar() {
    const color = g.getColor()
    g.setColor(g.getBgColor())
    g.fillRect(0, barY, screenSize, barY + barThickness)
    g.setColor(color)
  }

  let lastSeconds
  function tick() {
    g.reset()
    const date = new Date()
    const seconds = date.getSeconds()
    if (lastSeconds > seconds) {
      // new minute
      eraseBar()
      drawDateTime(date)
    }
    drawBar(date)

    lastSeconds = seconds
  }

  let iTick
  function start() {
    lastSeconds = 99 // force redraw
    tick()
    iTick = setInterval(tick, 1000)
  }
  function stop() {
    if (iTick) {
      clearInterval(iTick)
      iTick = undefined
    }
  }

  // clean app screen
  g.clear()
  Bangle.loadWidgets()
  Bangle.drawWidgets()
  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, {repeat: false, edge: 'falling'})

  Bangle.on('lcdPower', function (on) {
    on ? start() : stop()
  })
  start()
}
