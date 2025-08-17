function _getSettings() {
    var out = Object.assign(
        require('Storage').readJSON("heatsuite.default.json", true) || {},
        require('Storage').readJSON("heatsuite.settings.json", true) || {}
    );
    out.StudyTasks = require('Storage').readJSON("heatsuite.tasks.json", true) || {};
    return out;
}
function _checkFileHeaders(filename,header){
    var storageFile = require("Storage").open(filename, "r");
    var headers = storageFile.readLine().trim();
    var headerString = header.join(",");
    if(headers === headerString){
        return true;
    }else{
        return false;
    }
}
function _renameOldFile(file){
    var rename = false;
    var i = 1;
    while(!rename){
        var filename = file+"_"+String(i);
        if(require('Storage').list(filename).length == 0){
            var newFile = require("Storage").open(filename, "w");
            var oldFile = require("Storage").open(file, "r");
            var l = oldFile.readLine();
            while (l!==undefined) {
                newFile.write(l);
                l = oldFile.readLine();
            }
            oldFile.erase(); //erase old file
            require("Storage").compact(); //compact memory
            rename = true;
        }else{
            i++;
        }
    }
}
function _getRecordFile(type, headers) {
    var settings = _getSettings();
    var dt = new Date();
    var hour = dt.getHours();
    if (hour < 10) hour = '0' + hour;
    var month = dt.getMonth() + 1;
    if (month < 10) month = '0' + month;
    var day = dt.getDate();
    if (day < 10) day = '0' + day;
    var date = dt.getFullYear() + "" + month + "" + day;
    var fileName = settings.filePrefix + "_" + type + "_";
    fileName = fileName + date;
    if (require('Storage').list(fileName).length > 0 && type !== "accel") {
        if(_checkFileHeaders(fileName,headers)){
            return require('Storage').open(fileName, 'a');
        }else{ // need to rename the old file as headers have changed
            _renameOldFile(fileName);
        }
    }
    if (type !== "accel") {
        var storageFile = require("Storage").open(fileName, "w");
        storageFile.write(headers.join(",") + "\n");
    }
    return require("Storage").open(fileName, "a");
}
function _checkStorageFree(type) {
    var settings = _getSettings();
    var freeSpace = require("Storage").getFree();
    var filePrefix = settings.filePrefix + type;
    var csvList = require("Storage").list(filePrefix);
    if (freeSpace < 500000) {
        if(csvList.length > 0){
            require("Storage").open(csvList[0],"r").erase();
        }
      require("Storage").compact();
    }
}
function _saveDataToFile(type, task, arr) {
    var newArr = {
        'unix' : parseInt((getTime()).toFixed(0)),
        'tz' : (new Date()).getTimezoneOffset() * -60
    }
    for (var key in arr) {
            newArr[key] = arr[key];
    }
    var data = [];
    var headers = [];
    for (var key in newArr) {
        if(Array.isArray(newArr[key])){
            newArr[key] = newArr[key].join(';');
        }
        data.push(newArr[key]);
        headers.push(key);
    }
    var currFile = _getRecordFile(type, headers);
    if (currFile) {
        var String = data.join(',') + '\n';
        currFile.write(String);
        _updateTaskQueue(task, newArr);
        return true;
    }
}
function _updateTaskQueue(task, arr) {
    var appCache = _getCache();
    var taskQueue = appCache.taskQueue;
    var tasktime = parseInt((getTime()).toFixed(0));
    if (taskQueue !== undefined) {
        var newTaskQueue = taskQueue.filter(function (taskQueue) {
            return taskQueue.id !== task;
        });
        appCache.taskQueue = newTaskQueue;
    }
    if (appCache[task] === undefined) appCache[task] = {};
    if (task === 'survey') { //we will refactor the value to be an object with keys
        var key = arr.key;
        if(appCache.survey[key] === undefined) appCache.survey[key] = {};
        appCache.survey[key] = {
            unix: tasktime,
            resp: arr.value
        };
    }else{
        appCache[task] = arr;
    }
    appCache[task].unix = tasktime;
    //lets always store cache so we can restore values if needed
    _writeCache(appCache);
}
function _getCache() {
    return require('Storage').readJSON("heatsuite.cache.json", true) || {};
}
function _writeCache(cache) {
    var oldCache = _getCache();
    if (oldCache !== cache) require('Storage').writeJSON("heatsuite.cache.json", cache);
    return _getCache();
}
function _clearCache() {
    require('Storage').writeJSON("heatsuite.cache.json", {});
    return _getCache();
}
function _parseBLEData(buffer, dataSchema) {
    let offset = 0;
    let result = {};
    for (let field in dataSchema) {
        const dataType = dataSchema[field];
        let value;
        switch (dataType) {
            case 'uint8':
                value = buffer.getUint8(offset,true);
                offset += 1; // 1 byte for uint8
                break;
            case 'uint16':
                  value = buffer.getUint16(offset,true); // Assuming little-endian format
                  offset += 4; // 2 bytes for uint16
                  break;
            case 'int32':
                value = buffer.getInt32(offset,true); // Assuming little-endian format
                offset += 4; // 4 bytes for int32
                break;
            case 'float32':
                value = buffer.getFloat32(offset,true); // Assuming little-endian format
                offset += 4; // 4 bytes for float32
                break;
            case 'float64':
                value = buffer.getFloat64(offset,true); // Assuming little-endian format
                offset += 8; // 8 bytes for float64
                break;
            case 'array':
                value = [];
                for (let i = 0; i < 6; i++) {
                    value.push(buffer.getUint8(offset,true));
                    offset += 1; // 1 byte for each uint8
                }
                break;
            case 'float16':{
                const b0 = buffer.getUint8(offset, true);
                const b1 = buffer.getUint8(offset + 1, true);
                const mantissa = (b1 << 8) | b0;
                const sign = mantissa & 0x8000 ? -1 : 1;
                const exponent = (mantissa >> 11) & 0x0F;
                const fraction = mantissa & 0x7FF;
                value = sign * (1 + fraction / 2048) * Math.pow(2, exponent - 15);
                offset += 2; 
                break;
            }
            default:
                throw new Error(`Unknown data type: ${dataType}`);
        }
        result[field] = value;
    }
    return result;
}
function _log(msg) {
    var settings = _getSettings();
    if(settings.SAVE_DEBUG){
        var file = require('Storage').open('heatsuite.log', 'a');
        var string = String(parseInt((new Date().getTime() / 1000).toFixed(0)))+": "+msg+"\n";
        file.write(string);
        return;
    }
    else if (!settings.DEBUG) {
      return;
    } else {
      console.log(msg);
    }
  }
exports = {
    getSettings: _getSettings,
    getRecordFile: _getRecordFile,
    saveDataToFile: _saveDataToFile,
    checkStorageFree : _checkStorageFree,
    getCache: _getCache,
    writeCache: _writeCache,
    clearCache: _clearCache,
    updateTaskQueue: _updateTaskQueue,
    parseBLEData: _parseBLEData,
    log: _log,
};