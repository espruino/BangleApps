import appConfig = require("./app-config");

interface GpsData {
    text: string;
    img: string;
}

interface Item {
    name: string;
    get: () => GpsData;
    show: () => void;
    hide: () => void;
    hasRange?: boolean;
}

interface GpsResult {
    lat: number;
    lon: number;
}

interface Result {
    name: string;
    items: Item[];
}

(function() {
    let totalIntervalInMillis: number = appConfig.default.refreshPeriodSec;

    function format(x: number): string {
        const d = Math.floor(x);
        let m = x - d;
        m = m * 60;
        return "" + d + " " + m.toFixed(3) + "'";
    }

    function getPosition () : GpsResult {
        let result: GpsResult = { lat: 0, lon: 0 } as GpsResult;
        if (Bangle.isGPSOn()) {
            result = Bangle.getGPSFix();
        }
        return result;
    }

    function show(this: { interval?: number; emit: (event: string) => void }) {
        this.interval = setTimeout(() => {
            this.emit("redraw");
            this.interval = setInterval(() => {
                this.emit("redraw");
            }, totalIntervalInMillis);
        }, totalIntervalInMillis - (Date.now() % totalIntervalInMillis));
    }

    function hide(this: { interval?: number }) {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    return {
        name: "Bangle",
        items: [
            {
                name: "GPS-Data",
                get: () => {
                    const position: GpsResult = getPosition();
                    const strPosition: string = format(position.lat)
                    return {
                        text: `lat: ${strPosition}`,
                        img: atob("GBiBAAAAAAAAAAAAAAAYAAA8AAB+AAD/AAAAAAAAAAAAAAAYAAAYAAQYIA4AcAYAYAA8AAB+AAD/AAH/gD///D///AAAAAAAAAAAAA==")
                    };
                },
                show: show,
                hide: hide
            },
        ]
    } as Result;
})();
