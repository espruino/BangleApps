/* jshint esversion: 6 */
/**
 * A simple digital clock showing seconds as a bar
 **/
{
  // Check settings for what type our clock should be
  const is12Hour = (require('Storage').readJSON('setting.json', 1) || {})['12hour']
  const locale = require('locale')
  { // add some more info to locale
    let date = new Date()
    date.setFullYear(1111)
    date.setMonth(1, 3) // februari: months are zero-indexed
    const localized = locale.date(date, true)
    locale.dayFirst = /3.*2/.test(localized)
    locale.hasMeridian = (locale.meridian(date) !== '')
  }

  const timeFont = '6x8'
  const timeFontSize = (is12Hour && locale.hasMeridian) ? 6 : 8
  const ampmFontSize = 2
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
    if (!is12Hour) {
      return {time: locale.time(date, true), ampm: ''}
    }
    const meridian = locale.meridian(date)
    const hours = date.getHours()
    if (hours === 0) {
      date.setHours(12)
    } else if (hours > 12) {
      date.setHours(hours - 12)
    }
    return {time: locale.time(date, true), ampm: meridian}
  }

  function dateText(date) {
    const dayName = locale.dow(date, true),
      month = locale.month(date, true),
      day = date.getDate()
    return `${dayName}  ` + (locale.dayFirst ? `${day} ${month}` : `${month} ${day}`)
  }

  function drawDateTime(date) {
    const timeTexts = timeText(date)
    g.setFontAlign(0, 0) // centered
    g.setFont(timeFont, timeFontSize)
    g.drawString(timeTexts.time, screenCenter, timeY, true)
    if (timeTexts.ampm !== '') {
      g.setFontAlign(1, -1)
      g.setFont(timeFont, ampmFontSize)
      g.drawString(timeTexts.ampm,
        // at right edge of screen     , aligned with time bottom
        (screenSize - ampmFontSize * 2), (timeY + timeFontSize - ampmFontSize),
        true)
    }

    g.setFontAlign(0, 0) // centered
    g.setFont(dateFont, dateFontSize)
    g.drawString(dateText(date), screenCenter, dateY, true)
  }

  function drawBar(date) {
    const seconds = date.getSeconds()
    if (seconds === 0) return; // zero-size rect stills draws one line of pixels
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
