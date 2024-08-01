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

interface Result {
    name: string;
    items: Item[];
}

(function() {
    let totalIntervalInMillis: number = appConfig.default.refreshPeriodSec;

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
                    return {
                        text: "lat/lon",
                        img: atob("GBiBAAAAAAAAAAAAAAAYAAA8AAB+AAD/AAAAAAAAAAAAAAAYAAAYAAQYIA4AcAYAYAA8AAB+AAD/AAH/gD///D///AAAAAAAAAAAAA==")
                    };
                },
                show: show,
                hide: hide
            },
        ]
    } as Result;
})();
