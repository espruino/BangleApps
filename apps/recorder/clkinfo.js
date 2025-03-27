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
						img: atob("GBiBAAAAABwAAD4MAH8eAH8OAH8AAD4QABx8AAD8AAH+AAE+AAM/AAN7wAN4wAB4AAB8AAD8AADOAAHGAAOHAAMDAAIBAAAAAAAAAA=="),
					} : {
						text: "Paused",
						short: "Paused",
						img: atob("GBiBAAAAAAAAAAAAAAAAAAHDgAPnwAPjwAPnwAPnwAPnwAPnwAPnwAPnwAPnwAPnwAPnwAPnwAPjwAPnwAHDgAAAAAAAAAAAAAAAAA=="),
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
