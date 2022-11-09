/* tslint:disable */
/* eslint-disable */
/**
* @param {GpcSvg} gpcsvg
* @returns {Uint8Array}
*/
export function get_gpc(gpcsvg: GpcSvg): Uint8Array;
/**
* @param {GpcSvg} gpcsvg
* @returns {Uint8Array}
*/
export function get_svg(gpcsvg: GpcSvg): Uint8Array;
/**
* @param {string} input_str
* @returns {Promise<GpcSvg>}
*/
export function convert_gpx_strings(input_str: string): Promise<GpcSvg>;
/**
*/
export class GpcSvg {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gpcsvg_free: (a: number) => void;
  readonly get_gpc: (a: number, b: number) => void;
  readonly get_svg: (a: number, b: number) => void;
  readonly convert_gpx_strings: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd2f17bb90cba0d93: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__ha56d9ea2ef931412: (a: number, b: number, c: number, d: number) => void;
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
