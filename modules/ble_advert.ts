declare var exports: any;

type BleAdvert = { [key: string | number]: number[] };
type BangleWithAdvert = (typeof Bangle) & { bleAdvert?: BleAdvert | BleAdvert[]; };
type SetAdvertisingOptions = typeof NRF.setAdvertising extends (data: any, options: infer Opts) => any ? Opts : never;

exports.set = (id: string | number, advert: number[], options?: SetAdvertisingOptions) => {
	const bangle = Bangle as BangleWithAdvert;

	if(Array.isArray(bangle.bleAdvert)){
		var found = false;
		for(var ad of bangle.bleAdvert){
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
		var i = 0;
		for(var ad of bangle.bleAdvert){
			if(ad[id]){
				delete ad[id];
				var empty = true;
				for(var _ in ad){
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
