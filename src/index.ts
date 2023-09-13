import {
  textAskData,
  textAskGitHub,
  textDD,
  textError,
  textGitHub,
  textMM,
  textYYYY,
} from './constants';
import axios, { AxiosResponse } from 'axios';
import Chance from 'chance';
import * as cheerio from 'cheerio';
import { log } from 'console';
import jsonfile from 'jsonfile';
import moment from 'moment';
import * as readline from 'node:readline/promises';
import random from 'random';
import simpleGit from 'simple-git';

import { _extractDate } from './utils';

///////////////////////

class You {
  constructor(isoString: string, githubLink: string) {
    this.yourDate = isoString;
    this.githubLink = githubLink;
  }
  private yourDate: string;
  private githubLink: string;
  public timeZone?: string;
  changeMyDate() {
    const timeZone = moment().format().slice(-6);
    this.timeZone = timeZone;
    this.yourDate = this.yourDate.split('.000Z')[0].concat(timeZone);
  }
  changeMyGitHub(link: string) {
    this.githubLink = link.toString();
  }
  getMyDate() {
    return this.yourDate;
  }
  getMyGithubLink() {
    return this.githubLink;
  }
}

async function MakeMessage(text: string): Promise<string> {
  const rl: readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const message: string = await rl.question(text);

  rl.close();
  return message;
}

function CheckYourStartDay(yyyy: string, m: string, d: string): string | null {
  try {
    const checkYourDate = new Date(
      Number(yyyy),
      Number(m) - 1,
      Number(d) + 1,
    ).toISOString();
    if (checkYourDate > new Date().toISOString()) {
      log(textError);
      throw new Error();
    }
    return checkYourDate;
  } catch (e) {
    return null;
  }
}
async function CheckYourOpinion(
  text: string,
  result: string,
): Promise<boolean> {
  const madeChoice: string = await MakeMessage(`${text.concat(result)} : `);
  return madeChoice !== 'n' ? true : false;
}

async function EnterYourDate() {
  let result: string | null;

  do {
    const year: string = await MakeMessage(textYYYY);
    const month: string = await MakeMessage(textMM);
    const day: string = await MakeMessage(textDD);
    result = CheckYourStartDay(year, month, day);
    if (result) {
      const controlYourChose: boolean = await CheckYourOpinion(
        textAskData,
        result,
      );
      if (!controlYourChose) {
        result = null;
      }
    }
  } while (!result);

  return result;
}

let you: any;
(async () => {
  const myDate: string = await EnterYourDate();
  let controlYourChose: boolean;
  let githubLink: string;
  do {
    githubLink = await MakeMessage(textGitHub);
    controlYourChose = await CheckYourOpinion(textAskGitHub, githubLink);
  } while (controlYourChose === false);

  you = new You(myDate, githubLink);
  you.changeMyDate();

  GetYourBadTime(you.getMyGithubLink(), you.timeZone, you.getMyDate());
})();

async function GetYourBadTime(
  gitHub: string,
  timeZone: string,
  startDate: string,
) {
  const response: AxiosResponse<any, any> = await axios.get(gitHub);
  const $: cheerio.CheerioAPI = cheerio.load(response.data);
  const pageTitle: string = $('tbody').text();
  const array: Array<string> = pageTitle.split('\n');
  const filteredArray: Array<string> = array.filter((s) => {
    return s.includes('No contributions');
  });

  // Применяем функцию к каждой строке в массиве
  const dates: Array<string | null> = filteredArray.map((s) => {
    return _extractDate(s, timeZone);
  });

  const result = dates.filter((d) => d != null).filter((d) => d > startDate);
  log(result);
  return result;
}

////////////////////

// // const FILE_PATH = './data.json';

// // const DATE = moment().subtract(4, 'd').format();
// // const data = { date: DATE };

// // jsonfile.writeFile(FILE_PATH, data);

// // simpleGit().add([FILE_PATH]).commit(DATE, { '--date': DATE }).push();

// const url = 'https://github.com/Verbinmay';

// // Выполнение GET-запроса к странице
// axios.get(url).then((response) => {
//   // Парсинг HTML-кода с использованием cheerio

//   const $ = cheerio.load(response.data);
//   const pageTitle = $('tbody').text();
//   const array = pageTitle.split('\n');
//   const filteredArray = array.filter((s) => {
//     return s.includes('No contributions');
//   });
//   const chance = new Chance();

//   const dateRegex = /\w+,\s(\w+)\s(\d+),\s(\d{4})/;

//   function extractDate(str: string) {
//     const match = str.match(dateRegex);
//     if (match) {
//       const month = match[1];
//       const day = match[2];
//       const year = match[3];

//       const date = new Date(`${month} ${day} ${year}`);
//       date.setHours(chance.integer({ min: 0, max: 24 }));
//       date.setMinutes(chance.integer({ min: 0, max: 60 }));
//       date.setSeconds(chance.integer({ min: 0, max: 60 }));
//       const formattedDate = date
//         .toISOString()
//         .replace('.000Z', '')
//         .concat('+04:00');

//       return formattedDate;
//     }
//     return null; // Если дата не найдена
//   }

//   // Применяем функцию к каждой строке в массиве
//   const dates = filteredArray.map((s) => {
//     return extractDate(s);
//   });
// });
