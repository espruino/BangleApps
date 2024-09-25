/* tslint:disable */
/* eslint-disable */
/**
* @param {Gps} gps
*/
export function disable_elevation(gps: Gps): void;
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
* @param {boolean} autodetect_waypoints
* @returns {Gps}
*/
export function load_gps_from_string(input: string, autodetect_waypoints: boolean): Gps;
/**
* @param {number} xmin
* @param {number} ymin
* @param {number} xmax
* @param {number} ymax
* @param {boolean} ski
* @returns {Gps}
*/
export function gps_from_area(xmin: number, ymin: number, xmax: number, ymax: number, ski: boolean): Gps;
/**
*/
export class Gps {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gps_free: (a: number) => void;
  readonly disable_elevation: (a: number) => void;
  readonly get_gps_map_svg: (a: number, b: number) => void;
  readonly get_polygon: (a: number, b: number) => void;
  readonly has_heights: (a: number) => number;
  readonly get_polyline: (a: number, b: number) => void;
  readonly get_gps_content: (a: number, b: number) => void;
  readonly request_map: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number) => number;
  readonly load_gps_from_string: (a: number, b: number, c: number) => number;
  readonly gps_from_area: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly wasm_bindgen__convert__closures__invoke1_mut__h175ee3b9ff4e5b4c: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h41622a4cb7018e76: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
