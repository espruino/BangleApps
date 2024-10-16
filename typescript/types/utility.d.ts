type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
