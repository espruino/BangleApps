const width = g.getWidth();
const height = g.getHeight();

const successEmoji = "v";
const failEmoji = "x";



function testDecorators() {
  app.decorators.forEach((decorator) => {
    console.log(`Testing decorator: ${decorator.name}`);

    if (decorator.tests == undefined) {
      return;
    }

    if (decorator.tests.length == 0) {
      return;
    }

    decorator.tests.forEach((test) => {
      result = decorator.validator(test.hours, test.minutes);

      const success = (result == test.expected) ? successEmoji : failEmoji;
      console.log(
        `[${success}] - Inputs: ${test.hours}:${test.minutes}, Expected: ${test.expected}, Received: ${result}`
      );
    });
  });
}

const app = {
  decorators: [
    {
      "name": "SAMESIES",
      "color": "#0000FF",
      "validator": (hours, minutes) => {
        return hours == minutes;
      },
      "tests": [
        {
          "hours": "12",
          "minutes": "12",
          "expected": true
        },
        {
          "hours": "10",
          "minutes": "11",
          "expected": false
        }
      ]
    },
    {
      "name": "FOUR_OF_A_KIND",
      "color": "#0000FF",
      "validator": (hours, minutes) => {
        const str = hours + minutes;

        if (str.length === 0) return false;

        const firstChar = str[0];
        return str.split("").every((char) => char === firstChar);
      },
      "tests": [
        {
          "hours": "11",
          "minutes": "11",
          "expected": true
        },
        {
          "hours": "10",
          "minutes": "11",
          "expected": false
        }
      ]
    },
    {
      "name": "TWO_PAIRS",
      "color": "#0000FF",
      "validator": (hours, minutes) => {
        var firstChar = hours[0];
        const hoursSameChar = hours.split("").every((char) => char === firstChar);

        var firstChar = minutes[0];
        const minutesSameChar = minutes.split("").every((char) => char === firstChar);

        return hoursSameChar && minutesSameChar;
      },
      "tests": [
        {
          "hours": "00",
          "minutes": "11",
          "expected": true
        },
        {
          "hours": "10",
          "minutes": "11",
          "expected": false
        }
      ]
    },
    {
      "name": "PALINDROM",
      "color": "#0000FF",
      "validator": (hours, minutes) => {
        const str = hours + minutes;
        const reversed = str.split("").reverse().join("");

        return str == reversed;
      },
      "tests": [
        {
          "hours": "12",
          "minutes": "21",
          "expected": true
        },
        {
          "hours": "12",
          "minutes": "22",
          "expected": false
        }
      ]
    },
    {
      "name": "SYMETRIC",
      "color": "#0000FF",
      "validator": (hours, minutes) => {
        symetrics = {
          "1": "1",
          "2": "5",
          "5": "2",
          "6": "6",
          "8": "8",
          "9": "6",
        };

        let canPalindrom = true;
        const hoursPalindrom =hours.split("").map((char)=>{
          if (symetrics[char]== undefined){
            canPalindrom=false;
            return;
          }

          return symetrics[char];
        }).join("");

        if (!canPalindrom){
          return false;
        }

        return hoursPalindrom==minutes;
      },
      "tests": [
        {
          "hours": "22",
          "minutes": "55",
          "expected": true
        },
        {
          "hours": "22",
          "minutes": "11",
          "expected": false
        }
      ]
    },
    {
      "name": "MISC",
      "color": "#0000FF",
      "validator": (hours, minutes) => {
        times = [
          "1337",
          "1234",
          "2345",
        ];
        return times.indexOf(hours + minutes) != -1;
      }
    }
  ],
  init: function () {
    this.drawTime();
  },

  testDecorators: function () {

  },
  drawTime: function () {
    g.clear();

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    g.setColor("#000000");

    this.decorators.forEach((item) => {
      if (item.validator(hours, minutes)) {
        g.setColor(item.color);
      }
    });

    // Set font size - make it as big as possible
    // Use half the screen height for each line (minus a small gap)
    const fontSize = Math.floor(height / 2) - 4;

    // Draw hours (top half of screen)
    g.setFontAlign(0, 0); // center horizontally and vertically
    g.setFont("Vector", fontSize);
    g.drawString(hours, width / 2, height / 4);

    // Draw minutes (bottom half of screen)
    g.drawString(minutes, width / 2, (height * 3) / 4);


    // Force screen refresh
    g.flip();

    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(() => {
      drawTimeout = undefined;
      this.drawTime();
    }, 60000 - (Date.now() % 60000));
  }
};

let drawTimeout;
app.init();

// testDecorators();

