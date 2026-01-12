{
type WidHrmAdv = Widget & { userReq?: boolean };
let serviceRegistered = false;

Bangle.on('touch', (_btn, xy) => {
	const oversize = 5;

	const w = WIDGETS["hrmadv"] as WidHrmAdv | undefined;
	if(!w) return;

	const x = xy!.x;
	const y = xy!.y;

	if(w.x! - oversize <= x && x < w.x! + 14 + oversize
	&& w.y! - oversize <= y && y < w.y! + 24 + oversize)
	{
		E.stopEventPropagation();

		const wasOn = w.userReq;
		if(wasOn){
			require("ble_advert").remove(0x180d);
		}else{
			require("ble_advert").set(0x180d /*, undefined*/);
			register();
		}

		w.userReq = !wasOn;
		apply(!wasOn && NRF.getSecurityStatus().connected);
	}
});

NRF.on("connect", () => apply(!!(WIDGETS["hrmadv"] as WidHrmAdv).userReq));
NRF.on("disconnect", () => apply(0));

const apply = (userReqAndNRF: ShortBoolean) => {
	if(userReqAndNRF){
		Bangle.setHRMPower(1, "widhrmadv");
		Bangle.on("HRM", onHrm);
	}else{
		Bangle.setHRMPower(0, "widhrmadv");
		Bangle.removeListener("HRM", onHrm);
	}

	const w = WIDGETS["hrmadv"] as WidHrmAdv | undefined;
	w?.draw(w);
};

const onHrm = (hrmObj: { bpm: number, confidence: number }) => {
	if(hrmObj.confidence < 70) return;

	try{
		NRF.updateServices({
			0x180d: {
				0x2a37: {
					// Bit 0   - Format: 0: uint8, 1: uint16
					// Bit 1   - Contact in bit 2, so 0_: unknown,
					// Bit 2   - ^ ... 01: no contact, 11: contact
					// Bit 3   - Energy Expended: bit == present (after the uint8/uint16)
					// Bit 4   - RR-Interval: 1: uint16s at the end
					value: [6, hrmObj.bpm],
					notify: true,
				},
			},
		});
	}catch(e){
		if(("" + e).indexOf("until BLE restart") === -1)
			throw e;
	}
};

const register = () => {
	if(serviceRegistered) return;

	try{
		NRF.setServices({
			0x180d: {
				0x2a37: {
					value: [6, 0] as unknown as string, // type hack
					notify: true,
				},
			},
		});
		serviceRegistered = true;
	}catch(e){
		console.error("widhrmadv:", e);
	}
};

WIDGETS["hrmadv"] = {
	area: "tr",
	sortorder: -10,
	width: 14,
	draw: function(w) {
		const hrm = Bangle.isHRMOn();
		const { userReq } = w as WidHrmAdv;

		g
			.reset()
			.setColor(
				hrm && userReq
				? "#f00"
				: userReq
				? "#00f"
				: "#555"
			)
			.drawImage(
				atob("CgoCAAABpaQ//9v//r//5//9L//A/+AC+AAFAA=="),
				w.x!,
				w.y!,
				{ scale: 1.5 },
			);
	},
};

register();
}
