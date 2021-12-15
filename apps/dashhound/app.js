showOpeningPage = () => {
  title = "Dash Hound"
  author = "Andy OC"
  iconProvider = "Icon8"
  E.showMessage(`App by ${author}\nImgs by ${iconProvider}`, title);
  g.drawImage(require("Storage").read("dashhound.img"), 100, 50)
}

showOpeningPage()
