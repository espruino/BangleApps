var dataStreams = {}; // Will hold directions to Datastreams and units, with above keys
var FILE = "usgs.json";
  // Load settings
  var settings = Object.assign({
    loc: '03272100',
    keys: {'Gage height': true, 'Discharge': true, 'Temperature, water': true},
    shortenedName: {"Gage height":"Ga","Discharge":"Dis","Temperature, water":"Temp"},
    tempUnitF: true,
  }, require('Storage').readJSON(FILE, true) || {});
function fetchStartup() {
  const uri = "https://labs.waterdata.usgs.gov/sta/v1.1/Things('USGS-" +
    settings.loc +
    "')/Datastreams?$expand=Observations($orderby=phenomenonTime%20desc;$top=1;$select=result)&$select=unitOfMeasurement,description";
  if (Bangle.http) {
    Bangle.http(uri, {timeout:10000}).then(d => handleStartup(JSON.parse(d.resp).value));
  }
}
function handleStartup(data) {
  for (var key1 in data) {
    const desc = data[key1].description.split(" / ")[0];
    if (settings.keys[desc]) {
      let symbol;
      let result;
      if (data[key1].unitOfMeasurement.symbol === "degC" && settings.tempUnitF) {
        symbol = "F";
        result = (data[key1].Observations[0].result * 9 / 5) + 32;
      } else {
        symbol = data[key1].unitOfMeasurement.symbol;
        result = data[key1].Observations[0].result;
      }
      dataStreams[desc] = JSON.parse(
          '{"unit":"' +
            symbol +
            '","value":"' +
            result +
            '"}'
        );
    }
  }
  displayData(dataStreams);
}

function displayData(dataStreams) {
  g.clear();
  g.setFont("Vector",20);
  g.setFontAlign(0,0);
  let string = "";
  for (var key in dataStreams) {
    const unit = dataStreams[key].unit;
    const value = dataStreams[key].value;
    let name;
    if (settings.shortenedName[key]) {
      name = settings.shortenedName[key];
    } else {
      name = key;
    }
    string += name+": "+value+" "+unit+"\n";
    }
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  // Format the time as a string
  var timeString = hours.toString().padStart(2, "0") + ":" +
                   minutes.toString().padStart(2, "0") + ":" +
                   seconds.toString().padStart(2,"0");
  E.showMessage(string,timeString);
}
function handleButton() {
  switch(nPress) {
    case 1:
      fetchStartup();
      break;
    case 2:
      Bangle.showLauncher();
      break;
    default:
      Bangle.buzz(50);
  }
  nPress=0;
}

fetchStartup();

nPress = 0;
tPress = 0;

setWatch(() => {
    nPress++;
    clearTimeout(tPress);
    tPress = setTimeout(() => {handleButton();}, 500);
  }, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat: true, edge: "rising"});
