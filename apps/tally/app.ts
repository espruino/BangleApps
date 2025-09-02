const storage = require("Storage");

type Tally = {
  date: Date,
  name: string,
};

function readTallies() {
  const tallies: Tally[] = [];
  const f = storage.open("tallies.csv", "r");
  let line;
  while ((line = f.readLine()) !== undefined) {
    const parts = line.replace("\n", "").split(",");
    tallies.push({ date: new Date(parts[0]), name: parts[1] });
  }
  return tallies;
}

function saveTallies(tallies: Tally[]) {
  const f = storage.open("tallies.csv", "w");
  for(const tally of tallies){
    f.write([tally.date.toISOString(), tally.name].join(",") + "\n");
  }
}

const dayEq = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();

function showTallies(tallies: Tally[]) {
  const menu: Menu = {
    "": { title: "Tallies" },
    "< Back": () => load(),
  };

  const today = new Date;
  let day: undefined | Date;

  tallies.forEach((tally, i) => {
    const td = tally.date;
    if(!dayEq(day ?? today, td)){
      const s = `${td.getFullYear()}-${pad2(td.getMonth() + 1)}-${pad2(td.getDate())}`;
      menu[s] = () => {};
      day = td;
    }

    menu[`${tfmt(tally)}: ${tally.name}`] = () => editTally(tallies, i);
  });

  E.showMenu(menu);
}

function editTally(tallies: Tally[], i: number) {
  const tally = tallies[i]!;

  const onback = () => {
    saveTallies(tallies);
    E.removeListener("kill", onback);
  };
  E.on("kill", onback);

  const menu: Menu = {
    "": { title: `Edit ${tally.name}` },
    "< Back": () => {
      onback();
      showTallies(tallies)
    },
    "Name": {
      value: tally.name,
      onchange: () => {
        setTimeout(() => {
          require("textinput")
            .input({ text: tally.name })
            .then(text => {
              if (text) {
                tally.name = text;
              }
              editTally(tallies, i);
            });
        }, 0);
      },
    },
    "Time": {
      value: tally.date.getTime(),
      format: (_tm: number) => tfmt(tally),
      onchange: (v: number) => {
        tally.date = new Date(v);
      },
      step: 60000, // 1 min
    },
    "Delete": () => {
      E.showPrompt(`Delete "${tally.name}"?`, {
        title: "Delete",
        buttons: { Yes: true, No: false },
      }).then(confirm => {
        if (confirm) {
          tallies.splice(i, 1);
          saveTallies(tallies);
          showTallies(tallies);
          return;
        }

        // need to regrab ui, can't `m.draw()`
        editTally(tallies, i);
      });
    },
  };

  E.showMenu(menu);
}

function tfmt(tally: Tally) {
  const d = tally.date;
  return `${d.getHours()}:${pad2(d.getMinutes())}`;
}

const pad2 = (s: number) => ("0" + s.toFixed(0)).slice(-2);

showTallies(readTallies());
