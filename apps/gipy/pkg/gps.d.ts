/* tslint:disable */
/* eslint-disable */
/**
* @param {Gps} gps
* @returns {string}
*/
export function get_gps_map_svg(gps: Gps): string;
/**
* @param {Gps} gps
* @returns {Float64Array}
*/
export function get_polygon(gps: Gps): Float64Array;
/**
* @param {Gps} gps
* @returns {boolean}
*/
export function has_heights(gps: Gps): boolean;
/**
* @param {Gps} gps
* @returns {Float64Array}
*/
export function get_polyline(gps: Gps): Float64Array;
/**
* @param {Gps} gps
* @returns {Uint8Array}
*/
export function get_gps_content(gps: Gps): Uint8Array;
/**
* @param {Gps} gps
* @param {string} key1
* @param {string} value1
* @param {string} key2
* @param {string} value2
* @param {string} key3
* @param {string} value3
* @param {string} key4
* @param {string} value4
* @returns {Promise<void>}
*/
export function request_map(gps: Gps, key1: string, value1: string, key2: string, value2: string, key3: string, value3: string, key4: string, value4: string): Promise<void>;
/**
* @param {string} input
* @returns {Gps}
*/
export function load_gps_from_string(input: string): Gps;
/**
* @param {number} xmin
* @param {number} ymin
* @param {number} xmax
* @param {number} ymax
* @returns {Gps}
*/
export function gps_from_area(xmin: number, ymin: number, xmax: number, ymax: number): Gps;
/**
*/
export class Gps {
  free(): void;
}
