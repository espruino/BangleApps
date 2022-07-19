declare type SPI = {
  find(pin: Pin): SPIInstance | undefined;
  new (): SPIInstance;
};

type TOrArray<T> = T | TOrArray<T>[];
type TArrObj<T> = T | TArrObj<T>[] | { data: TArrObj<T>; count: number };
type NumStrArr = TOrArray<number | string>;

declare type SPIInstance = {
  send(data: TArrObj<number | string>, nss_pin: number): any;
  send4bit(data: NumStrArr, bit0: number, bit1: number, nss_pin: number): void;
  send8bit(data: NumStrArr, bit0: number, bit1: number, nss_pin: number): void;
  setup(options: {
    sck?: Pin;
    miso?: Pin;
    mosi?: Pin;
    baud?: number;
    mode?: 0 | 1 | 2 | 3;
    order?: "msb" | "lsb";
    bits?: number;
  }): void;
  write(...data: Array<Data | Pin>): void;
};
