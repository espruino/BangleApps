declare module Messages {
	type ImageString = string;

	type EventMusicState = {
		t: "musicstate",
		state: "play" | "pause" | "stop" | "",
		position: number, // seconds
		shuffle: 0 | 1,
		repeat: 0 | 1,
	};

	type EventMusicInfo = {
		t: "musicinfo",
		artist: ImageString,
		album: ImageString,
		track: ImageString,
		dur: number, // duration
		c: number, // track count
		n: number, // track number
	};

	type Event = EventMusicState | EventMusicInfo | { t: unknown };

	type Music = EventMusicState | EventMusicInfo | {};

	var music: Music;
}
