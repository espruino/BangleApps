var Layout = require("Layout");
var mainmenu = {
  "" : { title : "Main Menu" }, // options
  "Metric to Imperial" : function() { E.showMenu(MetricToImperial); activateBackButton();},
  "Imperial to Metric" : function() { E.showMenu(ImperialToMetric); activateBackButton();}
};
//Example Equation: 50 F to C would be written as 5/9(E - 32)
//The E is the number that is inserted
function activateBackButton()
{
    setWatch(function() {E.showMenu(mainmenu);}, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat:false, edge:"falling"});
}
var MetricToImperial = {
  "" : { title : "Select Type", },
  "Weight" : function() { E.showMenu(MetricToImperialWeight); activateBackButton();},
  "Distance" : function() { E.showMenu(MetricToImperialDistance); activateBackButton();},
  "Temperature" : function() { E.showMenu(MetricToImperialTemp); activateBackButton();},
  "Liquid" : function() { E.showMenu(MetricToImperialLiquid); activateBackButton();},
};
var MetricToImperialDistance = {
  "" : { title : "Select Measurement", },
  "MM-IN" : () => { convertAndPrint("E/25.4", "IN");},
  "CM-IN" : () => { convertAndPrint("E/2.54", "IN");},
  "M-FT" : () => { convertAndPrint("3.2808399*E", "FT");},
  "KM-MI" : () => { convertAndPrint("E/1.609344", "MI");}
};
var MetricToImperialWeight = {
  "" : { title : "Select Measurement", },
  "MG-OZ" : () => { convertAndPrint("E/28349.5231", "OZ");},
  "KG-LB" : () => { convertAndPrint("E*2.20462262", "LB");},
  "MT-US Ton" : () => { convertAndPrint("E*1.1023109950010197", "US TON");},
  "G-OZ" : () => { convertAndPrint("E/28.3495231", "OZ");}
};
var MetricToImperialLiquid = {
  "" : { title : "Select Measurement", },
  "ML-FL OZ" : () => { convertAndPrint("E/29.5735295", "FL OZ");},
  "ML-PT" : () => { convertAndPrint("E*0.002113", "PT");},
  "L-QT" : () => { convertAndPrint("E*1.056688", "QT");},
  "L-GAL" : () => { convertAndPrint("E*0.2641720524", "GAL");},
  "ML-C" : () => { convertAndPrint("E/236.588236", "C");}
};
var MetricToImperialTemp = {
  "" : { title : "Select Measurement", },
  "C-F" : () => { convertAndPrint("(E*1.8)+32", "F");},
  "K-F" : () => { convertAndPrint("((E-273.15)*1.8)+32", "F");}
};
var ImperialToMetric = {
  "" : { title : "Select Type", },
  "Weight" : function() { E.showMenu(ImperialToMetricWeight); activateBackButton();},
  "Distance" : function() { E.showMenu(ImperialToMetricDistance); activateBackButton();},
  "Temperature" : function() { E.showMenu(ImperialToMetricTemp); activateBackButton();},
  "Liquid" : function() { E.showMenu(ImperialToMetricLiquid); activateBackButton();},
};
var ImperialToMetricDistance = {
  "" : { title : "Select Measurement", },
  "IN-MM" : () => { convertAndPrint("E*25.4", "MM");},
  "IN-CM" : () => { convertAndPrint("E*2.54", "MM");},
  "FT-M" : () => { convertAndPrint("E/3.2808399", "M");},
  "MI-KM" : () => { convertAndPrint("E*1.609344", "KM");}
};
var ImperialToMetricWeight = {
  "" : { title : "Select Measurement", },
  "OZ-MG" : () => { convertAndPrint("E*28349.5231", "MG");},
  "LB-KG" : () => { convertAndPrint("E/2.20462262", "KG");},
  "US Ton-MT" : () => { convertAndPrint("E/1.1023109950010197", "MT");},
  "OZ-G" : () => { convertAndPrint("E*28.3495231", "G");}
};
var ImperialToMetricLiquid = {
  "" : { title : "Select Measurement", },
  "FL OZ-ML" : () => { convertAndPrint("E*29.5735295", "ML");},
  "PT-ML" : () => { convertAndPrint("E/0.002113", "ML");},
  "QT-L" : () => { convertAndPrint("E/1.056688", "L");},
  "GAL-L" : () => { convertAndPrint("E/0.2641720524", "L");},
  "C-ML" : () => { convertAndPrint("E*236.588236", "ML");}
};
var ImperialToMetricTemp = {
  "" : { title : "Select Measurement", },
  "F-C" : () => { convertAndPrint("(E-32)/1.8", "C");},
  "F-K" : () => { convertAndPrint("((E-32)/1.8)+273.15", "K");}
};
E.showMenu(mainmenu);
function convertAndPrint(equation, endText)
{
  E.showMenu();
  g.clear();
  showNumpad().then((number) => {
    g.clear();
    equation = equation.replace("E", number);
    var textToWrite = "";
    var layout = new Layout({});
    if (equation.includes("."))
    {
      console.log(eval(equation).toString().split(".")[1].length);
      if(eval(equation).toString().split(".")[1].length < 3)
      {
        console.log("decimal but no need for round");
        textToWrite = eval(equation);
        textToWrite = textToWrite + " " + endText;
        layout = new Layout({
        type: "txt",
        font: "Vector:20",
        label: textToWrite
        });
        layout.render();
      }
      else
      {
        console.log("decimal rounded");
        textToWrite = Math.round(eval(equation) * 1000) / 1000;
        textToWrite = "ABT " + textToWrite + " " + endText;
        layout = new Layout({
        type: "txt",
        font: "Vector:20",
        label: textToWrite
        });
        layout.render();
      }
    }
    else
    {
        console.log("no decimal");
        textToWrite = eval(equation);
        textToWrite = textToWrite + " " + endText;
        layout = new Layout({
        type: "txt",
        font: "Vector:20",
        label: textToWrite
        });
        layout.render();
    }
  activateBackButton();
  });

}
function showNumpad() {
  return new Promise((resolve, reject) => {
    let number = '';
    E.showMenu();
    function addDigit(digit) {
      if(digit == "." && !number.includes("."))
      {
          number += digit;
          Bangle.buzz(20);
          update();
      }
      else if(digit != ".")
      {
          number += digit;
          Bangle.buzz(20);
          update();
      }
      else
      {
        console.log("Already includes .");
      }
    }
    function removeDigit() {
      number = number.slice(0, -1);
      Bangle.buzz(20);
      update();
    }
    function update() {
      g.reset();
      g.clearRect(0,0,g.getWidth(),23);
      g.setFont("Vector:24").setFontAlign(1,0).drawString(number, g.getWidth(),12);
      console.log(number.length);
      if(number.length > 0){setWatch(function() {resolve(number);}, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat:false, edge:"falling"});}
    }
    const ds="12%";
    const digitBtn = (digit) => ({type:"btn", font:ds, width:58, label:digit, cb:l=>{addDigit(digit);}});
    var numPad = new Layout ({
      type:"v", c: [{
        type:"v", c: [
          {type:"", height:24},
          {type:"h",filly:1, c: [digitBtn("1"), digitBtn("2"), digitBtn("3")]},
          {type:"h",filly:1, c: [digitBtn("4"), digitBtn("5"), digitBtn("6")]},
          {type:"h",filly:1, c: [digitBtn("7"), digitBtn("8"), digitBtn("9")]},
          {type:"h",filly:1, c: [
              {type:"btn", font:ds, width:58, label:"<", cb: removeDigit},
              digitBtn('0'),
              {type:"btn", font:ds, width:58, id:".", label:".", cb: l => addDigit(".")}
            ]}
        ]}
      ], lazy:true});
    g.clear();
    numPad.render();
    update();
    
  });
}
