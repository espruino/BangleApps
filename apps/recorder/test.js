let writes = {};
let testDate, now;
let files;

const testDateStamp = () => `${testDate.getYear() + 1900}${testDate.getMonth() + 1}${testDate.getDate()}`;

const mockStorage = {
	readJSON(f, err) {
		if(f === "recorder.json"){
			return {};
		}
		throw new Error(`unimplemented readJSON(${args})`);
	},
	writeJSON(fname, json) {
		if(!writes[fname])
			writes[fname] = [];
		writes[fname].push(json);
	},
	list(re) {
		let files = [
			"recorder.json",
			"recorder.log20230802a.csv\1",
			`recorder.log${testDateStamp()}a.csv\x01`,
			"recorder.log20181219a.csv\1",
			"abc",
		];

		if (re)
			files = files.filter(f => re.test ? re.test(f) : re === f);
		return files;
	},
	read(...args) {
		throw new Error(`unimplemented read(${args})`);
	},
	write(...args) {
		throw new Error(`unimplemented write(${args})`);
	},
	open(f, mode) {
		f = f.replace(/\1$/, "");

		const lines = files[f] || [];

		return {
			readLine() {
				return lines.shift() || "";
			}
		}
	},
};

const assertEq = (a, b) => {
	if(typeof a !== typeof b)
		throw new Error("type mismatch");
	if(typeof a !== "string")
		throw new Error("unimplemented");
	if(a !== b)
		throw new Error(`string mismatch, ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
}

require = (origRequire => req => {
	if (req === "Storage") {
		return mockStorage;
	}
	return origRequire(req);
})(require);

Date = (OrigDate => function(...args) {
	if (args.length === 0) {
		// new Date(), pretend the time is what we're testing
		return new OrigDate(now);
	}
	return new OrigDate(...args);
})(Date);

Bangle = {
	removeListener(){},
	drawWidgets(){},
}
WIDGETS = {};
const w = require("fs").readFileSync("./widget.js", "utf8");
eval(w);

let file;

/*
 * if it's almost midnight but we have a recording
 * from ~15 mins ago, we select it
 */
testDate = new Date("2023-11-23T23:45:00.000Z");
now = new Date("2023-11-23T23:59:00.000Z");
files = {
	[`recorder.log${testDateStamp()}a.csv`]: [
		"Time,Steps",
		"2023-12-20T19:27:45.000Z,9",
		testDate.toISOString() + ",21",
	],
};
writes = {};

WIDGETS["recorder"].setRecording(true);

file = writes["recorder.json"][0].file;
assertEq(file, `recorder.log20231123a.csv`);

/*
 * if it's past midnight but we have a recording
 * from ~15 mins ago, we select it
 */
testDate = new Date("2023-11-23T23:45:00.000Z");
now = new Date("2023-11-24T00:01:00.000Z");
files = {
	[`recorder.log${testDateStamp()}a.csv`]: [
		"Time,Steps",
		"2023-12-20T19:27:45.000Z,9",
		testDate.toISOString() + ",21",
	],
};
writes = {};

WIDGETS["recorder"].setRecording(true);

file = writes["recorder.json"][0].file;
assertEq(file, `recorder.log20231123a.csv`);

/*
 * if it's a fair bit after the last recording,
 * we pick a new one
 */
testDate = new Date("2023-11-23T23:45:00.000Z");
now = new Date("2023-11-24T03:45:00.000Z"); // just over the 4 hour limit
files = {
	[`recorder.log${testDateStamp()}a.csv`]: [
		"Time,Steps",
		"2023-12-20T19:27:45.000Z,9",
		testDate.toISOString() + ",21",
	],
};
writes = {};

WIDGETS["recorder"].setRecording(true);

file = writes["recorder.json"][0].file;
assertEq(file, `recorder.log20231124a.csv`);
