declare let exports: any;
//declare let BLE_DEBUG: undefined | true;

type BleAdvertObj = { [key: string | number]: number[] };
type BleAdvert = BleAdvertObj | number[];
type BangleWithAdvert = (typeof Bangle) & { bleAdvert?: BleAdvert | BleAdvert[]; };
type SetAdvertisingOptions = typeof NRF.setAdvertising extends (data: any, options: infer Opts) => any ? Opts : never;

const advertise = (options: SetAdvertisingOptions) => {
	const clone = (obj: any): any => {
		// just for our use-case
		if(Array.isArray(obj)){
			return obj.map(clone);
		}else if(typeof obj === "object"){
			const r = {};
			for(const k in obj){
				// @ts-expect-error implicitly
				r[k] = clone(obj[k]);
			}
			return r;
		}
		return obj;
	};
  /* 2v26 added manufacturer=0x0590 by default, but if we're advertising
  extra stuff we'll want to explicitly remove that so there's space */
  if (process.env.VERSION >= "2.26") {
    options = options||{};
    if (!options.manufacturer) options.manufacturer=false;
  }

	// clone the object, to avoid firmware behaving like so:
	// bleAdvert = [Uint8Array, { [0x180f]: ... }]
	//              ^           ^
	//              |           |
	//              |           +- added by this call
	//              +- modified from a previous setAdvertising()
	//
	// The firmware (jswrap_ble_setAdvertising) will convert arrays within
	// the advertising array to Uint8Array, but if this has already been done,
	// we get iterator errors. So we clone the object to avoid these mutations
	// taking effect for later calls.
	//
	// This also allows us to identify previous adverts correctly by id.
  try {
		NRF.setAdvertising(clone((Bangle as BangleWithAdvert).bleAdvert), options);
  } catch (e) {
		console.log("ble_advert error", e);
  }
};

const manyAdv = (bleAdvert: BleAdvert | BleAdvert[] | undefined): bleAdvert is BleAdvert[] => {
	return Array.isArray(bleAdvert) && typeof bleAdvert[0] === "object";
};

exports.set = (id: string | number, advert: number[], options?: SetAdvertisingOptions) => {
	const bangle = Bangle as BangleWithAdvert;

	if(manyAdv(bangle.bleAdvert)){
		let found = false;
		let obj;
		for(let ad of bangle.bleAdvert){
			if(Array.isArray(ad)) continue;
			obj = ad;
			if(ad[id]){
				ad[id] = advert;
				found = true;
				// if(typeof BLE_DEBUG !== "undefined")
				// 	console.log(`bleAdvert is array, found existing entry for ${id}, replaced`)
				break;
			}
		}
		if(!found){
			if(obj)
				obj[id] = advert;
			else
				bangle.bleAdvert.push({ [id]: advert });
			// if(typeof BLE_DEBUG !== "undefined")
			// 	console.log(`bleAdvert is array, no entry for ${id}, created`)
		}
	}else if(bangle.bleAdvert){
		// if(typeof BLE_DEBUG !== "undefined")
		// 	console.log(`bleAdvert is object, ${id} entry ${id in bangle.bleAdvert ? "replaced" : "created"}`);
		if(Array.isArray(bangle.bleAdvert)){
			bangle.bleAdvert = [bangle.bleAdvert, { [id]: advert }];
		}else{
			bangle.bleAdvert[id] = advert;
		}
	}else{
		// if(typeof BLE_DEBUG !== "undefined")
		// 	console.log(`bleAdvert not present, created`);
		bangle.bleAdvert = { [id]: advert };
	}

	// if(typeof BLE_DEBUG !== "undefined")
	// 	console.log(`NRF.setAdvertising({ ${Object.keys(bangle.bleAdvert).join(", ")} }, ${JSON.stringify(options)})`);

	advertise(options);
};

exports.push = (adv: number[], options?: SetAdvertisingOptions) => {
	const bangle = Bangle as BangleWithAdvert;

	if(manyAdv(bangle.bleAdvert)){
		bangle.bleAdvert.push(adv);
	}else if(bangle.bleAdvert){
		bangle.bleAdvert = [bangle.bleAdvert, adv];
	}else{
		// keep a second entry for normal/original advertising as well as this extra one
		bangle.bleAdvert = [adv, {}];
	}

	advertise(options);
};

/*
exports.remove = (id: string | number, options?: SetAdvertisingOptions) => {
	const bangle = Bangle as BangleWithAdvert;

	// if(typeof BLE_DEBUG !== "undefined")
	// 	console.log(`ble_advert.remove(${id}, ${JSON.stringify(options)})`);

	if(manyAdv(bangle.bleAdvert)){
		let i = 0;
		for(const ad of bangle.bleAdvert){
			if(Array.isArray(ad)) continue;
			if(ad[id]){
				delete ad[id];
				let empty = true;
				// eslint-disable-next-line no-unused-vars
				for(const _ in ad){
					empty = false;
					break;
				}
				if(empty) bangle.bleAdvert.splice(i, 1);
				break;
			}
			i++;
		}
	}else if(bangle.bleAdvert){
		if(!Array.isArray(bangle.bleAdvert))
			delete bangle.bleAdvert[id];
	}

	advertise(options);
};
*/
