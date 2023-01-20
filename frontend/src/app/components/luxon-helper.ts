const parser = require('any-date-parser');
const { DateTime } = require('luxon') as typeof import('luxon');

// tslint:disable-next-line:no-any
export function DateTimeFrom(date?: any) {
  if (!date) {
    return DateTime.now();
  }
  if (date instanceof DateTime) {
    return date;
  }
  if (date instanceof Date) {
    return DateTime.fromJSDate(date);
  }
  if (typeof date === 'number') {
    return DateTime.fromMillis(date);
  }
  if (typeof date === 'object') {
    return DateTime.fromObject(date);
  }
  date = parser.fromString(date);
  if (date.invalid) {
    return DateTime.invalid(date.invalid);
  }
  return DateTime.fromJSDate(date);
}
