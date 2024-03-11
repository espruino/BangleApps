const settings = require("Storage").readJSON("followtherecipe.json");
//const locale = require('locale');
var W = g.getWidth(), H = g.getHeight();
var screen = 0;

let maxLenghtHorizontal = 16;
let maxLenghtvertical = 6;

let uri = "https://www.themealdb.com/api/json/v1/1/random.php";

var colors = {0: "#70f", 1:"#70d", 2: "#70g", 3: "#20f", 4: "#30f"};

var screens = [];

function drawData(name, value, y){
  g.drawString(name, 10, y);
  g.drawString(value, 100, y);
}

function drawInfo() {
  g.reset().clearRect(Bangle.appRect);
  var h=18, y = h;

  // Header
  g.drawLine(0,25,W,25);
  g.drawLine(0,26,W,26);

  // Info body depending on screen
  g.setFont("Vector",15).setFontAlign(-1,-1).setColor("#0ff");
  screens[screen].items.forEach(function (item, index){
    g.setColor(colors[index]);
    drawData(item.name, item.fun, y+=h);
  });

  // Bottom
  g.setColor(g.theme.fg);
  g.drawLine(0,H-h-3,W,H-h-3);
  g.drawLine(0,H-h-2,W,H-h-2);
  g.setFont("Vector",h-2).setFontAlign(-1,-1);
  g.drawString(screens[screen].name, 2, H-h+2);
  g.setFont("Vector",h-2).setFontAlign(1,-1);
  g.drawString((screen+1) + "/" + screens.length, W, H-h+2);
}

// Change page if user touch the left or the right of the screen
Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){
    screen = (screen + 1) % screens.length;
  }

  if(isLeft){
    screen -= 1;
    screen = screen < 0 ? screens.length-1 : screen;
  }

  Bangle.buzz(40, 0.6);
  drawInfo();
});

function infoIngredients(ingredients, measures){
  let combinedList = [];
  let listOfString = [];
  let lineBreaks = 0;

  // Iterate through the arrays and combine the ingredients and measures
  for (let i = 0; i < ingredients.length; i++) {
    const combinedString = `${ingredients[i]}: ${measures[i]}`;
    lineBreaks += 1;
    // Check if the line is more than 16 characters
    if (combinedString.length > maxLenghtHorizontal) {
      // Add line break and update lineBreaks counter
      combinedList.push(`${ingredients[i]}:\n${measures[i]}`);
      lineBreaks += 1;
    } else {
      // Add to the combinedList array
      combinedList.push(combinedString);
    }
    
    // Check the total line breaks
    if (lineBreaks >= maxLenghtvertical) {
      const resultString = combinedList.join('\n');
      listOfString.push(resultString);
      combinedList = [];
      lineBreaks = 0;
    }
    if(i == ingredients.length){
      listOfString.push(combinedList.join('\n'));
    }
  }
  
  for(let i = 0; i < listOfString.length; i++){
    let screen = {
    name: "Ingredients",
    items: [
      {name: listOfString[i], fun:  ""},
    ]
    };
    screens.push(screen);
  }
}

// Format instructions to display on screen
function infoInstructions(instructionsString){
  let item = [];
  let chunkSize = 22;
  //remove all space line and other to avoid problem with text
  instructionsString = instructionsString.replace(/[\n\r]/g, '');
  
  for (let i = 0; i < instructionsString.length; i += chunkSize) {
    const chunk = instructionsString.substring(i, i + chunkSize).trim();
    item.push({ name: chunk, fun: "" });

    if (item.length === maxLenghtvertical) {
      let screen = {
        name: "Instructions",
        items: item,
      };
      screens.push(screen);
      item = [];
    }
  }

  if (item.length > 0) {
    let screen = {
      name: "Instructions",
      items: item,
    };
    screens.push(screen);
  }
}


// Get json format and parse it into Strings
function getRecipeData(data) {
  let mealName = data.strMeal;
  let category = data.strCategory;
  let area = data.strArea;
  let instructions = data.strInstructions;
  const ingredients = [];
  const measures = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = data["strIngredient" + i];
    const measure = data["strMeasure" + i];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(ingredient);
      if (measure && measure.trim() !== ""){
        measures.push(measure);
      }else{
        measures.push("¯\\_(ツ)_/¯");
      }
    } else { // If no more ingredients are found
      screens = [
        {
          name: "General",
          items: [
            {name: mealName, fun:  ""},
            {name: "", fun:  ""},
            {name: "Category", fun:  category},
            {name: "", fun:  ""},
            {name: "Area: ", fun:  area},
          ]
        }
      ];
      infoIngredients(ingredients, measures);
      infoInstructions(instructions);
      drawInfo();
      break;
    }
  }
}

function jsonData(){
  let json = '{"meals":[{"idMeal":"52771","strMeal":"Spicy Arrabiata Penne","strDrinkAlternate":null,"strCategory":"Vegetarian","strArea":"Italian","strInstructions":"Bring a large pot of water to a boil. Add kosher salt to the boiling water, then add the pasta. Cook according to the package instructions, about 9 minutes.\\r\\nIn a large skillet over medium-high heat, add the olive oil and heat until the oil starts to shimmer. Add the garlic and cook, stirring, until fragrant, 1 to 2 minutes. Add the chopped tomatoes, red chile flakes, Italian seasoning and salt and pepper to taste. Bring to a boil and cook for 5 minutes. Remove from the heat and add the chopped basil.\\r\\nDrain the pasta and add it to the sauce. Garnish with Parmigiano-Reggiano flakes and more basil and serve warm.","strMealThumb":"https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg","strTags":"Pasta,Curry","strYoutube":"https://www.youtube.com/watch?v=1IszT_guI08","strIngredient1":"penne rigate","strIngredient2":"olive oil","strIngredient3":"garlic","strIngredient4":"chopped tomatoes","strIngredient5":"red chile flakes","strIngredient6":"italian seasoning","strIngredient7":"basil","strIngredient8":"Parmigiano-Reggiano","strIngredient9":"","strIngredient10":"","strIngredient11":"","strIngredient12":"","strIngredient13":"","strIngredient14":"","strIngredient15":"","strIngredient16":null,"strIngredient17":null,"strIngredient18":null,"strIngredient19":null,"strIngredient20":null,"strMeasure1":"1 pound","strMeasure2":"1/4 cup","strMeasure3":"3 cloves","strMeasure4":"1 tin ","strMeasure5":"1/2 teaspoon","strMeasure6":"1/2 teaspoon","strMeasure7":"6 leaves","strMeasure8":"spinkling","strMeasure9":"","strMeasure10":"","strMeasure11":"","strMeasure12":"","strMeasure13":"","strMeasure14":"","strMeasure15":"","strMeasure16":null,"strMeasure17":null,"strMeasure18":null,"strMeasure19":null,"strMeasure20":null,"strSource":null,"strImageSource":null,"strCreativeCommonsConfirmed":null,"dateModified":null}]}';
  if(settings != null){
    json = JSON.stringify({ meals: [settings] });
  }
  const obj = JSON.parse(json);

  getRecipeData(obj.meals[0]);
}

function initData(retryCount) {
  if (!Bangle.http) {
    console.log("No http method found");
    jsonData();
    return;
  }
  jsonData();
  Bangle.http(uri, { timeout: 1000 })
    .then(event => {
      try {
        const obj = JSON.parse(event.resp);

        if (obj.meals && obj.meals.length > 0) {
          getRecipeData(obj.meals[0]);
        } else {
          console.log("Invalid JSON structure: meals array is missing or empty");
        }
      } catch (error) {
        console.log("JSON Parse Error: " + error.message);
      }
    })
    .catch(e => {
      console.log("Request Error:", e);
      if (e === "Timeout" && retryCount > 0) {
        setTimeout(() => initData(retryCount - 1), 1000); // Optional: Add a delay before retrying
      }else{
        jsonData();
      }
    });
}

initData(3);


Bangle.on('lock', function(isLocked) {
  drawInfo();
});

Bangle.loadWidgets();
Bangle.drawWidgets();