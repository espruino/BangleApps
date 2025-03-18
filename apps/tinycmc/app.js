let settings = require("Storage").readJSON("tinycmc.json", 1);
const apiKey = settings.apikey || null;
const cmcBase = 'https://pro-api.coinmarketcap.com/';
const version = ['v1', 'v2'];
const path = {
  latest: '/cryptocurrency/listings/latest',
  quote: '/cryptocurrency/quotes/latest'
};
let page = 0;
function displayLatest(offset) {
  g.clear();
  if (page === 0) {
    E.showMessage('Getting Top 10');
  } else {
    E.showMessage(`Getting Top ${offset} to ${offset + 9}`);
  }

  const uri = offset ? `${cmcBase}${version[0]}${path.latest}?convert=EUR&limit=10&start=${offset}` : `${cmcBase}${version[0]}${path.latest}?convert=EUR&limit=10`;
  Bangle.http(uri,
    {
      method: 'GET',
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
      }
    }).then(data=>{
      const result = JSON.parse(data.resp).data;
    let menu = {
    "" : { title : "-- Select --" },
  };
    //FIXME: Menu can also take an array of items, this would be easier to compose using map
    result.forEach(listing => {
      menu[listing.name] = {
        title: `${listing.cmc_rank}: ${listing.symbol} ${Number(listing.quote.EUR.percent_change_24h).toFixed(3)}`,
        onchange: function() { E.showMenu(); displayQuote(listing.symbol);} };
    });
    menu.Next = function() {
      E.showMenu();
      g.clear();
      page = page + 1;
      displayLatest((page * 10) + 1);
    }; // remove the menu
    menu.Exit = function() {
      E.showMenu();
      g.clear();
      Bangle.showClock();
    }; // remove the menu
  g.clear();
    E.showMenu(menu);
  setWatch(() => {
    g.clear();
    displayMenu();
  }, BTN, {edge:"rising", debounce:50, repeat:true});
}).catch(error=>{
  console.log('Error');
  console.log(error);
  E.showMessage(`${error}\nTo go back press BTN`);
  setWatch(() => {
    g.clear();
    displayMenu();
    }, BTN, {edge:"rising", debounce:50, repeat:true});
  });
}

function displayQuote(symb) {
  g.clear();
  E.showMessage(`Getting latest for ${symb}`);
  Bangle.http(`${cmcBase}${version[1]}${path.quote}?symbol=${symb}&convert=EUR`,
    {
      method: 'GET',
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
      }
    }).then(data=>{
    g.clear();
      const result = JSON.parse(data.resp).data[symb][0];
  E.showMessage(`#${result.cmc_rank}: ${result.symbol}\n${Number(result.quote.EUR.price).toFixed(2)}\n%24h:
${result.quote.EUR.percent_change_24h}`);
  setWatch(() => {
    g.clear();
    displayMenu();
  }, BTN, {edge:"rising", debounce:50, repeat:true});
}).catch(error=>{
  E.showMessage(`${error}\nTo go back press BTN`);
  setWatch(() => {
    g.clear();
    displayMenu();
    }, BTN, {edge:"rising", debounce:50, repeat:true});
  });
}

function displayMenu() {
  if (!apiKey) {
    E.showMessage("Please provide a Coinmarketcap API Key");
  } else {
    // Actually display the menu
    E.showMenu({
      "" : { title : "-- Select --" }, // options
      "Latest": function() { E.showMenu(); displayLatest(); },
      "BTC" : function() { E.showMenu(); displayQuote('BTC'); },
      "ETH" : function() { E.showMenu(); displayQuote('ETH'); },
      "XMR" : function() { E.showMenu(); displayQuote('XMR'); },
      "ADA" : function() { E.showMenu(); displayQuote('ADA'); },
      "DOGE" : function() { E.showMenu(); displayQuote('DOGE'); },
      "LTC" : function() { E.showMenu(); displayQuote('LTC'); },
      "Exit" : function() {
        E.showMenu();
        g.clear();
        Bangle.showClock();
      }, // remove the menu
    });
  }
}

function main () {
  displayMenu();
}

main ();
