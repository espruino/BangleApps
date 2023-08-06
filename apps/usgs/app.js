var loc = '03272100'; // Configurable location
var keys = ['Gage', 'Discharge', 'Temperature']; // Configurable values
var shortenedName = {"Gage":"Ga","Discharge":"Dis","Temperature":"Temp"};
var dataStreams = {}; // Will hold directions to Datastreams and units, with above keys
//var http = require("http");
function fetchStartup() {
	/*http.get(
  "https://labs.waterdata.usgs.gov/sta/v1.1/Things('USGS-" +
    loc +
    "')/Datastreams?$expand=Observations($orderby=phenomenonTime%20desc;$top=1;$select=result)&$select=unitOfMeasurement,description"
).then(d => handleStartup(d.json().value));
*/
  handleStartup(JSON.parse(`{"value":[{"unitOfMeasurement":{"name":"V","symbol":"V","definition":""},"description":"DCP battery voltage / USGS-03272100-1964fee2501b43c5b7b807b687319588","Observations":[{"result":"13.4"}],"Observations@iot.nextLink":"https://labs.waterdata.usgs.gov/sta/v1.1/Datastreams('1964fee2501b43c5b7b807b687319588')/Observations?$top=1&$skip=1&$select=result&$orderby=phenomenonTime+desc,%40iot.id+asc"},{"unitOfMeasurement":{"name":"Cubic Feet per Second","symbol":"ft^3/s","definition":""},"description":"Discharge / USGS-03272100-1db72201226e4f50a94d0b65abc8e7a5","Observations":[{"result":"692"}],"Observations@iot.nextLink":"https://labs.waterdata.usgs.gov/sta/v1.1/Datastreams('1db72201226e4f50a94d0b65abc8e7a5')/Observations?$top=1&$skip=1&$select=result&$orderby=phenomenonTime+desc,%40iot.id+asc"},{"unitOfMeasurement":{"name":"Feet","symbol":"ft","definition":""},"description":"Gage height / USGS-03272100-56a7245f4b47438cb79c40f0d00605ba","Observations":[{"result":"1.94"}],"Observations@iot.nextLink":"https://labs.waterdata.usgs.gov/sta/v1.1/Datastreams('56a7245f4b47438cb79c40f0d00605ba')/Observations?$top=1&$skip=1&$select=result&$orderby=phenomenonTime+desc,%40iot.id+asc"},{"unitOfMeasurement":{"name":"Degrees Centigrade","symbol":"degC","definition":""},"description":"Temperature, water / USGS-03272100-f8e8a724a5c3498ca11bf1a31be5a537","Observations":[{"result":"26.2"}],"Observations@iot.nextLink":"https://labs.waterdata.usgs.gov/sta/v1.1/Datastreams('f8e8a724a5c3498ca11bf1a31be5a537')/Observations?$top=1&$skip=1&$select=result&$orderby=phenomenonTime+desc,%40iot.id+asc"}]}`).value);
}
function handleStartup(data) {
  for (var key1 in data) {
    desc = data[key1].description;
    for (var key2 in keys) {
      if (desc.indexOf(keys[key2]) != -1) {
        if (data[key1].unitOfMeasurement.symbol === "degC") {
          symbol = "F";
          result = (data[key1].Observations[0].result * 9 / 5) + 32;
        } else {
          symbol = data[key1].unitOfMeasurement.symbol;
          result = data[key1].Observations[0].result;
        }
        dataStreams[keys[key2]] = JSON.parse(
          '{"unit":"' +
            symbol +
            '","value":"' +
            result +
            '"}'
        );
      }
    }
  }
}

function displayData() {
  num = keys.length;
  width  = g.getWidth()/(2);
  height = g.getHeight()/(num);
  g.clear();
  g.setFont("Vector",20);
  g.setFontAlign(0,0);
  string = "";
  for (var key in keys) {
    unit = dataStreams[keys[key]].unit;
    value = dataStreams[keys[key]].value;
    if (shortenedName[keys[key]]) {
      name = shortenedName[keys[key]];
    } else {
      name = keys[key];
    }
    string += name+": "+value+" "+unit+"\n";
    //g.drawString(name+": "+value+" "+unit, width, height*key+10);
    }
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  // Format the time as a string
  var timeString = hours.toString().padStart(2, "0") + ":" +
                   minutes.toString().padStart(2, "0");
  E.showMessage(string,"Data");
}


// On startup, grab specific datastream values
//fetchStartup().then(data => handleStartup(data));
fetchStartup();

//toDo Schedule runs?
//toDo update values

displayData();

setWatch(() => {
  fetchStartup();
  displayData();
}, BTN1, {repeat:true});
