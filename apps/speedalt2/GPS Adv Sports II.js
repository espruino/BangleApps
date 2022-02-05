// Add this script to DroidScript on an android device.
// Uses the PuckJS plugin to provide mirroring of the GPS Adv Sports II Bangle app face onto an android device.

app.LoadPlugin("PuckJS");


//Called when application is started.
function OnStart() {

    requiredVer = '1.43';

    //    Mode = 0 // 0=SPD, 1=ALT, 2=DST, 3=VMG, 4=POSN, 5=TIME
    btnOff = '#175A63'
    btnOn = '#4285F4'

    // Connect to Bangle
    puck = app.CreatePuckJS();

    puck.SetOnConnect(onConnect); // Callback.
    puck.SetOnReceive(readResponse); // Callback to capture console output from app.
    puck.Scan("Bangle");

    // Controls
    app.SetScreenMode("Full")

    //Create a layout with objects vertically centered.
    layVert = app.CreateLayout("Linear", "VCenter,FillXY")
    layVert.SetPadding(0.02, 0.02, 0.02, 0.02);
    layVert.SetBackColor('black')

    //Create a text label and add it to layout.
    val = app.CreateText('', -1, -1, "Multiline") // main value
    val.SetTextSize(120)
    val.SetTextColor('#64FF00') // green
    layVert.AddChild(val)

    val2 = app.CreateText('') // minor value or waypoint name
    val2.SetTextSize(50)
    val2.SetTextColor('#00E4FF') // cyan
    layVert.AddChild(val2)


    // Units and status text
    layHor = app.CreateLayout("Linear", "Horizontal")
    layHor.SetMargins(-1, -1, -1, 10, 'px')
    unit = app.CreateText('')
    unit.SetSize(200, -1, "px")
    unit.SetTextSize(32)
    unit.SetTextColor('#FCFA00') // yellow
    layHor.AddChild(unit)

    //	mode = app.CreateText( '' ,.3,-1,"Center" )
    mode = app.CreateText('', -1, -1)
    mode.SetSize(200, -1, "px")
    mode.SetTextSize(32)
    mode.SetTextColor('#FCFA00') // yellow
    layHor.AddChild(mode)

    //	sats = app.CreateText( '' ,.3,-1,"Right")
    sats = app.CreateText('', -1, -1, "FillXY,Bottom")
    sats.SetSize(200, -1, "px")
    sats.SetTextSize(20)
    sats.SetTextColor('#00E4FF') // cyan
    layHor.AddChild(sats)

    layVert.AddChild(layHor)

    // Buttons

    layBtn = app.CreateLayout("Linear", "Horizontal")


    btnStart = app.CreateButton("Start");
    btnStart.SetOnTouch(btn_OnStart);
    btnStart.SetBackColor(btnOff)
    layBtn.AddChild(btnStart);

    btnStop = app.CreateButton("Stop");
    btnStop.SetOnTouch(btn_OnStop);
    btnStop.SetBackColor(btnOff)
    layBtn.AddChild(btnStop);

    btnScan = app.CreateButton("Scan");
    btnScan.SetOnTouch(btn_OnScan);
    btnScan.SetBackColor(btnOff)
    layBtn.AddChild(btnScan);

    // Status 'LED'
    led = app.AddCanvas(layBtn, 0.1, 0.1, "FillXY,Bottom")

    layVert.AddChild(layBtn)

    //Add layout to app.	
    app.AddLayout(layVert)


}

function readResponse(data) {
    if (data.substring(0, 1) != '{') return; // ignore non JSON
    btnStart.SetBackColor(btnOn)

    d = JSON.parse(data);

    if ((parseFloat(d.v) < parseFloat(requiredVer)) || (typeof(d.v) == 'undefined')) {
        btn_OnStop()
        app.Alert('The GPS Adv Sports II app on your Bangle must be at least version ' + requiredVer, 'Bangle App Upgrade Required')
        return
    }

    // Flash blue 'led' indicator when data packet received.
    led.SetPaintColor("#0051FF")
    led.DrawCircle(0.5, 0.5, 0.1)
    led.Update()
    setTimeout(clearLED, 500)

    if (d.m == 0) { // Speed ( dont need pos or time here )
        val.SetTextSize(120)
        val2.SetTextSize(50)

        val.SetText(d.sp)
        val2.SetText('')
        unit.SetText(d.spd_unit)
        mode.SetText('SPD')
        sats.SetText(d.sats)
    }

    if (d.m == 1) { // Alt
        val.SetTextSize(120)
        val2.SetTextSize(50)

        val.SetText(d.al)
        val2.SetText('')
        unit.SetText(d.alt_unit)
        mode.SetText('ALT')
        sats.SetText(d.sats)
    }

    if (d.m == 2) { // Dist
        val.SetTextSize(120)
        val2.SetTextSize(50)

        val.SetText(d.di)
        val2.SetText(d.wp)
        unit.SetText(d.dist_unit)
        mode.SetText('DST')
        sats.SetText(d.sats)
    }

    if (d.m == 3) { // VMG
        val.SetTextSize(120)
        val2.SetTextSize(50)

        val.SetText(d.vmg)
        val2.SetText(d.wp)
        unit.SetText(d.spd_unit)
        mode.SetText('VMG')
        sats.SetText(d.sats)
    }

    if (d.m == 4) { // POS
        val.SetTextSize(80)
        val2.SetTextSize(20)

        val.SetText(d.lat + ' ' + d.ns + "\n" + d.lon + ' ' + d.ew)
        val2.SetText('')
        unit.SetText('')
        mode.SetText('')
        sats.SetText(d.sats)
    }

    if (d.m == 5) { // Time
        val.SetTextSize(90)
        val2.SetTextSize(10)

        dt = new Date();

        val.SetText(String(dt.getHours()).padStart(2, '0') + "\n" + String(dt.getMinutes()).padStart(2, '0'))
        val2.SetText('')
        unit.SetText('')
        mode.SetText('')
        sats.SetText(d.sats)
    }

}

function clearLED() {
    led.Clear()
    led.Update()
}

function onConnect() {
    btn_OnStart() // Once connect tell app to start sending updates
}

function btn_OnStart() {
    btnStart.SetBackColor(btnOn)
    btnStop.SetBackColor(btnOff)
    puck.SendCode('btOn(1)\n') // Enable the data send
}

function btn_OnStop() {
    btnStart.SetBackColor(btnOff)
    btnStop.SetBackColor(btnOn)
    puck.SendCode('btOn(0)\n') // Disable the data send
    val.SetText('')
    val2.SetText('')
    unit.SetText('')
    mode.SetText('')
    sats.SetText('')
}

function btn_OnScan() {
    btnStart.SetBackColor(btnOff)
    btnStop.SetBackColor(btnOff)
    puck.Scan("Bangle");
}

