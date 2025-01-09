declare module TimeUtils {
	type TimeObj = {
		d: number,
		h: number,
		m: number,
		s: number,
	};

	function encodeTime(time: TimeObj): number;

	function decodeTime(millis: number): TimeObj;

	function formatTime(value: number | TimeObj): string

	function formatDuration(value: number | TimeObj, compact?: boolean): string;

	function getCurrentTimeMillis(): number;
}
