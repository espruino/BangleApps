declare let exports: any;

type BleAdvert = { [key: string | number]: number[] };
type BangleWithAdvert = (typeof Bangle) & { bleAdvert?: BleAdvert | BleAdvert[]; };
type SetAdvertisingOptions = typeof NRF.setAdvertising extends (data: any, options: infer Opts) => any ? Opts : never;

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

	NRF.setAdvertising(bangle.bleAdvert, options);
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
