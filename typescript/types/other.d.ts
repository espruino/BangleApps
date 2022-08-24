// Required for TypeScript to work properly
interface NewableFunction extends Function {}
interface CallableFunction extends Function {}
interface IArguments {
  [index: number]: any;
  length: number;
  callee: Function;
}

// Helper type
type Exclude<T, U> = T extends U ? never : T;
