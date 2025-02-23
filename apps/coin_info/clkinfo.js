(function() {

    function retrieveClkInfo(strToken) {
        // TODO: do something useful here -> http request to CMC
        return {
            text : strToken,
            // color: "#f00",
            img : atob("GBiBAAAAAAAAAAAAAAAYAAA8AAB+AAD/AAAAAAAAAAAAAAAYAAAYAAQYIA4AcAYAYAA8AAB+AAD/AAH/gD///D///AAAAAAAAAAAAA==")
        }
    }

    function showClkInfo() {
        this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
                this.emit("redraw");
            }, 60000);
        }, 60000 - (Date.now() % 60000));
    }

    function hideClkInfo() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    var coinInfoItems = {
        name: "CoinInfo",
        // TODO: get maybe from settings
        items: [
            {
                name: "BTC",
                get : retrieveClkInfo("BTC"),
                show : showClkInfo,
                hide : hideClkInfo
            },
        ]
    };

    return coinInfoItems;
})
