declare module 'japanese-holidays' {
    export function isHoliday(date: Date, includeFurikae?: boolean): string | undefined;
    export function getHolidaysOfYear(year: number, includeFurikae?: boolean): { month: number; date: number; name: string }[];
}
