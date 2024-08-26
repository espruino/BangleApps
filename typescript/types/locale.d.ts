declare module Locale {
  type ShortBoolean = 0 | 1 | boolean;

  type Locale = {
    name: string,
    /**
     * @deprecated
     * There was no use case for this variable.
     * For more details, see https://github.com/espruino/BangleApps/issues/3269
     */
    currencySym: string,
    dow(date: Date, short?: ShortBoolean): string,
    month(date: Date, short?: ShortBoolean): string,
    number(n: number): string,
    /**
     * @deprecated
     * There was no use case for this method.
     * For more details, see https://github.com/espruino/BangleApps/issues/3269
     */
    currency(c: number): string,
    distance(d: number): string,
    speed(s: number): string,
    temp(t: number): string,
    translate(s: string): string,
    date(date: Date, short?: ShortBoolean): string,
    time(date: Date, short?: ShortBoolean): string,
    meridian(date: Date): string,
  }
}
