# BangleRun

An app for running sessions. Displays info and logs your run for later viewing.

## Compilation

The app is written in Typescript, and needs to be transpiled in order to be
run on the BangleJS. The easiest way to perform this step is by using the
ubiquitous [NPM package manager](https://www.npmjs.com/get-npm).

After having installed NPM for your platform, checkout the `BangleApps` repo,
open a terminal, and navigate into the `apps/banglerun` folder. Then issue:

```
npm i
```

to install the project's build tools, and:

```
npm run build
```

To build the app. The last command will generate the `app.js` file, containing
the transpiled code for the BangleJS.
