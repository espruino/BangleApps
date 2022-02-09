// Add this script to DroidScript on an android device.
// Uses the PuckJS plugin to provide mirroring of the GPS Adv Sports II Bangle app face onto an android device.

app.LoadPlugin("PuckJS");

app.SetDebugEnabled(true);


v = '1.52'                      // Version of this script
requiredBangleVer = '1.47';     // Minimum speedalt2 version required on Bangle
curBangleVer = '-.--'
isStopped = true;               // Data receive turned off
lastData = new Date().getTime() / 1000;   // Time of last data received

//Colours
//    Mode = 0 // 0=SPD, 1=ALT, 2=DST, 3=VMG, 4=POSN, 5=TIME
btnOff = '#175A63'
btnOn = '#4285F4'
col = new Array(['black'],['#64FF00'],['#FCFA00'],['#00E4FF'])   // bg, main, units, wp   - 0xFFFF,0x007F,0x0054,0x0054

// Settings
conf = JSON.parse( app.LoadText( "settings", "{}" ))
if ( typeof(conf.btAddr) != 'string' ) conf.btAddr = '' // Address of last connection
if ( typeof(conf.btName) != 'string' ) conf.btName = '' // Name of last connection

// Extend PuckJS
app.CreateBangleJS = function( options ) 
{ 
    return new BangleJS( options );
}

class BangleJS extends PuckJS {
    
    constructor(options) {
        super(options)
    }

}

//Called when application is started.
function OnStart() {


    // Connect to Bangle
     if( !app.IsBluetoothEnabled() ) app.SetBluetoothEnabled( true );

//    puck = app.CreatePuckJS();
    bngl = app.CreateBangleJS();
    bngl.SetOnConnect(onConnect);       // Callback.
    bngl.SetOnReceive(readResponse);    // Callback to capture console output from app.


    if ( conf.btAddr == '' ) {
        console.log('Scanning')
        bngl.Scan("Bangle");
    }
    else {
        console.log('Reconnecting to : '+conf.btAddr)
        bngl.address = conf.btAddr
        bngl.name = conf.btName
        bngl.Connect(bngl.address);
    }

    app.SetDebugEnabled(false);

    setInterval(checkConnection,5000)   // Periodic check for data timeout and attempt a reconnect

    // Controls
    app.SetScreenMode("Full")
    
    //Create a layout with objects vertically centered.
    layVert = app.CreateLayout("Linear", "VCenter,FillXY")
    layVert.SetPadding(0.02, 0.02, 0.02, 0.02);
    layVert.SetBackColor(col[0])

    //Create a text label and add it to layout.
    val = app.CreateText('', -1, -1, "Html,Multiline") // main value
    val.SetTextSize(120)
    val.SetTextColor(col[1]) // green
    layVert.AddChild(val)

    val2 = app.CreateText('') // minor value or waypoint name
    val2.SetTextSize(50)
    val2.SetTextColor(col[3]) // cyan
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
    sats.SetTextColor(col[3]) // cyan
    layHor.AddChild(sats)

    layVert.AddChild(layHor)

    // Buttons
    layBtn = app.CreateLayout("Linear", "Horizontal")

    btnAbout = app.CreateButton("About");
    btnAbout.SetOnTouch(btn_OnAbout);
    btnAbout.SetBackColor(btnOff)
    layBtn.AddChild(btnAbout);

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

    lastData = new Date().getTime() / 1000;   // Time of last data received

    d = JSON.parse(data);

    if ( ( d.id != 'speedalt2' ) || (parseFloat(d.v) < parseFloat(requiredBangleVer)) || (typeof(d.v) == 'undefined')) {
        btn_OnStop()
        app.Alert('The GPS Adv Sports II app on your Bangle must be at least version ' + requiredBangleVer, 'Bangle App Upgrade Required')
        return
    }
    
    curBangleVer = d.v

    if (parseFloat(v) < parseFloat(d.vd)) {
        btn_OnStop()
        app.Alert('This GPS Adv Sports II script must be at least version ' + d.vd, 'Droidscript script Upgrade Required')
        return
    }


    isStopped = false;          // Flag that we are running and receiving data
    
    // Flash blue 'led' indicator when data packet received.
    setLED(led,true,"#0051FF")
    setTimeout(function() {setLED(led,false,-1)}, 500)

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
        val2.SetTextSize(10)
 
        txt = d.lat + 
            ' <font color='+col[2]+'><small><small>' + 
            d.ns + 
            "</small></small></font><br>" + 
            d.lon + 
            ' <font color='+col[2]+'><small><small>' + 
            d.ew +
            "</small></small></font>"
            
        val.SetHtml(txt)
        val2.SetText('')
        unit.SetText('')
        mode.SetText('')
        sats.SetText(d.sats)
    }

    if (d.m == 5) { // Time
        val.SetTextSize(90)
        val2.SetTextSize(0)

        dt = new Date();

        val.SetText(String(dt.getHours()).padStart(2, '0') + "\n" + String(dt.getMinutes()).padStart(2, '0'))
        val2.SetText('')
        unit.SetText('')
        mode.SetText('')
        sats.SetText(d.sats)
    }

}

function setLED(canvas,on,colour) {
    if ( on ) {
        canvas.SetPaintColor(colour)
        canvas.DrawCircle(0.5, 0.5, 0.1)
    }
    else {
        canvas.Clear()
    }
    canvas.Update()
}

function onConnect(name, address) {
//    app.SetDebugEnabled(true)

    if ( typeof(address) == 'string' ) conf.btAddr = address
    if ( typeof(name) == 'string' ) conf.btName = name
    app.SaveText( "settings", JSON.stringify( conf ))  // persist connection for future so no need to scan each time used.
    
    console.log( "Connected to : " + conf.btAddr );
    btn_OnStart() // Once connect tell app to start sending updates
    app.SetDebugEnabled(false)
}

// Periodic check for data timeout and attempt a reconnect
function checkConnection() {
    if (isStopped) return
    if ( parseFloat(new Date().getTime() / 1000) - lastData > 30 ) {

        console.log( "Reconnecting to : "+conf.btAddr);

        // Flash orange 'led' indicator for connection attempts.
        setLED(led,true,"#FC8A00")
        setTimeout(function() {setLED(led,false,-1)}, 500)
        bngl.Connect(conf.btAddr)
    }
}

function btn_OnAbout() {
    app.ShowPopup(
        "GPS Adv Sports II\nAndroid Mirror : "+v+
        "\nBangle.js : "+curBangleVer+
        "\nConnected : "+conf.btName,"Long")
}

function btn_OnStart() {
    btnStart.SetBackColor(btnOn)
    btnStop.SetBackColor(btnOff)
    bngl.SendCode('btOn(1)\n') // Enable the data send
    isStopped = false
}

function btn_OnStop() {
    btnStart.SetBackColor(btnOff)
    btnStop.SetBackColor(btnOn)
    bngl.SendCode('btOn(0)\n') // Disable the data send
    isStopped = true
    val.SetText('')
    val2.SetText('')
    unit.SetText('')
    mode.SetText('')
    sats.SetText('')
}

function btn_OnScan() {
    btnStart.SetBackColor(btnOff)
    btnStop.SetBackColor(btnOff)
    bngl.Scan("Bangle");
}
