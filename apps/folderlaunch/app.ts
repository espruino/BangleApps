{
  const loader = require('folderlaunch-configLoad.js')
  const storage = require('Storage')

  const FOLDER_ICON = require("heatshrink").decompress(atob("mEwwMA///wAJCAoPAAongAonwAon4Aon8Aon+Aon/AooA/AH4A/AFgA="))

  let config: Config = loader.getConfig();

  let timeout: any;
  /**
   * If a timeout to return to the clock is set, reset it.
   */
  let resetTimeout = function () {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (config.timeout != 0) {
      timeout = setTimeout(() => {
        Bangle.showClock();
      }, config.timeout);
    }
  }

  let folderPath: Array<string> = [];
  /**
   * Get the folder at the provided path
   *
   * @param folderPath a path for the desired folder
   * @return the folder that was found
   */
  let getFolder = function (folderPath: Array<string>): Folder {
    let result: Folder = config.rootFolder;
    for (let folderName of folderPath)
      result = result.folders[folderName]!;
    nPages = Math.ceil((result.apps.length + Object.keys(result.folders).length) / (config.display.rows * config.display.rows));
    return result;
  }
  let folder: Folder = getFolder(folderPath);

  /**
   * Determine the font size needed to fit a string of the given length widthin maxWidth number of pixels, clamped between minSize and maxSize
   *
   * @param length the number of characters of the string
   * @param maxWidth the maximum allowable width
   * @param minSize the minimum acceptable font size
   * @param maxSize the maximum acceptable font size
   * @return the calculated font size
  */
  let getFontSize = function (length: number, maxWidth: number, minSize: number, maxSize: number): number {
    let size = Math.floor(maxWidth / length);  //Number of pixels of width available to character
    size *= (20 / 12);  //Convert to height, assuming 20 pixels of height for every 12 of width

    // Clamp to within range
    if (size < minSize) return minSize;
    else if (size > maxSize) return maxSize;
    else return Math.floor(size);
  }

  // grid[x][y] = id of app at column x row y, or undefined if no app displayed there
  let grid: Array<Array<GridEntry>> = [];
  for (let x = 0; x < config.display.rows; x++) {
    grid.push([]);
    for (let y = 0; y < config.display.rows; y++) {
      grid[x]!.push({
        type: 'empty',
        id: ''
      });
    }
  }
  let render = function () {
    let gridSize: number = config.display.rows * config.display.rows;
    let startIndex: number = page * gridSize; // Start at this position in the folders

    // Populate the grid
    for (let i = 0; i < gridSize; i++) {
      // Calculate coordinates
      let y = Math.floor(i / config.display.rows);
      let x = i % config.display.rows;

      // Try to place a folder
      let folderIndex = startIndex + i;
      let appIndex = folderIndex - Object.keys(folder.folders).length;
      if (folderIndex < Object.keys(folder.folders).length) {
        grid[x]![y]!.type = 'folder';
        grid[x]![y]!.id = Object.keys(folder.folders)[folderIndex];
      }

      // If that fails, try to place an app
      else if (appIndex < folder.apps.length) {
        grid[x]![y]!.type = 'app';
        grid[x]![y]!.id = folder.apps[appIndex]!;
      }

      // If that also fails, make the space empty
      else grid[x]![y]!.type = 'empty';
    }

    // Prepare to draw the grid
    let squareSize: number = (g.getHeight() - 24) / config.display.rows;
    if (!config.display.icon && !config.display.font) config.display.font = 12; // Fallback in case user disabled both icon and text
    g.clearRect(0, 24, g.getWidth(), g.getHeight())
      .reset()
      .setFontAlign(0, -1);

    // Actually draw the grid
    let empty = true; // Set to empty upon drawing something, so we can know whether to draw a nice message rather than leaving the screen completely blank
    for (let x = 0; x < config.display.rows; x++) {
      for (let y = 0; y < config.display.rows; y++) {
        let entry: GridEntry = grid[x]![y]!;
        let icon: string | ArrayBuffer;
        let text: string;
        let fontSize: number;

        // Get the icon and text, skip if the space is empty. Always draw text for folders even if disabled
        switch (entry.type) {
          case 'app': {
            let app = storage.readJSON(entry.id + '.info', false) as AppInfo;
            icon = storage.read(app.icon!)!;
            text = app.name;
            empty = false;
            fontSize = config.display.font;
            break;
          }
          case 'folder': {
            icon = FOLDER_ICON;
            text = entry.id;
            empty = false;
            fontSize = config.display.font ? config.display.font : 12;
            break;
          }
          default:
            continue;
        }

        // Calculate position and icon size
        let iconSize = config.display.icon ? Math.max(0, squareSize - fontSize) : 0; // If icon is disabled, stay at zero. Otherwise, subtract font size from square
        let iconScale: number = iconSize / 48;
        let posX = 12 + (x * squareSize);
        let posY = 24 + (y * squareSize);

        // Draw the icon
        if (config.display.icon && iconSize != 0)
          try {
            g.drawImage(icon, posX + (squareSize - iconSize) / 2, posY, { scale: iconScale });
          } catch (error) {
            console.log(`Failed to draw icon for ${text}: ${error}`);
            console.log(icon);
          }

        // Draw the text
        if (fontSize)
          g.setFont('Vector', getFontSize(text.length, squareSize, 6, squareSize - iconSize))
            .drawString(text, posX + (squareSize / 2), posY + iconSize);
      }
    }

    // Draw a nice message if there is nothing to see, so the user doesn't think the app is broken
    if (empty) E.showMessage(/*LANG*/'Folder is empty. Swipe from left, back button, or BTN1 to go back.');

    // Draw a scroll bar if necessary
    if (nPages > 1) { // Avoid divide-by-zero and pointless scroll bars
      let barSize = (g.getHeight() - 24) / nPages;
      let barTop = 24 + (page * barSize);
      g.fillRect(
        g.getWidth() - 8, barTop,
        g.getWidth() - 4, barTop + barSize);
    }
  }

  /**
   * Handle a touch
   *
   * @param _button 1 for left half, 2 for right half
   * @param xy postion on screen
   */
  let onTouch = function (_button, xy) {
    // Determine which grid cell was tapped
    let x: number = Math.floor((xy!.x - 12) / ((g.getWidth() - 24) / config.display.rows));
    if (x < 0) x = 0;
    else if (x >= config.display.rows) x = config.display.rows - 1;
    let y: number = Math.floor((xy!.y - 24) / ((g.getHeight() - 24) / config.display.rows));
    if (y < 0) y = 0;
    else if (y >= config.display.rows) y = config.display.rows - 1;

    // Handle the grid cell
    let entry: GridEntry = grid[x]![y]!;
    switch (entry.type) {
      case "app": {
        buzz();
        let infoFile = storage.readJSON(entry.id + '.info', false) as AppInfo;
        load(infoFile.src);
        break;
      }
      case "folder": {
        buzz();
        resetTimeout();
        page = 0;
        folderPath.push(entry.id);
        folder = getFolder(folderPath);
        render();
        break;
      }
      default: {
        resetTimeout();
        break;
      }
    }
  } satisfies TouchCallback;

  let page: number = 0;
  let nPages: number; // Set when setting folder

  /**
   * Handle a swipe
   *
   * A swipe from left is treated as the back button. Up and down swipes change pages
   *
   * @param lr -1 if left, 0 if pure up/down, 1 if right
   * @param ud -1 if up, 0 if pure left/right, 1 if down
   */
  let onSwipe = function (lr: -1 | 0 | 1 | undefined, ud: -1 | 0 | 1 | undefined) {
    if (lr == 1 && ud == 0) {
      onBackButton();
      return;
    } else if (ud == 1) {
      resetTimeout();
      if (page == 0) {
        buzz(200);
        return;
      } else page--;
    } else if (ud == -1) {
      resetTimeout();
      if (page == nPages - 1) {
        buzz(200);
        return;
      } else page++;
    }

    // If we reached this point, the page number has been changed and is valid.
    render();
  }

  /**
   * Go back up a level. If already at the root folder, exit the launcher
   */
  let onBackButton = () => {
    buzz();
    if (folderPath.length == 0)
      Bangle.showClock();
    else {
      folderPath.pop();
      folder = getFolder(folderPath);
      resetTimeout();
      page = 0;
      render();
    }
  }

  /**
   * Vibrate the watch if vibration is enabled
   */
  let buzz = config.disableVibration ? () => {} : Bangle.buzz;

  Bangle.loadWidgets();
  Bangle.drawWidgets();

  Bangle.setUI({
    mode: 'custom',
    back: onBackButton,
    btn: onBackButton,
    swipe: onSwipe,
    touch: onTouch,
    remove: () => { if (timeout) clearTimeout(timeout); }
  });

  resetTimeout();
  render();

}
