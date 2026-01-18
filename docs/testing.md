# BangleApps Testing Documentation

This document describes how to write and run functional tests for Bangle.js apps using the emulator-based test runner.

## Running Tests

### Prerequisites

Clone the EspruinoWebIDE at the same level as BangleApps:

```bash
cd ..
git clone https://github.com/espruino/EspruinoWebIDE
```

### Running All Tests

```bash
node bin/runapptests.js --verbose
```

### Running Tests for a Specific App

```bash
node bin/runapptests.js --id android --verbose
```

## Writing Tests

Create a `test.json` file in your app's directory (e.g., `apps/myapp/test.json`).

### Basic Structure

```json
{
  "app": "myapp",
  "setup": [
    {
      "id": "default",
      "steps": [
        {"t": "cmd", "js": "/* setup code */"}
      ]
    }
  ],
  "tests": [
    {
      "description": "Test description",
      "steps": [
        {"t": "setup", "id": "default"},
        {"t": "assert", "js": "true", "is": "truthy"}
      ]
    }
  ]
}
```

### Supported Step Types

| Type | Description | Example |
|------|-------------|---------|
| `cmd` | Execute JavaScript on device | `{"t":"cmd", "js": "global.x = 1"}` |
| `eval` | Evaluate and compare result | `{"t":"eval", "js": "'a'+'b'", "eq": "ab"}` |
| `assert` | Assert a condition | `{"t":"assert", "js": "x > 0", "is": "truthy"}` |
| `assertArray` | Assert array conditions | `{"t":"assertArray", "js": "arr", "is": "notEmpty"}` |
| `setup` | Call a predefined setup | `{"t":"setup", "id": "default"}` |
| `load` | Load a file on device | `{"t":"load", "fn": "myapp.app.js"}` |
| `wrap` | Wrap a function for tracking | `{"t":"wrap", "fn": "Bangle.setGPSPower", "id": "gps"}` |
| `assertCall` | Assert function was called | `{"t":"assertCall", "id": "gps", "count": 1}` |
| `resetCall` | Reset call tracking | `{"t":"resetCall", "id": "gps"}` |
| `emit` | Emit an event | `{"t":"emit", "event": "touch", "paramsArray": [1, {"x":10}]}` |
| `gb` | Simulate Gadgetbridge message | `{"t":"gb", "obj": {"t": "notify"}}` |
| `advanceTimers` | Advance emulator timers | `{"t":"advanceTimers", "ms": 60000}` |
| `saveMemoryUsage` | Store current memory | `{"t":"saveMemoryUsage"}` |
| `checkMemoryUsage` | Compare to stored memory | `{"t":"checkMemoryUsage"}` |
| `upload` | Upload a module | `{"t":"upload", "file": "modules/foo.js", "as": "foo"}` |

### Assert Conditions

For `assert` steps, the `is` field supports:

- `truthy` - Value is truthy
- `falsy` - Value is falsy
- `true` - Value is exactly `true`
- `false` - Value is exactly `false`
- `equal` - Value equals `to` field
- `function` - Value is a function

For `assertArray` steps:

- `notEmpty` - Array has elements
- `undefinedOrEmpty` - Array is undefined or empty

### Example: Testing GPS Power Management

```json
{
  "app": "android",
  "setup": [{
    "id": "default",
    "steps": [
      {"t": "cmd", "js": "Bangle.setGPSPower = (on, id) => { /* mock */ }"},
      {"t": "wrap", "fn": "Bangle.setGPSPower", "id": "gpspower"},
      {"t": "cmd", "js": "eval(require('Storage').read('android.boot.js'))"}
    ]
  }],
  "tests": [{
    "description": "Check GPS power is managed correctly",
    "steps": [
      {"t": "setup", "id": "default"},
      {"t": "assert", "js": "Bangle.setGPSPower(1, 'test')", "is": "truthy"},
      {"t": "assertCall", "id": "gpspower", "count": 1}
    ]
  }]
}
```

## CI Behavior

Tests run automatically in GitHub Actions:

- **On Pull Requests**: Only apps with changed files AND a `test.json` are tested
- **On Push to master**: All apps with `test.json` are tested

### Test Results

- **SUCCESS**: All assertions passed
- **FAILURE**: One or more assertions failed
- **TIMEOUT**: Test took longer than 60 seconds (possible infinite loop)

### Uncaught Error Detection

The test runner detects uncaught errors in the emulator console output. If any of these patterns are found, the test fails:

- `Uncaught ` (with trailing space)
- `ERROR:` at the start of a line
- `ASSERT FAILED`
- Stack trace lines (pattern: `  at file:line:col`)

## Apps with Tests

Currently, these apps have functional tests:

- `android` - GPS power management (5 tests)
- `messagesoverlay` - Handler backgrounding (4 tests)
- `measuretime` - Memory usage
- `antonclk` - Memory usage

## Troubleshooting

### "You need to git clone EspruinoWebIDE"

The emulator dependency is missing. Run:

```bash
cd ..
git clone https://github.com/espruino/EspruinoWebIDE
```

### Test hangs indefinitely

Tests now have a 60-second timeout. If your test needs longer:
1. Check for infinite loops in your code
2. Check that promises are resolving
3. Consider breaking into smaller tests

### Memory tests are flaky

Memory comparison tests (`saveMemoryUsage`/`checkMemoryUsage`) can be sensitive to GC timing. Consider using tolerance or avoiding exact memory comparisons.
