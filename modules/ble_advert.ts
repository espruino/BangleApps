declare let exports: any;

type BleAdvert = { [key: string | number]: number[] };
type BangleWithAdvert = (typeof Bangle) & { bleAdvert?: BleAdvert | BleAdvert[]; };
type SetAdvertisingOptions = typeof NRF.setAdvertising extends (data: any, options: infer Opts) => any ? Opts : never;

const clone = (obj: any): any => {
	// just for our use-case
	if(Array.isArray(obj)){
		return obj.map(clone);
	}else if(typeof obj === "object"){
		const r = {};
		for(const k in obj)
			// @ts-expect-error implicitly
			r[k] = clone(obj[k]);
		return r;
	}
	return obj;
};

exports.set = (id: string | number, advert: number[], options?: SetAdvertisingOptions) => {
	const bangle = Bangle as BangleWithAdvert;

	if(Array.isArray(bangle.bleAdvert)){
		let found = false;
		for(let ad of bangle.bleAdvert){
			if(ad[id]){
				ad[id] = advert;
				found = true;
				break;
			}
		}
		if(!found)
			bangle.bleAdvert.push({ [id]: advert });
	}else if(bangle.bleAdvert){
		bangle.bleAdvert[id] = advert;
	}else{
		bangle.bleAdvert = {
			[id]: advert,
		};
	}

	NRF.setAdvertising(clone(bangle.bleAdvert), options);
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
};

exports.remove = (id: string | number, options?: SetAdvertisingOptions) => {
	const bangle = Bangle as BangleWithAdvert;

	if(Array.isArray(bangle.bleAdvert)){
		let i = 0;
		for(const ad of bangle.bleAdvert){
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
		delete bangle.bleAdvert[id];
	}

	NRF.setAdvertising(bangle.bleAdvert, options);
};
