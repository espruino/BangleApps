type FileData = string | Array<any> | Object;

declare interface Storage {
  compact: () => void;
  erase: (name: string) => void;
  eraseAll: () => void;
  getFree: () => number;
  hash: (regex?: RegExp) => number; // More specifically it returns Uint32
  list: (regex?: RegExp, filter?: { sf: boolean }) => string[];
  open: (name: string, mode: "r" | "w" | "a") => StorageFile;
  read: (name: string, offset?: number, length?: number) => string | undefined;
  readArrayBuffer: (name: string) => ArrayBuffer | undefined;
  readJSON: (name: string, noExceptions?: boolean) => any;
  write: (
    name: string,
    data: FileData,
    offset?: number,
    size?: number
  ) => boolean;
  writeJSON: (name: string, data: any) => boolean;
}

declare interface StorageFile {
  erase: () => void;
  getLength: () => number;
  read: (len: number) => string | undefined;
  readLine: () => string | undefined;
  write: (data: FileData) => string;
}
