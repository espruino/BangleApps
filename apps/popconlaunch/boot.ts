(() => {
type Timestamp = number;
type Cache = {
	[key: string]: {
		sortorder: number,
		pop: number, // amount of launches
		last: Timestamp,
	}
};

const oldRead = require("Storage").readJSON;
const oneMonth = 1000 * 86400 * 28;
const monthAgo = Date.now() - oneMonth;
let cache: undefined | Cache;

const ensureCache = (): NonNull<typeof cache> => {
	if(!cache){
		cache = oldRead("popcon.cache.json", true) as Cache | undefined;
		if(!cache)
			cache = {};
	}
	return cache;
};

const trimCache = (cache: Cache) => {
	const threeMonthsBack = Date.now() - oneMonth * 3;
	const del = [];
	for(const k in cache)
		if(cache[k]!.last < threeMonthsBack)
			del.push(k);

	for(const k of del)
		delete cache[k];
};

const saveCache = (cache: Cache, orderChanged: boolean) => {
	trimCache(cache);
	require("Storage").writeJSON("popcon.cache.json", cache);
	if(orderChanged){
		// ensure launchers reload their caches:
		const info = (oldRead("popconlaunch.info", true) as undefined | AppInfo & { cacheBuster?: boolean }) || {cacheBuster:true};
		info.cacheBuster = !info.cacheBuster;
		require("Storage").writeJSON("popconlaunch.info", info);
	}
};

const sortCache = () => {
	const ents = Object.values(cache);

	ents.sort((a, b) => {
		// group the most recently launched apps in the last month,
		// then sort by launch count
		// then by name
		let n;

		const am = (a.last > monthAgo) as unknown as number;
		const bm = (b.last > monthAgo) as unknown as number;
		n = bm - am;
		if(n) return n;

		n = b.pop - a.pop;
		if(n) return n;

		// pops are the same, sort by most recent
		n = b.last - a.last;
		if(n) return n;

		if(a.name<b.name) return -1;
		if(a.name>b.name) return 1;
		return 0;
	});

	let i = 0;
	let orderChanged = false;
	for(const ent of ents){
		if(ent.sortorder !== i) orderChanged = true;
		ent.sortorder = i++;
	}
	return orderChanged;
};

require("Storage").readJSON = ((fname, skipExceptions) => {
	const j = oldRead(fname, skipExceptions) as AppInfo | undefined;
	// technically only AppInfo if we're "*.info" ^

	if(j && /\.info$/.test(fname)){
		const cache = ensureCache();
		let so;

		if(j.src && (so = cache[j.src]?.sortorder) != null)
			j.sortorder = so;
		else
			j.sortorder = 99;
	}

	return j;
}) satisfies typeof oldRead;

const oldLoad = load;
global.load = (src: string) => {
	if(src){
		const cache = ensureCache();
		const ent = cache[src] ||= {
			pop: 0,
			last: 0,
			sortorder: -10,
		};
		ent.pop++;
		ent.last = Date.now();
		const orderChanged = sortCache();
		saveCache(cache, orderChanged);
	}

	return oldLoad(src);
};
})()
