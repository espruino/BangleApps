exports.getCmCQuoteLatest = function(apiKey, slug) {
    // Bangle.http("https://pur3.co.uk/hello.txt").then(data=>{
    //     console.log("Got ",data);
    //     // actual response is in data.resp
    // });
    // -------------
    // Prints:
    //Got  {
    //  "t": "http",
    //  "id": "89875941444",
    //  "resp": "Hello World!\n"
    // }

    const url = `https://pro-api.coinmarketcap.com//v2/cryptocurrency/quotes/latest?slug=${slug}`;
    return Bangle.http(url, {
        method: 'GET',
        headers: {
            'CMC_PRO_API_KEY': apiKey
        }
    }).then(data => data.resp);
}
