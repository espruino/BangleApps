/*

Watchface Polarix

- Animation des Minutenzeigers bei Unlock:
- Farbe wird dunkler, Strichdicke kleiner, Länge reduziert
- Minutenkreis auch als Polygon gerendert
- Rundungen der Quadrate grösser

*/

{

    // Auflösung Display
    const WIDTH = 176;
    const MIDDLE = 88;

    // Quadrate Hintergrund
    const BIG_SQUARE_WIDTH = WIDTH;
    const BIG_SQUARE_RADIUS = 44;       // anstelle 22
    const SMALL_SQUARE_WIDTH = 110;
    const SMALL_SQUARE_RADIUS = 26;     // anstelle 18

    // Stundenanzeige
    const HOUR_SQUARE_WIDTH = (BIG_SQUARE_WIDTH + SMALL_SQUARE_WIDTH) / 2;
    const HOUR_SQUARE_RADIUS = (BIG_SQUARE_RADIUS + SMALL_SQUARE_RADIUS) / 2;
    const HOUR_SHAPE = { width: HOUR_SQUARE_WIDTH, radius: HOUR_SQUARE_RADIUS };
    const HOUR_MARKER_SIZE = 3;
    const HOUR_LENGTH = 26;     // ohne Abrundung
    const HOUR_WIDTH = 22;
    const HOUR_COLOR = "#F00";

    // Minutenanzeige
    const MIN_SIZE = 9.5;
    const MIN_SHAPE = { width: SMALL_SQUARE_WIDTH, radius: SMALL_SQUARE_RADIUS };
    const MIN_COLOR = "#0094FF";

    // Sekundenanzeige
    const SEC_SIZE = 7;
    const SEC_SHAPE = { width: HOUR_SQUARE_WIDTH, radius: HOUR_SQUARE_RADIUS };
    const SEC_COLOR = "#FF0";

    // Animation
    //const STEP_WIDTH = 4;
    //const MIN_COLORS = [ "#0094FF", "#0076CC", "#005999", "#003B66", "#001E33", "#000000"];

    const STEP_WIDTH = 3;
    const MIN_COLORS = ["#0094FF", "#007DDA", "#0066B6", "#005091", "#00396D", "#002249", "#000B24", "#000000"];

    // Factory für Berechnungsfunktinen
    let createGeom = function() {

        // Liefert Schnittpunkt mit gerundetem Quadrat, Winkel in Radiant.
        function getPoint(shape, angle) {

            const cornerRadius = shape.radius;
            const width = shape.width;
            const alpha = angle;

            const s = width - 2 * cornerRadius; // Länge des geraden Innenteils
            const halfS = s / 2;
            const halfW = width / 2;

            // Berechnet Schnitttpunkt Gerade mit Kreis
            function intersectRayCircle(cx, cy, r, alpha) {

                // Richtung des Strahls (0 Grad ist oben)
                const dx = Math.sin(alpha);
                const dy = -Math.cos(alpha);

                // Quadratische Gleichung lösen: (t*dx - cx)^2 + (t*dy - cy)^2 = r^2
                const A = dx * dx + dy * dy; // ist 1, da normiert
                const B = -2 * (cx * dx + cy * dy);
                const C = cx * cx + cy * cy - r * r;

                const diskriminante = B * B - 4 * A * C;
                if (diskriminante < 0) return null; // Kein Schnittpunkt (sollte nicht passieren)

                // Uns interessiert nur der positive (vordere) Schnittpunkt t
                const t = (-B + Math.sqrt(diskriminante)) / (2 * A);
                return { x: t * dx, y: t * dy };
            }

            let x = 0;
            let y = 0;

            // Bestimme den Quadranten anhand des Winkels, um Ecken abzugrenzen
            // Wir berechnen die Grenzwinkel der inneren Box-Ecken
            // const angleTopRightCornerStart = Math.atan2(halfS, -halfW);
            // Für die Praxis ist es oft leichter, den Schnittpunkt mit den unbegrenzten 
            // Linien der Box zu testen und zu schauen, ob er im geraden Bereich liegt.

            // Richtungsvektor des Strahls
            const dx = Math.sin(alpha);
            const dy = -Math.cos(alpha);

            // 1. Test gegen die 4 geraden Kanten
            let found = false;

            if (Math.abs(dy) > 0.0001) {
                // Schnittpunkt mit oberer Kante (y = -halfW)
                let t = -halfW / dy;
                let xTest = t * dx;
                if (t > 0 && xTest >= -halfS && xTest <= halfS) {
                    x = xTest; y = -halfW; found = true;
                }
                // Schnittpunkt mit unterer Kante (y = halfW)
                if (!found) {
                    t = halfW / dy;
                    xTest = t * dx;
                    if (t > 0 && xTest >= -halfS && xTest <= halfS) {
                        x = xTest; y = halfW; found = true;
                    }
                }
            }

            if (!found && Math.abs(dx) > 0.0001) {
                // Schnittpunkt mit rechter Kante (x = halfW)
                let t = halfW / dx;
                let yTest = t * dy;
                if (t > 0 && yTest >= -halfS && yTest <= halfS) {
                    x = halfW; y = yTest; found = true;
                }
                // Schnittpunkt mit linker Kante (x = -halfW)
                if (!found) {
                    t = -halfW / dx;
                    yTest = t * dy;
                    if (t > 0 && yTest >= -halfS && yTest <= halfS) {
                        x = -halfW; y = yTest; found = true;
                    }
                }
            }

            // 2. Wenn kein gerader Treffer, läuft der Strahl in eine der 4 Ecken
            if (!found) {
                if (dx > 0 && dy < 0) {       // Ecke oben rechts
                    const pt = intersectRayCircle(halfS, -halfS, cornerRadius, alpha);
                    if (pt) { x = pt.x; y = pt.y; }
                } else if (dx > 0 && dy > 0) { // Ecke unten rechts
                    const pt = intersectRayCircle(halfS, halfS, cornerRadius, alpha);
                    if (pt) { x = pt.x; y = pt.y; }
                } else if (dx < 0 && dy > 0) { // Ecke unten links
                    const pt = intersectRayCircle(-halfS, halfS, cornerRadius, alpha);
                    if (pt) { x = pt.x; y = pt.y; }
                } else if (dx < 0 && dy < 0) { // Ecke oben links
                    const pt = intersectRayCircle(-halfS, -halfS, cornerRadius, alpha);
                    if (pt) { x = pt.x; y = pt.y; }
                }
            }

            x += MIDDLE;
            y += MIDDLE;

            return { x: x, y: y };

        }

        // Liefert abgerundetes Quadrat.
        function roundedSquare(width, radius) {

            const d = (WIDTH - width) * 0.5 + radius;
            const n = 7;    // Anzahl Punkte pro Ecke    
            const da = (Math.PI * 0.5) / (n-1);
            
            function pushEdge(xk, yk, startAngle) {  
                for (let i=0; i<n; i++) {
                    const angle = startAngle + i*da;
                    vertices.push(xk + Math.sin(angle) * radius);
                    vertices.push(yk - Math.cos(angle) * radius);
                }
            }

            let vertices = [];
            pushEdge(WIDTH-d, d, 0);  // oben rechts
            pushEdge(WIDTH-d, WIDTH-d, Math.PI * 0.5);  // unten rechts
            pushEdge(d, WIDTH-d, Math.PI);  // unten links
            pushEdge(d, d, Math.PI * 1.5);  // oben links
            
            return vertices;
        
        }

        // Liefert abgerundete Linie (zeigt nach 3 Uhr).
        function roundedLine(length, width) {

            const n = 13;    // Anzahl Punkte pro Ende    
            const da = Math.PI / (n-1);
            const radius = width * 0.5;
            let i, xk, yk, a0, angle;

            function pushArc(xk, yk, startAngle) {
                for (let i=0; i<n; i++) {
                    const angle = startAngle + i*da;
                    vertices.push(xk + Math.sin(angle) * radius);
                    vertices.push(yk - Math.cos(angle) * radius);
                }
            }

            let vertices = [];
            pushArc(length, 0, 0);  // rechtes Ende
            pushArc(0,0, Math.PI);  // linkes Endes
            return vertices;

        }

        // Liefert Kreis als Polygon
        function circle(radius) {

            const n = 24; // Anzahl Punkte 
            const da = 2 * Math.PI / (n-1);

            let vertices = [];
            for (let i=0; i<n; i++) {
                const angle = i*da;
                vertices.push(Math.sin(angle) * radius);
                vertices.push(Math.cos(angle) * radius);
            }
            return vertices;

        }

        return { getPoint, roundedSquare, roundedLine, circle };

    };

    // Factory für Zeichenfunktionen
    let createClock = function () {

        const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
       
        let bigSquarePolygon;
        let smallSquarePolygon;
        let hourPolygon;
        let minutePolygon;

        // Berechnet Dinge, die zur Laufzeit nicht ändern
        function init() {
            bigSquarePolygon = geom.roundedSquare(BIG_SQUARE_WIDTH, BIG_SQUARE_RADIUS);
            smallSquarePolygon = geom.roundedSquare(SMALL_SQUARE_WIDTH, SMALL_SQUARE_RADIUS);
            hourPolygon = geom.roundedLine(HOUR_LENGTH, HOUR_WIDTH);
            minutePolygon = geom.circle(MIN_SIZE);
        }

        // Zeichnet den Hintergrund
        function drawBackground() {
            g.setColor("#FFF");
            g.fillPoly(bigSquarePolygon);
            g.setColor("#000");
            g.fillPoly(smallSquarePolygon);
            drawHourTicks();
        }

        // Zeichnet die Stunden Ticks
        function drawHourTicks() {
            g.setColor("#000");
            for (let i = 0; i < 12; i++) {
                let angle = i * Math.PI * 2 / 12;
                let p = geom.getPoint(HOUR_SHAPE, angle);
                g.fillCircle(p.x, p.y, HOUR_MARKER_SIZE);
            }
        }

        // Zeichnet den Sekundenzeiegr
        function drawSecond(date) {
            const seconds = date.getSeconds();
            const angle = seconds / 60 * 2 * Math.PI;
            const p = geom.getPoint(SEC_SHAPE, angle);
            g.setColor(SEC_COLOR);
            g.fillCircle(p.x, p.y, SEC_SIZE);
        }

         // Zeichnet den Minutenzeiger
        function drawMinute(date) {
            const minutes = date.getMinutes();
            const angle = minutes / 60 * 2 * Math.PI;
            const p = geom.getPoint(MIN_SHAPE, angle);
            let transformed = g.transformVertices(minutePolygon, { x: p.x, y: p.y } );
            g.setColor(MIN_COLOR);
            g.fillPoly(transformed);
        }


        // Zeichnet den Stundenzeiger
        function drawHour(date) {
            const hours = date.getHours() + date.getMinutes() / 60;
            const angle = hours / 12 * Math.PI * 2;
            const angleRot = angle - Math.PI * 0.5;
            let transformed = g.transformVertices(hourPolygon, { x: MIDDLE, y: MIDDLE, rotate: angleRot} );
            g.setColor(HOUR_COLOR);
            g.fillPoly(transformed);
        }

        // Zeichnet das Datum
        function drawInfo(date) {

            function pad(n) {
                return n < 10 ? "0" + n : "" + n;
            }
            const info = WEEKDAYS[date.getDay()] + " " + pad(date.getDate()) + "." + pad(date.getMonth() + 1) + ".";

            g.setColor("#000");
            g.setFont("Vector", 13);
            g.setFontAlign(-1, 0);   // measure and draw from the left edge

            const dateWidth = g.stringWidth(info);
            const x = (WIDTH - dateWidth) / 2;
            const y = MIDDLE + 81;
            g.drawString(info, x, y);
        }

        init();

        return { drawBackground, drawSecond, drawMinute, drawHour, drawInfo };

    };

   
    // Animation des Minutenzeigers, wenn Watch aufgeweckt
    let createAnimation = function () {

        let timer;
        let lineWidth;
        let angleMinute;
        let pointMinute;

        const STEP_WIDTH = 3;
        const MIN_COLORS = ["#0094FF", "#007DDA", "#0066B6", "#005091", "#00396D", "#002249", "#000B24", "#000000"];
        // const COUNT = Math.trunc((MIN_SIZE * 2) / STEP_WIDTH) + 2;  // guess
        const COUNT = 8;

        let loop;
        let pointsX = new Int16Array(COUNT);
        let pointsY = new Int16Array(COUNT);

        // let startTime; // Laufzeitmessung

        // Startet die Animation
        function start() {
            //startTime = Date.now();
            const minutes = controller.getDate().getMinutes();
            angleMinute = minutes / 60 * 2 * Math.PI;
            pointMinute = geom.getPoint(MIN_SHAPE, angleMinute);
            lineWidth = MIN_SIZE * 2;   // 19
            loop = 0;
            interpolate(pointMinute);
            draw();
        }

        // Berechnet die Stützpunkte bei Point
        function interpolate(point) {
            const dx = (point.x - MIDDLE) / (COUNT - 1);
            const dy = (point.y - MIDDLE) / (COUNT - 1);
            for (let i = 0; i < COUNT; i++) {
                pointsX[i] = MIDDLE + i * dx;
                pointsY[i] = MIDDLE + i * dy;
            }
        }

        // Zeichnet den Minutenzeiger
        function drawMinuteLinePolygon(px, py, px2, py2, width, minAngle) {
            const length = Math.sqrt((px-px2)*(px-px2) + (py-py2)*(py-py2));
            let vertices = geom.roundedLine(length, width);
            let angleRot = minAngle - Math.PI * 0.5;
            let transformed = g.transformVertices(vertices, { x: px2, y: py2, rotate: angleRot} );
            g.setColor(MIN_COLORS[loop]);
            g.fillPoly(transformed);
        }


        // Zeichnet die Animation
        function draw() {

            let now = controller.getDate();

            clock.drawBackground();
            clock.drawHour(now);
            clock.drawInfo(now);
            clock.drawSecond(now);
            drawMinuteLinePolygon(pointMinute.x, pointMinute.y, pointsX[loop], pointsY[loop], lineWidth, angleMinute);
            clock.drawMinute(now);

            g.flip();  // must to show
            redraw();
        }

        // Setzt timer für Neuzeichnen
        function redraw() {

            lineWidth = lineWidth - STEP_WIDTH;
            ++loop;

            if (lineWidth < 1) {
                //let duration = Date.now() - startTime;
                //console.log("Animation execution Time: " + duration);
                controller.animationEnded();
                return;
            }

            if (timer) { clearTimeout(timer); } // should never happen
            timer = setTimeout(draw, 10);
        }

        function shutdown() {
            if (timer) { clearTimeout(timer); }
        }

        return { start, shutdown };
    };

    // Factory Function für die Steuerung
    let createController = function () {

        let animation;
        let timer;

        function start() {
            animation = createAnimation();
            Bangle.on("lock", onLock);
            redraw();
        }

        function shutdown() {
            animation.shutdown();
            Bangle.removeListener("lock", onLock);
            if (timer) {
                clearTimeout(timer);
            }
        }

        // Zeichnet Uhr neu und setzt Timeout
        function redraw() {

            draw();

            // set timer for next redraw
            if (timer) { clearTimeout(timer); }

            if (Bangle.isLocked()) {
                timer = setTimeout(redraw, 60000 - (Date.now() % 60000));  // nur jede Minute neu zeichnen
            } else {
                timer = setTimeout(redraw, 1000 - (Date.now() % 1000)); // jede Sekunde neu zeichnen
            }
        }

        // Zeichnet Uhr neu
        function draw() {

            // console.log("draw");

            let now = getDate();

            g.setBgColor("#000");
            g.clear();
            clock.drawBackground();
            clock.drawHour(now);
            clock.drawMinute(now);

            // Falls gelockt, Sekunden und Datum nicht zeichnen.
            if (!Bangle.isLocked()) {
                clock.drawInfo(now);
                clock.drawSecond(now);
            }
        }


        // lock event handler
        function onLock(on, reason) {
            // console.log("onLock " + on);

            if (on) {   // Clock locked: kann mehrfach auftreten
                draw();     // Anzeige aktualisieren
            }
            else {      // Clock unlocked
                if (timer) { clearTimeout(timer); }
                animation.start();
            }
        }

        // Wird aufgerufen, wenn Animation beendet
        function animationEnded() {
            redraw();  // timer neu starten
        }

        // Liefert aktuelle Uhrzeit (für date injection, debugging)
        function getDate() {
            let date = new Date();
            //date.setHours(10);
            //date.setMinutes(42);
            return date;
        }

        return { start, shutdown, animationEnded, getDate };

    };

    let geom = createGeom();
    let clock = createClock();
    let controller = createController();
    controller.start();

    // Show launcher when middle button pressed
    // callback when clock is removed
    Bangle.setUI({
        mode: "clock",
        remove: function () { controller.shutdown(); }
    });

}



