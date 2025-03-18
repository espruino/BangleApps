var sprite = {
	width: 47,
	height: 47,
	bpp: 3,
	transparent: 1,
	buffer: require("heatshrink").decompress(
		atob(
			"kmSpICFn/+BAwCImV//VICJuT//SogRMpmT/2SCJtSyQDB/4RMymRkmX/gRLygDC3/piVhCJElAYf/pNIkgRIlIDCl/6pVBkIRIGwWJEYPypMJCI9KGwQRBLANIPRI2CGoPkyVCBwmeyVLTYNJom8yImBz4gEqV/6Vf+g2BPwf/IIq8C/+kyVRkgDBp/5CIX/+mkz/+y/9BIOf0v6///5LdCz+kCIOk34RBYQMSp5XBGQVk/pNBAQP/9IyBxGSv4yCk/1OIK8EC4QgEpM/JgJ+EGoIRBTApQCEYvplLOFXIIdBO4SqBeQJABGoeTDQMlk5WCAAPSYQLgEz4aBlM/9IgB/7CCcAvP/QsBiVfUwOJBgUiCIcmpAVCy/+pMAKwMkRgIRCp6VBAwW6qVOgmSgPkwgRDv53E6WSuEkyEPRgmf2VJv5HBl2SgAKBwEJRgnJiVKp/Sr/0y/yBQOQv56DKwVSv2STwO/DgWD/BADmaDByRoBYoQRCgFCCIf/+jgDNwOUAwMg/kSPQbODX4IJBAwUH8B6DsmRl5oBl7OBklMyV+gBoDycSxMpiVLZwS8EAQeYyjaByR6BBIJBDAQnEIgbFCogOFRgQDBr//I4L0EAQsxAYP//5WCGQ6MCAAKbCpKYEAQiMB//kIQOUyf+CJF/CIIEBTYOfcgQRHBQv/CJKnBpP8GRTCDJIPkGRQCB5I3C/n/EZUgA"
		)
	),
};

const boxes = {
	width: 122,
	height: 56,
	bpp: 3,
	transparent: 1,
	buffer: require("heatshrink").decompress(
		atob(
			"kmZkmSpICPwgDBmQUQAQMJAYNkFiOSiQDB5JESAYQsSpADByYsSyBZBydt23bAR+wgFJkwUQAQNggGSposR23AgMkzZESwECpM2IiUAgmSFiW2gDlBFiVsgDlBFiXYgDNBL4MDWZy2FgEGWZy2FgENWZy2EL4MbWZpTBWwZfBXJpTCWwZiCWZpTBWwZiCWZsbWwhiCWZpWCWwTORWwgXRWwgXRWwZESWwZESWwZESWwYXRWwgXRW362/W362/W362/W362/W362/W362/W362/W362/W362/W362/WwuAgazOWwsAgyzOWwsAhqzOWwhfBjazNKYK2DL4K5NKYS2DMQSzNKYK2DMQSzNja2EMQSzNKwS2CZyK2EC6K2EC6K2DIiS2DIiS2DIiUAFoMAAFTkBFtckyAtrLgWSpICnLIIsqyVAgAsqpIA="
		)
	),
};

const background = {
	width: 176,
	height: 176,
	bpp: 3,
	transparent: 5,
	buffer: require("heatshrink").decompress(
		atob(
			"kmSpIC/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/ATWAgEAIP1///8iRB8gf/AAOCIPdIIARBBoJB/+E4IP4ABghB9v4CB8BB5g/92//9pB7wP/97FEIO9IgDACAAn8iVBIOlHH4xBDnA+wyY9IAAmB/BB//5B/IOQ/OAARBup5B/yV/IP5B/IP5BRt5B7/wDC7aD8/w+B+3bBgP7IP5B7HYNt23/AQPfIPX/9oCC24IDINwCBIRAAHIOACBHI3+g4EC/l/4BByAQkA//wpED//4gGAhJB3pMAgQFBgEBH3AC/AX4C/AX4C/AX4C/AX4C/AUOAgBB/v//ghB9gf///gH3UgiVIIAJBBwRB5j+CIIf8uBB5//wIIXb//+hJB6o/92/7v5B7/0/97GCIPYAG4MgIP/BjkSIP34/hB//5B/AAQ+0IP5B/IP5BN7ZB97///wCBIPX93yAB2wCB+5B5tv//dt24CB35B5v/+n/t+P/I4PH8ESIO38gFA/+CgH/+EIgiD3gACCPoMAgQ+2AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/AX4C/ASVIgAACgRB/IPY8GkAHBiRB/IPBLKgJB/IP5B/AQUAkmQghB/IP2AgEAyVAiRB/IP5BBpMAIP5B/IIUkgBB/IP5BpoAsBgJBOgEEIIoIBIP5BlyE27dt2EEIJ4CBBAlIgRBgpEAhu2IIO24ESQwxB/IJQhGkEJIL8GHwQCDgOweQpB/IKMkwAKJILVgAofYeQhBzsEAIKICLoESILmBQARBBtuwgZB3kA4B4ENIgJBcpMAIMYCDIOcAgEbHYgCGsEJkhEBE6cBIP5BZfYQ+JIIkDsEBIP5BVyEAIKtAHxgCDwBEBINk2IKCGCIKmSpECIP5BUkEBHyACD2BBUFoMJIP5BSpEbHyQCDIP5BXkmAIP5B/AQcAbKJB/ILH/AAP8hM/AgWSv4KCAAP+gmfAoXJk4ME//gpIEC8mTBgvwkgEC+QRDAAX4gVPAgP5kgsCLwWQh/kMIUf5LuFg4jBAoMBKAJ5EwF/AoUA/yFFoE/CI6RDgY+BCIQsDIP5B/IP5B/IP5B/IJ/AIJfghJBKv0EIJcAIJfwIP5BMhMAAAMEz5BGgmABoVJII9IBgUkII8kBgUSII8CoAMBhJB/IIsQoMAYoP/AAP4YpAMC/+BII9/BgXAYpAMC8DFIBgXwIIcCIP6DCgkQh/kCIRBIbQcBIJAFCgBBICI5BE/IRDFgQA="
		)
	),
};

/*const numbersDims = {
	width: 20,
	height: 44,
};*/
const numbers = [
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/ARGQKYQIDAwUEBxMAAQNAgECpMgAQMkB4IOIAQQLCgEQBwQaBgEBB1oCBBwYCCiRWDCIRWEO5wOHAX4CnA="
		)
	),
	require("heatshrink").decompress(
		atob("ikswcBkmSpIC/ARNIKYIIEwEAggOKNIQODyAHCBxQsWB3TUFgMgA4sSBwzU/AVA=")
	),
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/AQ8gKggIBAwkCBw+QCIQLCgIRCDQcQBwwyDDwUSCgVAAwIOBEwI7EpI7FBw4FDghZGHwgOEF4Y+CEYQ+DBxQADNAIAFNAIOFa/4CoA="
		)
	),
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/AQ8gKosSAwsBBw4aCoEAgQjEBoIpEBwtIBoIUEwEAggUDBwwyDDoWQA4ZWHhIIEJQoOCgI+EBwMQEAYOJO4oLBO4oRDJQrX/AU4"
		)
	),
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/ARNIKgQIDwAGBgQOJNQYOCyAHDBxEggB6BBwYDBiVABxIjBCIIODF4YOEAAkBV40QBwxiDNAosEB0IC/AUg"
		)
	),
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/AQ5UFkmQAwkCBxIdGCIIIDBxAsTgAaEkEASooOBiQOVJQgOBiBKDBxMSJQwRBLIgRCBwjX/AVA="
		)
	),
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/ARGQKgYICAwcCBxADBiQdDkEANYoOGEAYyEHYoOIHYqfFBxIdDBAMQFgZHCBysSFgwRBO46GFa/4CnA"
		)
	),
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/AQ5VGiAGFgIOIDQUgBwUCEYQOJGQYNBHAlADQgOHwEAggUDpANBCgYpBBwmQAwJiGhIjDB1gC/AU4A="
		)
	),
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/AQ8gKYYICAwcEBxGQgAaDgVJgACBDQQOJgB6CBwcAiQODHa4AEhIRBpAHDiARBwAGCgIgCFIYOCFIYOHiQrEJQxlCBwzX/AVAA="
		)
	),
	require("heatshrink").decompress(
		atob(
			"ikswcBkmSpIC/AQ8gKggIBAwkCBw+QCIQLCgIRCDQcQBzkSTAsBHYoOIL4gOCMooOENAYOCoA4EBwoqDgiGGF4gOEa/4CoA="
		)
	),
];
const digitPositions = [
	// relative to the box
	{ x: 13, y: 6 },
	{ x: 32, y: 6 },
	{ x: 74, y: 6 },
	{ x: 93, y: 6 },
];

const animation_duration = 1; // seconds
const animation_steps = 20;
const jump_height = 45; // top coordinate of the jump
const seconds_per_minute = 60;

const ClockFace = require("ClockFace");
const clock = new ClockFace({
	precision: 60, // just once a minute

	init: function() {
		// Clear the screen once, at startup
		g.setTheme({ bg: "#00f", fg: "#fff", dark: true }).clear();

		this.drawing = true;

		this.simpleDraw = function(now) {
			var boxTL_x = 27;
			var boxTL_y = 29;
			var sprite_TL_x = 72;
			var sprite_TL_y = 161 - sprite.height;
			const seconds =
				(now.getSeconds() % seconds_per_minute) + now.getMilliseconds() / 1000;
			const hours =
				this.is12Hour && now.getHours() > 12
					? now.getHours() - 12
					: now.getHours();

			const minutes = now.getMinutes();

			g.drawImage(boxes, boxTL_x, boxTL_y);
			g.drawImage(
				numbers[(hours / 10) >> 0],
				boxTL_x + digitPositions[0].x,
				boxTL_y + digitPositions[0].y
			);
			g.drawImage(
				numbers[hours % 10 >> 0],
				boxTL_x + digitPositions[1].x,
				boxTL_y + digitPositions[1].y
			);
			g.drawImage(
				numbers[(minutes / 10) >> 0],
				boxTL_x + digitPositions[2].x,
				boxTL_y + digitPositions[2].y
			);
			g.drawImage(
				numbers[minutes % 10 >> 0],
				boxTL_x + digitPositions[3].x,
				boxTL_y + digitPositions[3].y
			);
		};
	},

	pause: function() {
		this.drawing = false;
	},

	resume: function() {
		this.drawing = true;
	},

	draw: function(now) {
		if (!this.drawing) {
			this.simpleDraw(now);
			return;
		}
		g.drawImage(background, 0, 0);
		var boxTL_x = 27;
		var boxTL_y = 29;
		var sprite_TL_x = 72;
		var sprite_TL_y = 161 - sprite.height;
		const seconds =
			(now.getSeconds() % seconds_per_minute) + now.getMilliseconds() / 1000;
		const hours =
			this.is12Hour && now.getHours() > 12
				? now.getHours() - 12
				: now.getHours();

		const minutes = now.getMinutes();

		var time_advance = seconds / animation_duration;

		if (time_advance < 0.5) {
			sprite_TL_y += (jump_height - sprite_TL_y) * time_advance * 2;
		} else if (time_advance < 1) {
			sprite_TL_y =
				jump_height + (sprite_TL_y - jump_height) * (time_advance - 0.5) * 2;
		}
		const box_penetration = boxTL_y + boxes.height - sprite_TL_y;
		if (box_penetration > 0) {
			boxTL_y -= box_penetration;
		}
		g.drawImage(boxes, boxTL_x, boxTL_y);
		g.drawImage(
			numbers[(hours / 10) >> 0],
			boxTL_x + digitPositions[0].x,
			boxTL_y + digitPositions[0].y
		);
		g.drawImage(
			numbers[hours % 10 >> 0],
			boxTL_x + digitPositions[1].x,
			boxTL_y + digitPositions[1].y
		);
		g.drawImage(
			numbers[(minutes / 10) >> 0],
			boxTL_x + digitPositions[2].x,
			boxTL_y + digitPositions[2].y
		);
		g.drawImage(
			numbers[minutes % 10 >> 0],
			boxTL_x + digitPositions[3].x,
			boxTL_y + digitPositions[3].y
		);
		g.drawImage(sprite, sprite_TL_x, sprite_TL_y);
		// Bangle.drawWidgets();

		if (this.drawing) {
			const timeout =
				time_advance <= 1 ? animation_duration / animation_steps : -999;
			if (timeout > 0) {
				setTimeout((_) => {
					this.draw(new Date());
				}, timeout * 1000);
			}
		}
	},

	update: function(date, changed) {
		if (this.drawing && changed.m) {
			this.draw(date);
		}
	},
});

clock.start();
