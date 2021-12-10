# BangleTS

A generic project setup for compiling apps from Typescript to Bangle.js ready, readable Javascript.
It includes types for _some_ of the modules and globals that are exposed for apps to use.
The goal is to have types for everything, but that will take some time. Feel free to help out by contributing!

## Using the types

TODO

## Compilation

Install [npm](https://www.npmjs.com/get-npm) if you haven't already.
Make sure you are using version ^8 by running `npm -v`. If the version is incorrect, run `npm i -g npm@^8`.

After having installed npm for your platform, open a terminal, and navigate into the `/typescript` folder. Then run:

```
npm ci
```

to install the project's build tools, and:

```
npx tsc ../apps/relativePathToYourApp/app.ts --outDir ../apps/relativePathToYourApp/dist
```

To build your app. The last command will generate the `app.js` file containing the transpiled code for the BangleJS.
