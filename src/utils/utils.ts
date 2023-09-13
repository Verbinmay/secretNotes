import Chance from 'chance';

export function _extractDate(str: string, timeZone: string): string {
  const chance = new Chance();
  const stringF = str.split(',');
  const date = new Date(`${stringF[1]} ${stringF[2]}`);
  date.setHours(chance.integer({ min: 0, max: 24 }));
  date.setMinutes(chance.integer({ min: 0, max: 60 }));
  date.setSeconds(chance.integer({ min: 0, max: 60 }));
  const formattedDate = date
    .toISOString()
    .replace('.000Z', '')
    .concat(timeZone);

  return formattedDate;
}
