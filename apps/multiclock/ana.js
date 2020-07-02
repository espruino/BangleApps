(() => {

    function getFace(){

    const p = Math.PI/2;
    const PRad = Math.PI/180;

    function seconds(angle, r) {
        const a = angle*PRad;
        const x = 120+Math.sin(a)*r;
        const y = 134-Math.cos(a)*r;
        if (angle % 90 == 0) {
            g.setColor(0,1,1);
            g.fillRect(x-6,y-6,x+6,y+6);
        } else if (angle % 30 == 0){
            g.setColor(0,1,1);
            g.fillRect(x-4,y-4,x+4,y+4);
        } else {
            g.setColor(1,1,1);
            g.fillRect(x-1,y-1,x+1,y+1);
        }
    }

    function hand(angle, r1,r2, r3) {
        const a = angle*PRad;
        g.fillPoly([
            120+Math.sin(a)*r1,
            134-Math.cos(a)*r1,
            120+Math.sin(a+p)*r3,
            134-Math.cos(a+p)*r3,
            120+Math.sin(a)*r2,
            134-Math.cos(a)*r2,
            120+Math.sin(a-p)*r3,
            134-Math.cos(a-p)*r3]);
    }

    var minuteDate;
    var secondDate;

    function onSecond() {
        g.setColor(0,0,0);
        hand(360*secondDate.getSeconds()/60, -5, 90, 3);
        if (secondDate.getSeconds() === 0) {
            hand(360*(minuteDate.getHours() + (minuteDate.getMinutes()/60))/12, -16, 60, 7);
            hand(360*minuteDate.getMinutes()/60, -16, 86, 7);
            minuteDate = new Date();
        }
        g.setColor(1,1,1);
        hand(360*(minuteDate.getHours() + (minuteDate.getMinutes()/60))/12, -16, 60, 7);
        hand(360*minuteDate.getMinutes()/60, -16, 86, 7);
        g.setColor(0,1,1);
        secondDate = new Date();
        hand(360*secondDate.getSeconds()/60, -5, 90, 3);
        g.setColor(0,0,0);
        g.fillCircle(120,134,2);
    }

    function drawAll() {
        secondDate = minuteDate = new Date();
        // draw seconds
        g.setColor(1,1,1);
        for (let i=0;i<60;i++)
            seconds(360*i/60, 100);
        onSecond();
    }

    return {init:drawAll, tick:onSecond};
 }

return getFace;

})();
