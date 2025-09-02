(function () {
	return {
		name: "Bangle",
		items: [
			{
				name: "Toggle",
				get: function(){
					return require("recorder").isRecording() ? {
						text: "Recording",
						short: "Rec",
						img: atob("GBiBAAAAABwAAD4MAH8eAH8eAH8cAD4YABx8AAD8AAH+AAG+AAM/AAN7wAN4wAB4AAB8AAD8AADOAAHGAAOHAAMDAAIBAAAAAAAAAA=="),
					} : {
						text: "Paused",
						short: "Paused",
						img: atob("GBiBAAAAAAAAADYMADYeADYeADYcADYYAAB8AAD8AAH+AAG+AAM/AAN7wAN4wAB4AAB8AAD8AADOAAHGAAOHAAMDAAIBAAAAAAAAAA=="),
					};
				},
				run: function() {
					const recorder = require("recorder");
					recorder.setRecording(!recorder.isRecording(), { force: "append" }).then(() => this.emit("redraw"));
					return true; // buzz
				},
				show: function() {},
				hide: function() {},
			},
		],
	};
})
