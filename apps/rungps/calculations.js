window.calculations = {
    "translateData": function (text) {
        var points = []
        for (var line of text.split("\n")) {
            var all = line.split(", ");
            if (all.length === 7) {
                let [time_seconds, lat, lon, alt, speed, course, heart_rate] = all;
                points.push({lat: parseFloat(lat), long: parseFloat(lon), time: time_seconds, heart_rate: heart_rate, speed: speed, alt: alt});
            }
        }
        return points;
    },
    "deg2rad": function (deg) {
        return deg * (Math.PI/180);
    },
    "getDistanceFromLatLonInKm": function (lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        var dLat = window.calculations.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = window.calculations.deg2rad(lon2-lon1);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(window.calculations.deg2rad(lat1)) * Math.cos(window.calculations.deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    "getAverageSpeedAndDistance": function (points) {
        var timeDifference = points[points.length-1].time - points[0].time;
        var distance = 0;
        var vorig = points[0];
        for (let i = 1; i < points.length; i++) {
            distance += window.calculations.getDistanceFromLatLonInKm(vorig.lat, vorig.long, points[i].lat, points[i].long);
            vorig = points[i]
        }
        distance = Math.floor(distance*100)/100;
        var speed = Math.floor(timeDifference/distance)
        return [Math.floor(speed/60)+":"+Math.floor(speed % 60)+"min/km", distance.toString()+"km"];
    },
    "convertSecondstoTime": function (given_seconds) {
        let dateObj = new Date(given_seconds * 1000);
        let hours = dateObj.getUTCHours();
        let minutes = dateObj.getUTCMinutes();
        let seconds = dateObj.getSeconds();

        return hours.toString().padStart(2, '0')
            + ':' + minutes.toString().padStart(2, '0')
            + ':' + seconds.toString().padStart(2, '0');
    },
    "getIndexByTime": function (time, points) {
        for (let i = 0; i < points.length; i++) {
            if (window.calculations.convertSecondstoTime(points[i].time) === time) {
                return i;
            }
        }
        return -1;
    }
}
