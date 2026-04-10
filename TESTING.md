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

For available step types and assert conditions, see the inline documentation in `bin/runapptests.js`.

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
