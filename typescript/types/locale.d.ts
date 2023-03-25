declare module Locale {
  type ShortBoolean = 0 | 1 | boolean;

  type Locale = {
    name: string,
    currencySym: string,
    dow(date: Date, short?: ShortBoolean): string,
    month(date: Date, short?: ShortBoolean): string,
    number(n: number): string,
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
