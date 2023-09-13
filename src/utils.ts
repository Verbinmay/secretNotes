import Chance from 'chance';

export function _extractDate(str: string, timeZone: string) {
  const chance = new Chance();
  const dateRegex = /\w+,\s(\w+)\s(\d+),\s(\d{4})/;
  const match = str.match(dateRegex);
  if (match) {
    const month = match[1];
    const day = match[2];
    const year = match[3];

    const date = new Date(`${month} ${day} ${year}`);
    date.setHours(chance.integer({ min: 0, max: 24 }));
    date.setMinutes(chance.integer({ min: 0, max: 60 }));
    date.setSeconds(chance.integer({ min: 0, max: 60 }));
    const formattedDate = date
      .toISOString()
      .replace('.000Z', '')
      .concat(timeZone);

    return formattedDate;
  }
  return null; // Если дата не найдена
}
