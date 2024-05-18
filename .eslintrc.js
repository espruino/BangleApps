const lintExemptions = require("./apps/lint_exemptions.js");
const fs = require("fs");
const path = require("path");

function findGeneratedJS(roots) {
    function* listFiles(dir, allow) {
        for (const f of fs.readdirSync(dir)) {
            const filepath = path.join(dir, f);
            const stat = fs.statSync(filepath);

            if (stat.isDirectory()) {
                yield* listFiles(filepath, allow);
            } else if(allow(filepath)) {
                yield filepath;
            }
        }
    }

    return roots.flatMap(root =>
        [...listFiles(root, f => f.endsWith(".ts"))]
            .map(f => f.replace(/\.ts$/, ".js"))
    );
}

module.exports = {
    "env": {
        // TODO: "espruino": false
        // TODO: "banglejs": false
        // For a prototype of the above, see https://github.com/espruino/BangleApps/pull/3237
    },
    "extends": "eslint:recommended",
    "globals": {
        // Methods and Fields at https://banglejs.com/reference
        "Array": "readonly",
        "ArrayBuffer": "readonly",
        "ArrayBufferView": "readonly",
        "Bangle": "readonly",
        "BluetoothDevice": "readonly",
        "BluetoothRemoteGATTCharacteristic": "readonly",
        "BluetoothRemoteGATTServer": "readonly",
        "BluetoothRemoteGATTService": "readonly",
        "Boolean": "readonly",
        "console": "readonly",
        "DataView": "readonly",
        "Date": "readonly",
        "E": "readonly",
        "Error": "readonly",
        "Flash": "readonly",
        "Float32Array": "readonly",
        "Float64Array": "readonly",
        "Function": "readonly",
        "Graphics": "readonly",
        "I2C": "readonly",
        "Int16Array": "readonly",
        "Int32Array": "readonly",
        "Int8Array": "readonly",
        "InternalError": "readonly",
        "JSON": "readonly",
        "Math": "readonly",
        "Modules": "readonly",
        "NRF": "readonly",
        "Number": "readonly",
        "Object": "readonly",
        "OneWire": "readonly",
        "Pin": "readonly",
        "process": "readonly",
        "Promise": "readonly",
        "ReferenceError": "readonly",
        "RegExp": "readonly",
        "Serial": "readonly",
        "SPI": "readonly",
        "StorageFile": "readonly",
        "String": "readonly",
        "SyntaxError": "readonly",
        "TFMicroInterpreter": "readonly",
        "TypeError": "readonly",
        "Uint16Array": "readonly",
        "Uint24Array": "readonly",
        "Uint32Array": "readonly",
        "Uint8Array": "readonly",
        "Uint8ClampedArray": "readonly",
        "Unistroke": "readonly",
        "Waveform": "readonly",
        // Methods and Fields at https://banglejs.com/reference
        "__FILE__": "readonly",
        "analogRead": "readonly",
        "analogWrite": "readonly",
        "arguments": "readonly",
        "atob": "readonly",
        "Bluetooth": "readonly",
        "BTN": "readonly",
        "BTN1": "readonly",
        "BTN2": "readonly",
        "BTN3": "readonly",
        "BTN4": "readonly",
        "BTN5": "readonly",
        "btoa": "readonly",
        "changeInterval": "readonly",
        "clearInterval": "readonly",
        "clearTimeout": "readonly",
        "clearWatch": "readonly",
        "decodeURIComponent": "readonly",
        "digitalPulse": "readonly",
        "digitalRead": "readonly",
        "digitalWrite": "readonly",
        "dump": "readonly",
        "echo": "readonly",
        "edit": "readonly",
        "encodeURIComponent": "readonly",
        "eval": "readonly",
        "getPinMode": "readonly",
        "getSerial": "readonly",
        "getTime": "readonly",
        "global": "readonly",
        "HIGH": "readonly",
        "I2C1": "readonly",
        "Infinity": "readonly",
        "isFinite": "readonly",
        "isNaN": "readonly",
        "LED": "readonly",
        "LED1": "readonly",
        "LED2": "readonly",
        "load": "readonly",
        "LoopbackA": "readonly",
        "LoopbackB": "readonly",
        "LOW": "readonly",
        "NaN": "readonly",
        "parseFloat": "readonly",
        "parseInt": "readonly",
        "peek16": "readonly",
        "peek32": "readonly",
        "peek8": "readonly",
        "pinMode": "readonly",
        "poke16": "readonly",
        "poke32": "readonly",
        "poke8": "readonly",
        "print": "readonly",
        "require": "readonly",
        "reset": "readonly",
        "save": "readonly",
        "Serial1": "readonly",
        "setBusyIndicator": "readonly",
        "setInterval": "readonly",
        "setSleepIndicator": "readonly",
        "setTime": "readonly",
        "setTimeout": "readonly",
        "setWatch": "readonly",
        "shiftOut": "readonly",
        "SPI1": "readonly",
        "Terminal": "readonly",
        "trace": "readonly",
        "VIBRATE": "readonly",
        // Aliases and not defined at https://banglejs.com/reference
        "g": "readonly",
        "WIDGETS": "readonly",
        "module": "readonly",
        "exports": "writable",
        "D0": "readonly",
        "D1": "readonly",
        "D2": "readonly",
        "D3": "readonly",
        "D4": "readonly",
        "D5": "readonly",
        "D6": "readonly",
        "D7": "readonly",
        "D8": "readonly",
        "D9": "readonly",
        "D10": "readonly",
        "D11": "readonly",
        "D12": "readonly",
        "D13": "readonly",
        "D14": "readonly",
        "D15": "readonly",
        "D16": "readonly",
        "D17": "readonly",
        "D18": "readonly",
        "D19": "readonly",
        "D20": "readonly",
        "D21": "readonly",
        "D22": "readonly",
        "D23": "readonly",
        "D24": "readonly",
        "D25": "readonly",
        "D26": "readonly",
        "D27": "readonly",
        "D28": "readonly",
        "D29": "readonly",
        "D30": "readonly",
        "D31": "readonly",

        "bleServiceOptions": "writable", // available in boot.js code that's called ad part of bootupdate
    },
    "parserOptions": {
        "ecmaVersion": 11
    },
    "rules": {
        "indent": [
            "off",
            2,
            {
                "SwitchCase": 1
            }
        ],
        "no-constant-condition": "off",
        "no-delete-var": "off",
        "no-empty": ["warn", { "allowEmptyCatch": true }],
        "no-global-assign": "off",
        "no-inner-declarations": "off",
        "no-prototype-builtins": "off",
        "no-redeclare": "off",
        "no-unreachable": "warn",
        "no-cond-assign": "warn",
        "no-useless-catch": "warn",
        "no-undef": "warn",
        "no-unused-vars": ["warn", { "args": "none" } ],
        "no-useless-escape": "off",
        "no-control-regex" : "off"
    },
    overrides: [
        {
            files: ["*.ts"],
            extends: [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
            ],
            "parser": "@typescript-eslint/parser",
            "plugins": ["@typescript-eslint"],
            rules: {
                "no-delete-var": "off",
                "no-empty": ["error", { "allowEmptyCatch": true }],
                "no-prototype-builtins": "off",
                "prefer-const": "off",
                "prefer-rest-params": "off",
                "no-control-regex" : "off",
                "@typescript-eslint/no-delete-var": "off",
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-this-alias": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/no-var-requires": "off",
            }
        },
        ...Object.entries(lintExemptions).map(([filePath, {rules}]) => ({
            files: [filePath],
            rules: Object.fromEntries(rules.map(rule => [rule, "off"])),
        })),
    ],
    ignorePatterns: findGeneratedJS(["apps/", "modules/"]),
}
