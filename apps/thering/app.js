const h = g.getHeight();
const w = g.getWidth();
const widget_utils = require('widget_utils');
// palette for 0-40%
const pal1 = new Uint16Array([g.theme.bg, g.toColor("#020"), g.toColor("#0f0"), g.toColor("#00f")]);
// palette for 50-100%
const pal2 = new Uint16Array([g.theme.bg, g.toColor("#0f0"), g.toColor("#020"), g.toColor("#00f")]);
const infoWidth = 50;
const infoHeight = 14;

var drawingSteps = false;
//var fakeSteps = 0;

var p0_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal1,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVAAVUFUgpDAAdAFMEBFQ4ABqBVnLMQqLLLzWEABLgbVgohEGopYaiofDBihWVHJpYYDgYPbKx1ACJhYZIwT4OcAZWYHyRYUIgQXQH4RqOThCXUYRpCHNyQVVQQTwVQiSZWIQSEQNgSYSIYiEQQSyEUCQLDSOAyCnQiSCYQiSCYQiSCZDaDARObKuBSZwcaVzR0QFYKuZWAYNZWCJJKMoKuaWAahKBhiwTJRSudURorBFTgfMVzqjDO5DaeZ5jaeJhhiKbi4rIbT4hLqoriPI7afUpS5BbTwiKFdZgIADSmHFYIqgbgIrGcgIriEYwzHADZ7HRY4rdaYrjHADcBFYoGBFcgkEGQwAeFYqKHFbzUEcQ4AdiorwiorlEogxFAD59FWoorhoArDqArjgIr/FbYwFAEJSDFf4rXgornqgrDFUkAior/Ff4rGAYYAjKYYr/Ff4r/FbdVFdFAFYNQFcsBFf4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/FbdUFcsFFYUVFdADBFf4r/Ff4rbAYYAjKYYr/Ff4rFoArkqorCgIrnqAr/FbIEFAEBSFFf4rYqgrjgorEiormAocVAogAfEooxFFcB9EFdq1DAD9VFYkBFctQFYoGEADokHFcp8FRQoAdag7iFFb4HFioHGADYjHGY4rcPYyLHADbTHcYNQFT4iIFdZgIADKmJqrcgiorIBIIrhMKIAXUpIrBbjzaBFZAKKbS5MJFcKkJbj4fLBYLcdqorKbjzPMbjxKNMhauTURawdJJorBWDShBFZiRBWDQcOHRyuPOhorBWDIbPWDRzQSYKEYIwLLOHgSEXDIJyPQjD2SQjCCQQjSCRCYY/QN4xDRQiyCSQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A"))
};

var p2_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette: pal1,
  buffer : require("heatshrink").decompress(atob("AH4A/ADNUFE8FqtVq2q1AqkFIIrDAAOAFMEBFQYrE1WgKsYrGLL4qFFY2pqDWeFZdUVkAhCAQMKFYdVLDUVFQYMHlWq0oMJKyoOJlQrCLDBWDB5clB5xWOoARMCARYWKwT4OgpYXKwY+SLChECC6A/CNRycIS6jCNIQ5uSCqqCCeCqESTKxCCQiBsCTCRDEQiCCWQigSBYaRwGQU6ESQTCESQTCESQTIbQYCJzZVwKTODjSuaOiArBVzKwDBrKwRJJRlBVzSwDUJQMMWCZKKVzqiNFYIqcD5iudUYZ3IbTzPMbTxMMMRTcXFZDafEJdVFcR5HbT6lKXILaeERQrrMBAAaUw4rBFUDcBFYzkBFcQjGGY4AbPY6LHFbrTFcY4AbgIrFAwIrkEggyGADwrFRQ4reagjiHADsVFeEVFcolEGIoAfPoq1FFcNAFYdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHI"))
};

var p4_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal1,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFY2loAqjFY1VqDWeFZdUVkAhEhQrDLDcVFQYMHlQrCBhBWVHJpYYDgYPbKx1ACJhYZIwT4OgpYXKwY+SLChECC6A/CNRycIS6jCNIQ5uSCqqCCeCqESTKxCCQiBsCTCRDEQiCCWQigSBYaRwGQU6ESQTCESQTCESQTIbQYCJzZVwKTODjSuaOiArBVzKwDBrKwRJJRlBVzSwDUJQMMWCZKKVzqiNFYIqcD5iudUYZ3IbTzPMbTxMMMRTcXFZDafEJdVFcR5HbT6lKXILaeERQrrMBAAaUw4rBFUDcBFYzkBFcQjGGY4AbPY6LHFbrTFcY4AbgIrFAwIrkEggyGADwrFRQ4reagjiHADsVFeEVFcolEGIoAfPoq1FFcNAFYdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHI"))
};

var p7_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal1,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgWlKzVACJgrCqBWYawgAJcAOlNBhWMCZ8qFYJYUgoqBC6ECFYJqOAApWSS4jCNQQ5uSCqqCCeCqESFQKZUIQSEQNgSYSIYiEQQSyEUCQLDSOAyCnQiSCYQiSCYQiSCZDaDARObKuBSZwcaVzR0QFYKuZWAYNZWCJJKMoKuaWAahKBhiwTJRSudURorBFTgfMVzqjDO5DaeZ5jaeJhhiKbi4rIbT4hLqoriPI7afUpS5BbTwiKFdZgIADSmHFYIqgbgIrGcgIriEYwzHADZ7HRY4rdaYrjHADcBFYoGBFcgkEGQwAeFYqKHFbzUEcQ4AdiorwiorlEogxFAD59FWoorhoArDqArjgIr/FbYwFAEJSDFf4rXgornqgrDFUkAior/Ff4rGAYYAjKYYr/Ff4r/FbdVFdFAFYNQFcsBFf4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/FbdUFcsFFYUVFdADBFf4r/Ff4rbAYYAjKYYr/Ff4rFoArkqorCgIrnqAr/FbIEFAEBSFFf4rYqgrjgorEiormAocVAogAfEooxFFcB9EFdq1DAD9VFYkBFctQFYoGEADokHFcp8FRQoAdag7iFFb4HFioHGADYjHGY4rcPYyLHADbTHcYNQFT4iIFdZgIADKmJqrcgiorIBIIrhMKIAXUpIrBbjzaBFZAKKbS5MJFcKkJbj4fLBYLcdqorKbjzPMbjxKNMhauTURawdJJorBWDShBFZiRBWDQcOHRyuPOhorBWDIbPWDRzQSYKEYIwLLOHgSEXDIJyPQjD2SQjCCQQjSCRCYY/QN4xDRQiyCSQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A=="))
};

var p10_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal1,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgZWaoARMLDJWCawgAJcAZWYCZ6FCLCkFFQNQCZ8CFYOoFaZWSLAmAQShWQLAiESQQRtTLAOkQSdUFacK1WloCCSCaAAEFYKaQQSyEC0pvQirZTbomlIh6CYZAZFOQTBxDQhyCYOQhoPQS4bQHaBzaVwKTODjSuaOiArBVzKwDBrKwRJJRlBVzSwDUJQMMWCZKKVzqiNFYIqcD5iudUYZ3IbTzPMbTxMMMRTcXFZDafEJdVFcR5HbT6lKXILaeERQrrMBAAaUw4rBFUDcBFYzkBFcQjGGY4AbPY6LHFbrTFcY4AbgIrFAwIrkEggyGADwrFRQ4reagjiHADsVFeEVFcolEGIoAfPoq1FFcNAFYdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHI"))
};

var p20_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal1,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgZWaoARMLDJWCawgAJcAZWYCZ6FCLCkFFQNQCZ8CFYOoFaZWSLAmAQShWQLAiESQQRtTLAKESFQNUFacKQiSCCoArTgCESQSyEUirZTboyCnQiSCYQiSCYQiSCZQgeAVxwqYQgSwMVwNUFbMKWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbhdVFcTcHbT7cDFY0BbT7cD0ArxgtVoArfgGq1ArHFUDcBFY0VFceqFY1UFcMKFY1VFcmAFYtQFcMCFYsBFcugFYtAFcMAFYsFFcuoFYoqigEqFeEVFcuqFYlUFccKFYlVFc2AFYdQFccCFf4AWgNVoAEGAERSDFf4rXgornqgrDFUkAior/Ff4rGAYYAjKYYr/Ff4r/FbdVFdFAFYNQFcsBFf4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/FbdUFcsFFYUVFdADBFf4r/Ff4rbAYYAjKYYr/Ff4rFoArkqorCgIrnqAr/FbIEFAEBSFFf4rYqgrjgorEiormAocVAogAfEooxFFcB9EFdq1DAD9VFYkBFctQFYoGEADokHFcp8FRQoAdag7iFFb4HFioHGADYjHGY4rcPYyLHADbTHcYNQFT4iIFdZgIADKmJqrcgiorIBIIrhMKIAXUpIrBbjzaBFZAKKbS5MJFcKkJbj4fLBYLcdqorKbjzPMbjxKNMhauTURawdJJorBWDShBFZiRBWDQcOHRyuPOhorBWDIbPWDRzQSYKEYIwLLOHgSEXDIJyPQjD2SQjCCQQjSCRCYY/QN4xDRQiyCSQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A="))
};

var p30_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal1,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgZWaoARMLDJWCawgAJcAZWYCZ6FCLCkFFQNQCZ8CFYOoFaZWSLAmAQShWQLAiESQQRtTLAKESFQNUFacKQiSCCoArTgCESQSyEUirZTboyCnQiSCYQiSCYQiSCZQgeAVxwqYQgSwMVwNUFbMKWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbhdVFcTcHbT7cDFY0BbT7cD0ArxgtVoArfgGq1ArHFUDcBFY0VFceqFY1UFcMKFY1VFcmAFYtQFcMCFYsBFcugFYtAFcMAFYsFFcuoFYoqigEqFeEVFcuqFYlUFccKFYlVFc2AFYdQFccCFf4rbgNVoArjgGq0Ar/FbMFFc+oFYYqkgEqFf4r/FY0VqgrlhWqFf4r/Ff4rdqorowArBqArlgQr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlhQrCioroAYIr/Ff4r/FbcFqorllWoFf4r/FY9AFcmqFYUBFc+gFf4rZgFVqAqjgWqwAr/FbdUFccFawkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHI"))
};

var p40_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal1,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVqtW1WoFUgpBFYYABwApggIqDFYmq0BVjFYxZfFQorGLLrWCFZbgbVgtUBQcKLD8VFQYMHlQsDKzoOJFgZYYKwYPLFgZWaoARMLDJWCawgAJcAZWYCZ6FCLCkFFQNQCZ8CFYOoFaZWSLAmAQShWQLAiESQQRtTLAKESFQNUFacKQiSCCoArTgCESQSyEUirZTboyCnQiSCYQiSCYQiSCZQgeAVxwqYQgSwMVwNUFbMKWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbhdVFcTcHbT7cDFY0BbT7cD0ArxgtVoArfgGq1ArHFUDcBFY0VFceqFY1UFcMKFY1VFcmAFYtQFcMCFYsBFcugFYtAFcMAFYsFFcuoFYoqigEqFeEVFcuqFYlUFccKFYlVFc2AFYdQFccCFf4rbgNVoArjgGq0Ar/FbMFFc+oFYYqkgEqFf4r/FY0VqgrlhWqFf4r/Ff4rdqorowArBqArlgQr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlhQrCioroAYIr/Ff4r/FbcFqorllWoFf4r/FY9AFcmqFYUBFc+gFf4rZgFVqAqjgWqwAr/FbdUFccKFYkVFcwFDitVFccqFYkFFcuoFeNAFcWqFYkBFcugFYtQFUMCFYsAFcuAFYtUFcMKFY0VFcgHFitVFcMqFY0FFceoFY9AFcGqFY0BqtQFT8C1WgFeMAqtUFb8K1WAFY7cglQrIioriBI8FqtAFb2q1ArJbjzaBFZEBbj7aB0ALIFcLaHbkLaJFYbcd1QrKbjzaKbkDaLbgSwcVwLaJWD6uLFYawaVwIrMbgKwaVwLaKbgawaVwLaLbgawZQQLaLWDiuOWAaEYQQKuMWAiEXKwKuNQjUBQR6EaiqCPQjVVQSATCqtUFSZvB1WACiSEUY4KCQQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A"))
};

var p50_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal2,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESFQOoFacFQiSCCwArTgCESQSyEUlTZTboyCnQiSCYQiSCYQiSCZQgdAVxwqYQgSwMVwOoFbMFWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbheqFcTcHbT7cDFY0CbT7cDqArxhWqwArfgFVqgrHFUDcBFY0qFcdVFY2oFcMFFY2qFclAFYugFcMBFYsCFctQFYuAFcMAFYsKFctUFYoqigEVFeEqFctVFYmoFccFFYmqFc1AFYegFccBFf4rbgWqwArjgFVqAr/FbMKFc9UFYYqkgEVFf4r/FY0q1ArlgtVFf4r/Ff4rd1QrooArB0ArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rb1ArlgorClQroAYIr/Ff4r/FbcK1QrlitUFf4r/FY+AFclVFYUCFc9QFf4rZgGq0AqjgNVoAr/FbeoFccFFYkqFcwFDlWqFccVFYkKFctUFeOAFcVVFYkCFctQFYugFUMBFYsAFctAFYuoFcMFFY0qFcgHFlWqFcMVFY0KFcdUFY+AFcFVFY0C1WgFT8BqtQFeMA1WoFb8FqtAFY7cgiorIlQriBI8K1WAFb1VqgrJbjzaBFZECbj7aBqALIFcLaHbkLaJFYbcdqorKbjzaKbkDaLbgSwcVwLaJWD6uLFYawaVwIrMbgKwaVwLaKbgawaVwLaLbgawZQQLaLWDiuOWAaEYQQKuMWAiEXKwKuNQjSCQQjSCQQjSCRAAIrB1AqTgorBoAUQQiyCSQgjdSbISCRQgZYSKwKCSQghYQKwSCSQghYQKwSCTAAMqFYOoCJsFFQNVFShYEwARMFQRWVLAiFMQIRWWLAosKFQZWXLAosIFQZWYLAzgFawZWbAAMKFgmq1IoEAANUFTQABFZtAFbgsFFYwqeWQorFVjZZJFYhVfcAwrCazoA/AHI"))
};

var p60_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal2,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESFQOoFacFQiSCCwArTgCESQSyEUlTZTboyCnQiSCYQiSCYQiSCZQgdAVxwqYQgSwMVwOoFbMFWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbheqFcTcHbT7cDFY0CbT7cDqArxhWqwArfgFVqgrHFUDcBFY0qFcdVFY2oFcMFFY2qFclAFYugFcMBFYsCFctQFYuAFcMAFYsKFctUFYoqigEVFeEqFctVFYmoFccFFYmqFc1AFYegFccBFf4rbgWqwArjgFVqAr/FbMKFc9UFYYqkgEVFf4r/FY0q1ArlgtVFf4r/Ff4rd1QrooArB0ArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rb1ArlgorClQroAYIr/Ff4r/FbcK1QrlitUFf4r/FY+AFclVFYUCFc9QFf4rZgGq0AqjgNVoAr/FbeoFccFFYkqFcwFDlWqFccVFYkKFctUFeOAFcVVFYkCFctQFYugFUMBFYsAFctAFYuoFcMFFY0qFcgHFlWqFcMVFY0KFcdUFY+AFcFVFY0C1WgFT8BqtQFeMA1WoFb8FqtAFY7cgiorIlQriBI8K1WAFb1VqgrJbjzaBFZECbj7aBqALIFcLaHbkLaJFYbcdqorKbjzaKbkDaLbgSwcVwLaJWD6uLFYawaVwIrMbgKwaVwLaKbgawaVwLaLbgawZQQLaLWDiuOWAaEYQQKuMWAelNBqCLVxqEC0oRPQS6EC0oSQQSyECFYKEVQSIABFYI/QAAcFFYJDRCgSCmYYjdSCqqYCLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A"))
};

var p70_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal2,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESFQOoFacFQiSCCwArTgCESQSyEUlTZTboyCnQiSCYQiSCYQiSCZQgdAVxwqYQgSwMVwOoFbMFWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbheqFcTcHbT7cDFY0CbT7cDqArxhWqwArfgFVqgrHFUDcBFY0qFcdVFY2oFcMFFY2qFclAFYugFcMBFYsCFctQFYuAFcMAFYsKFctUFYoqigEVFeEqFctVFYmoFccFFYmqFc1AFYegFccBFf4rbgWqwArjgFVqAr/FbMKFc9UFYYqkgEVFf4r/FY0q1ArlgtVFf4r/Ff4rd1QrooArB0ArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rb1ArlgorClQroAYIr/Ff4r/FbcK1QrlitUFf4r/FY+AFclVFYUCFc9QFf4rZAgoAggNVoAr/FbdUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHIA="))
};

var p80_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal2,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESFQOoFacFQiSCCwArTgCESQSyEUlTZTboyCnQiSCYQiSCYQiSCZQgdAVxwqYQgSwMVwOoFbMFWBquaWCArBVzKwDbRoqaWATcKbQKuaWAbcKbQKuaWAbcKVzqwNFYIqcWATaKVziwDbhDaebhjaebhgrBbTrcCFZDafbheqFcTcHbT7cDFY0CbT7cDqArxhWqwArfgFVqgrHFUDcBFY0qFcdVFY2oFcMFFY2qFclAFYugFcMBFYsCFctQFYuAFcMAFYsKFctUFYoqigEVFeEqFctVFYmoFccFFYmqFc1AcIdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHIA="))
};

var p90_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal2,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4AChWq1WpqtUFUgpBFYYABoApggQqDFYlVqBVjFYxZfFQorGLLrWCFZbgbVguoBQcFLD8qFQYMHiosDKzoOJFgZYYKwYPLFgZWawARMLDJWCawgAJcAZWYCZ6FCLCkKFQOgCZ8BFYNUFaZWSLAlAQShWQLAiESQQRtTLAKESquq1ArTgqESNgOqwArTIYKERH4KCUQigSBbKTdGCKKCVQiTCCFSyERCALBQQjAPBoArXDZ7ARObKuBSZwcaVzR0QFYKuZWAYNZWCJJKMoKuaWAahKBhiwTJRSudURorBFTgfMVzqjDO5DaeZ5jaeJhhiKbi4rIbT4hLqoriPI7afUpS5BbTwiKFdZgIADSmHFYIqgbgIrGcgIriEYwzHADZ7HRY4rdaYrjHADcBFYoGBFcgkEGQwAeFYqKHFbzUEcQ4AdiorwiorlEogxFAD59FWoorhoArDqArjgIr/FbYwFAEJSDFf4rXgornqgrDFUkAior/Ff4rGAYYAjKYYr/Ff4r/FbdVFdFAFYNQFcsBFf4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/FbdUFcsFFYUVFdADBFf4r/Ff4rbAYYAjKYYr/Ff4rFoArkqorCgIrnqAr/FbIEFAEBSFFf4rYqgrjgorEiormAocVAogAfEooxFFcB9EFdq1DAD9VFYkBFctQFYoGEADokHFcp8FRQoAdag7iFFb4HFioHGADYjHGY4rcPYyLHADbTHcYNQFT4iIFdZgIADKmJqrcgiorIBIIrhMKIAXUpIrBbjzaBFZAKKbS5MJFcKkJbj4fLBYLcdqorKbjzPMbjxKNMhauTURawdJJorBWDShBFZiRBWDQcOHRyuPOhorBWDIbPWDRzQSYKEYIwLLOHgSEXDIJyPQjD2SQjCCQQjSCRCYY/QN4xDRQiyCSQgjdSCqqECLCRWBYyiECISBWCYqgXCLCBWCQSYYEIhxqCeChYFThoQCKypYEIxgPPLB4cKFQZWXDoosIBhhYWcArWDKzYhHABA1EADArNoArcFhgqeWQysgLJxVfcBLWdAH4A5A"))
};

var p100_img = {
  width : 176, height : 176, bpp : 2,
  transparent : -1,
  palette : pal2,
  buffer : require("heatshrink").decompress(atob("AH4A/AH4ACgtVAAVUFUgpDAAdAFMEBFQ4ABqBVnLMQqLFjzWEABLgbVgohEGoqyaiofDBihWVHJpYYDgYPbKxz5NLDJGCfBzgDKzA+SLChECC6A/CNRycIS6jCNIQ5uSCqqCCeCqESTKxCCQiBsCTCRDEQiCCWQigSBYaRwGQU6ESQTCESQTCESQTIbQYCJzZVwKTODjSuaOiArBVzKwDBrKwRJJRlBVzSwDUJQMMWCZKKVzqiNFYIqcD5iudUYZ3IbTzPMbTxMMMRTcXFZDafEJdVFcR5HbT6lKXILaeERQrrMBAAaUw4rBFUDcBFYzkBFcQjGGY4AbPY6LHFbrTFcY4AbgIrFAwIrkEggyGADwrFRQ4reagjiHADsVFeEVFcolEGIoAfPoq1FFcNAFYdQFccBFf4rbGAoAhKQYr/Fa8FFc9UFYYqkgEVFf4r/FYwDDAEZTDFf4r/Ff4rbqorooArBqArlgIr/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4rbqgrlgorCioroAYIr/Ff4r/FbYDDAEZTDFf4r/FYtAFclVFYUBFc9QFf4rZAgoAgKQor/FbFUFccFFYkVFcwFDioFEAD4lFGIorgPogrtWoYAfqorEgIrlqArFAwgAdEg4rlPgqKFADrUHcQorfA4sVA4wAbEY4zHFbh7GRY4AbaY7jBqAqfERArrMBAAZUxNVbkEVFZAJBFcJhRAC6lJFYLcebQIrIBRTaXJhIrhUhLcfD5YLBbjtVFZTceZ5jceJRpkLVyaiLWDpJNFYKwaUIIrMSIKwaDhw6OVx50NFYKwZDZ6waOaCTBQjBGBZZw8CQi4ZBOR6EYeySEYQSCEaQSITDH6BvGIaKEWQSSEEbqQVVQgRYSKwLGUQgRCQKwTFUC4RYQKwSCTDAhEONQTwULAqcNCARWVLAhGMB55YPDhQqDKy4dFFhAMMLCzgFawZWbEI4AIGogAYFZtAFbgsMFTyyGVkBZOKr7gJazoA/AHIA="))
};

function setLargeFont() {
  g.setFont('Vector', 48);
}

function setSmallFont() {
  //g.setFont('6x8',1);
  g.setFont('Vector', 16);
}

function getSteps() {
  //return fakeSteps;
  try {
    return Bangle.getHealthStatus("day").steps;
  } catch (e) {
    if (WIDGETS.wpedom !== undefined) 
      return WIDGETS.wpedom.getSteps();
    else
      return 0;
  }
}

function getGaugeImage(p) {
  console.log("p="+p);
  if (p < 2) return p0_img;
  if (p >= 2 && p < 4) return p2_img; 
  if (p >= 4 && p < 7) return p4_img; 
  if (p >= 7 && p < 10) return p7_img; 
  if (p >= 10 && p < 20) return p10_img; 
  if (p >= 20 && p < 30) return p20_img; 
  if (p >= 30 && p < 40) return p30_img; 
  if (p >= 40 && p < 50) return p40_img; 
  if (p >= 50 && p < 60) return p50_img; 
  if (p >= 60 && p < 70) return p60_img; 
  if (p >= 70 && p < 80) return p70_img; 
  if (p >= 80 && p < 90) return p80_img; 
  if (p >= 90 && p < 100) return p90_img; 
  if (p >= 100) return p100_img; 
}

function draw() {
  var date = new Date();
  //var timeStr = require("locale").time(date,1);
  var da = date.toString().split(" ");
  //var time = da[4].substr(0,5);
  var hh = da[4].substr(0,2);
  var mm = da[4].substr(3,2);
  var steps = getSteps();
  var p_steps = Math.round(100*(steps/10000));
  console.log("steps="+ steps + " p_steps=" + p_steps);
  
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(0, 0, w, h);
  g.drawImage(getGaugeImage(p_steps), 0, 0);
  setLargeFont();

  g.setColor('#0f0');
  g.setFontAlign(1,0);  // right aligned
  g.drawString(hh, (w/2) - 1, h/2);

  g.setColor(g.theme.fg);
  g.setFontAlign(-1,0); // left aligned
  g.drawString(mm, (w/2) + 1, h/2);

  drawSteps();
  g.drawString('Battery ' + E.getBattery() + '%', w/2, h/4);
}

function drawSteps() {
  if (drawingSteps) return;
  drawingSteps = true;
  setSmallFont();
  g.setFontAlign(0,0);
  var steps = getSteps();
  g.setColor(g.theme.bg);
  g.fillRect((w/2) - infoWidth, (3*h/4) - infoHeight, (w/2) + infoWidth, (3*h/4) + infoHeight); 
  g.setColor(g.theme.fg);
  g.drawString('Steps ' + steps, w/2, (3*h/4) - 4);
  drawingSteps = false;
}

Bangle.on('step', s => {
  drawSteps();
});

// for testing the segments
/*
function nextSteps() {
  fakeSteps += 100;
}

function prevSteps() {
  fakeSteps -= 100;
}

Bangle.setUI("clockupdown", btn=> {
  if (btn<0) prevSteps();
  if (btn>0) nextSteps();
  draw();
});
*/

g.clear();
Bangle.setUI("clock");
Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 */
widget_utils.hide();

draw();
setInterval(draw, 60000);
