// TODO: fastload
const oldRead = require("Storage").readJSON;
let cache;

const ensureCache = () => {
	if(!cache){
		cache = oldRead("popcon.cache.json", 1);
		if(!cache)
			cache = {};
	}
};

const saveCache = () => {
	require("Storage").writeJSON("popcon.cache.json", cache);
};

const sortCache = () => {
	// TODO
};

require("Storage").readJSON = (fname, skipExceptions) => {
	const j = oldRead(fname, skipExceptions);

	if(fname.test(/\.info$/)){
		ensureCache();

		if(j.src && cache[j.src]?.sortorder)
			j.sortorder = cache[j.src].sortorder;
	}

	return j;
} satisfies typeof oldRead;

const oldLoad = load;
load = (src) => {
	ensureCache();
	cache[src].pop++;
	cache[src].last = Date.now();
	sortCache();
	saveCache();

	return oldLoad(src);
};
