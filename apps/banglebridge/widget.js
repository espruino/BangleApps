(() => {
    /**
     * Widget measurements
     * Description:
     * name: connection.wid.js
     *icon: conectionIcon.icon
     *
     */

    //Font

    g.setFont("Vector", 100);
    //variabangle.Sensorss
    //let acclS, bttS, compssS, gpsS, hrmS, stepS; //Strings
    let accelN, compssN, gpsN, hrmN, stepN; //Num
    //let prueba = 1;
    let data = [0, 0, 0, 0, 0, 0];
    //Constants for redabangle.Sensors code
    let storage = require('Storage');
    //let deCom = require('heatshrink');




    //Sensors code
    /**
     *
     * @author Jorge
     */
    function accel() {

        Bangle.on('accel', function (acc) {
            // acc = {x,y,z,diff,mag}
            accelN = acc;
        });

        setInterval(function () {
            //acclS = accelN.x + "##" + accelN.y + "##" + accelN.z + "\n" + accelN.diff + "##" + accelN.mag;
            data[3] = accelN;
        }, 2 * 1000);

    }

    function btt() {

        setInterval(function () {
            //bttS = E.getBattery(); //return String
            data[2] = E.getBattery();
        }, 15 * 1000);

    }



    function compss() {

        Bangle.setCompassPower(1);
        Bangle.on('mag', function (mag) {
            // mag = {x,y,z,dx,dy,dz,heading}
            compssN = mag;
        });


        setInterval(function () {

            /*compssS = "A: " + compssN.x + " ## " + compssN.y + " ## " + compssN.z + "\n" +
                "B: " + compssN.dx + " ## " + compssN.dy + " ## " + compssN.dz + " ## " + "\n" +
                "C: " + compssN.heading; *///return String
            data[4] = compssN;
        }, 2 * 1000);

    }



    function gps() {

        Bangle.setGPSPower(1);
        Bangle.on('GPS', function (gps) {
            // gps = {lat,lon,alt,speed,etc}
            gpsN = gps;

        });

        setInterval(function () {

            /*gpsS = "A: " + gpsN.lat + " ## " + gpsN.lon + " ## " + gpsN.alt + "\n" + "B: " + gpsN.speed + " ## " + gpsN.course + " ## " + gpsN.time + "\n" +
                "C: " + gpsN.satellites + " ## " + gpsN.fix; *///return String
            // work out how to display the current time
            var d = new Date();
            var year = d.getFullYear();

            var month = d.getMonth() + 1;
            var finalMonth = 0;
            if (month < 10) {
                finalMonth = "0" + month;
            } else {
                finalMonth = month;
            }
            var day = d.getDate();
            var finalDay = 0;
            if (day < 10) {
                finalDay = "0" + day;
            } else {
                finalDay = day;
            }
            var h = d.getHours(),
                m = d.getMinutes();
            var finalh = 0;
            if (h < 10) {
                finalh = "0" + h;
            } else {
                finalh = h;
            }
            var finalM = 0;
            if (m < 10) {
                finalM = "0" + m;
            } else {
                finalM = m;
            }

            var s = d.getSeconds();
            var finalS = 0;
            if (s < 10) {
                finalS = "0" + s;
            } else {
                finalS = s;
            }
            var z = d.getMilliseconds();
            //var zFinal = new String(z);
            //zFinal = zFinal.replace('.', '');
            var completeTime = year + "-" + finalMonth + "-" + finalDay + "T" + finalh + ":" + finalM + ":" + finalS + "." + z + "Z";
            //var time = h + ":" + ("0" + m).substr(-2);
            gpsN.time = completeTime;
            data[5] = gpsN;
        }, 2 * 1000);
    }

    //2021-06-11T19:21:58.000Z

    function hrm() {

        let msr = [0, 0, 0, 0, 0];
        let lastInsert = -1;

        function roundInsert(nueva) {
            let indexFinal = (lastInsert + 1) % (msr.length);
            //console.log("Index ==> "+ index);
            msr[indexFinal] = nueva;

            //item = nueva;
            lastInsert = indexFinal;

        }

        function normalize(nueva) {

            let normalize = 0;
            roundInsert(nueva);


            msr.forEach(function (number) {
                normalize += number;
            });
            normalize = normalize / msr.length;

            return normalize;

        }




        setInterval(function () {

            if (!isNaN(hrmN)) {


                hrmN = normalize(hrmN);
                var roundedRate = parseFloat(hrmN).toFixed(2);
                //hrmS = String.valueOf(roundedRate); //return String
                //console.log("array----->" + msr);
                data[0] = roundedRate;

            }





        }, 2 * 1000);

    }


    function steps() {

        Bangle.on('step', s => {

            stepN = s;
        });


        setInterval(function () {

            //stepS = String.valueOf(stepN); //return String
            data[1] = stepN;
        }, 2 * 1000);


    }

    function initSensors() {

        //need power control
        Bangle.setHRMPower(1);

        Bangle.on('HRM', function (hrm) {
            hrmN = hrm.bpm;


        });
        console.log("Sensors are being Init....");
        accel();
        btt();
        compss();
        gps();
        hrm();
        steps();

    }

    var flip = 1;
    Bangle.on('lcdPower', function (on) {
        /*
         prueba ++;
         Bangle.drawWidgets();
         g.setFont("Vector", 45);
         g.drawString(prueba,100,200);*/
        if (flip == 1) { //when off

            flip = 0;
            //Bangle.buzz(1000);
        } else { //when on

            flip = 1;
            g.setFont("Vector", 30);
            g.drawString(data[0], 65, 180);
            Bangle.drawWidgets();
        }

    });


    function draw() {
       g.drawImage(storage.read("banglebridge.watch.img"),this.x + 1,this.y + 1);
       g.drawImage(storage.read("banglebridge.heart.img"), 145, 167);
    }


    // Finally add widget


    initSensors();
    // Bangle.drawWidgets();
   // Terminal.println("Running BangleBridge");
    data[0] = 80.5;
    g.setFont("Vector", 30);
    g.drawString(data[0], 65, 180);
   // Bangle.drawWidgets();
    setInterval(function () {
        //console.log("---------------------------------------------------------------");
        //console.log(data);
        //Bluetooth.println(data[0]);
        var measurement = {
            hrm: data[0],
            step: data[1],
            batt: data[2],
            acc: data[3],
            com: data[4],
            gps: data[5]
        };
        /*
            g.drawString(compssS,100,200);
          */



        Bluetooth.println(JSON.stringify(measurement) + "#");
        //draw();

    }, 5 * 1000);

      WIDGETS["banglebridge"]={
        area: "tl",
        width: 10,
        draw: draw,
      };
})(); //End of Widget
