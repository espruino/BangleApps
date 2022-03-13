Bangle.loadWidgets();
Bangle.drawWidgets();

// Const
let TODOLIST_FILE = "todolist.json";
let MAX_DESCRIPTION_LEN = 14;

// Clear todolist file
// require("Storage").erase(TODOLIST_FILE);

let DEFAULT_TODOLIST = [
  {
    name: "Pro",
    children: [
      {
        name: "Read doc",
        done: true,
        children: [],
      },
    ],
  },
  {
    name: "Pers",
    children: [
      {
        name: "Grocery",
        children: [
          { name: "Milk", done: false, children: [] },
          { name: "Eggs", done: false, children: [] },
          { name: "Cheese", done: false, children: [] },
        ],
      },
      { name: "Workout", done: false, children: [] },
      { name: "Learn Rust", done: false, children: [] },
    ],
  },
];

// Load todolist
let todolist =
  require("Storage").readJSON(TODOLIST_FILE, true) || DEFAULT_TODOLIST;
let menus = {};

function writeData() {
  require("Storage").writeJSON(TODOLIST_FILE, todolist);
}

function getChild(todolist, indexes) {
  let childData = todolist;
  for (let i = 0; i < indexes.length; i++) {
    childData = childData[indexes[i]];
    childData = childData.children;
  }

  return childData;
}

function getName(item) {
  let title = item.name.substr(0, MAX_DESCRIPTION_LEN);
  return title;
}
function getParentTitle(todolist, indexes) {
  let parentIndexes = indexes.slice(0, indexes.length - 1);
  let lastIndex = indexes[indexes.length - 1];
  let item = getItem(todolist, parentIndexes, lastIndex);
  return getName(item);
}

function getItem(todolist, parentIndexes, index) {
  let childData = getChild(todolist, parentIndexes, index);
  return childData[index];
}

function toggleableStatus(todolist, indexes, index) {
  const reminder = getItem(todolist, indexes, index);
  return {
    value: !!reminder.done, // !! converts undefined to false
    format: (val) => (val ? "[X]" : "[-]"),
    onchange: (val) => {
      reminder.done = val;
      writeData();
    },
  };
}

function showSubMenu(key) {
  const sub_menu = menus[key];
  return E.showMenu(sub_menu);
}

function createListItem(todolist, indexes, index) {
  let reminder = getItem(todolist, indexes, index);
  if (reminder.children.length > 0) {
    let childIndexes = [];
    for (let i = 0; i < indexes.length; i++) {
      childIndexes.push(indexes[i]);
    }
    childIndexes.push(index);
    createMenus(todolist, childIndexes);
    return () => showSubMenu(childIndexes);
  } else {
    return toggleableStatus(todolist, indexes, index);
  }
}

function showMainMenu() {
  const mainmenu = menus[""];
  return E.showMenu(mainmenu);
}

function createMenus(todolist, indexes) {
  const menuItem = {};
  if (indexes.length == 0) {
    menuItem[""] = { title: "todolist" };
  } else {
    menuItem[""] = { title: getParentTitle(todolist, indexes) };
    menuItem["< Back"] = () =>
      showSubMenu(indexes.slice(0, indexes.length - 1));
  }
  for (let i = 0; i < getChild(todolist, indexes).length; i++) {
    const item = getItem(todolist, indexes, i);
    const name = getName(item);
    menuItem[name] = createListItem(todolist, indexes, i);
  }
  menus[indexes] = menuItem;
}

createMenus(todolist, []);
showMainMenu();
