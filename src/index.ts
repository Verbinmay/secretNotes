import {
  TextPossibleCommits,
  textAskData,
  textAskDates,
  textAskGitHub,
  textCommit,
  textDD,
  textDone,
  textEnd,
  textError,
  textErrorDate,
  textGitHub,
  textMM,
  textPercent,
  textSMT,
  textStart,
  textYYYY,
} from './constants';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { log } from 'console';
import jsonfile from 'jsonfile';
import moment from 'moment';
import * as readline from 'node:readline/promises';
import simpleGit from 'simple-git';

import { _extractDate } from './utils';

let you: any;

async function Start() {
  console.log(textStart);

  const myDate: string = await Program.EnterYourDate();
  let controlYourChose: boolean;
  let githubLink: string;

  do {
    githubLink = await Program.MakeMessage(textGitHub);
    controlYourChose = await Program.CheckYourOpinion(
      textAskGitHub,
      githubLink,
    );
  } while (controlYourChose === false);

  you = new You(myDate, githubLink);
  you.changeMyDate();

  const yourBadTime: Array<string> | null = await Program.GetYourBadTime(
    you.getMyGithubLink(),
    you.timeZone,
    you.getMyDate(),
  );

  if (!yourBadTime) {
    console.log(textSMT);
    return;
  }

  let percent: any;

  do {
    const input = await Program.MakeMessage(textPercent);
    try {
      const checkNum = Number(input);
      if (100 >= checkNum && checkNum >= 0) {
        percent = Math.round(checkNum);
      }
    } catch (e) {
      return;
    }
  } while (!percent);

  if (percent !== 100 && percent !== 0) {
    const randomQuantity: number = Math.round(
      (yourBadTime.length / 100) * percent,
    );
    let yourChose: boolean = false;
    let arrayOfDatesForCommits: Array<string>;

    do {
      arrayOfDatesForCommits = Program.RandomDatesByCommits(
        randomQuantity,
        yourBadTime,
      );
      yourChose = await Program.CheckYourOpinion(
        textAskDates,
        arrayOfDatesForCommits.join('\n'),
      );
    } while (yourChose === false);

    try {
      const answer = await Program.PushCommits(arrayOfDatesForCommits);
      console.log(answer);
    } catch (e) {
      console.log(textError);
    }
  }
  console.log(textEnd);
}
Start();

export class You {
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
export class Program {
  static async MakeMessage(text: string): Promise<string> {
    const rl: readline.Interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const message: string = await rl.question(text);

    rl.close();
    return message;
  }

  static CheckYourStartDay(yyyy: string, m: string, d: string): string | null {
    try {
      const checkYourDate = new Date(
        Number(yyyy),
        Number(m) - 1,
        Number(d) + 1,
      ).toISOString();
      if (checkYourDate > new Date().toISOString()) {
        log(textErrorDate);
        throw new Error();
      }
      return checkYourDate;
    } catch (e) {
      return null;
    }
  }
  static async CheckYourOpinion(
    text: string,
    result: string,
  ): Promise<boolean> {
    const madeChoice: string = await this.MakeMessage(
      `${text.concat(result)} : `,
    );
    return madeChoice !== 'n' ? true : false;
  }

  static async EnterYourDate() {
    let result: string | null;

    do {
      const year: string = await this.MakeMessage(textYYYY);
      const month: string = await this.MakeMessage(textMM);
      const day: string = await this.MakeMessage(textDD);
      result = this.CheckYourStartDay(year, month, day);
      if (result) {
        const controlYourChose: boolean = await this.CheckYourOpinion(
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

  static async GetYourBadTime(
    gitHub: string,
    timeZone: string,
    startDate: string,
  ) {
    const response: AxiosResponse<any, any> = await axios.get(gitHub);
    const $: cheerio.CheerioAPI = cheerio.load(response.data);
    const pageTitle: string = $('tbody').text();
    try {
      const array: Array<string> = pageTitle.split('\n');
      const noContributionArray: Array<string> = array.filter((s) => {
        return s.includes('No contributions');
      });

      const changedFormatNoContArray: Array<string> = noContributionArray.map(
        (s) => {
          return _extractDate(s, timeZone);
        },
      );
      const daysOfPossibleCommits: Array<string> =
        changedFormatNoContArray.filter((d) => d >= startDate);

      log(daysOfPossibleCommits.sort(), TextPossibleCommits);
      return daysOfPossibleCommits.length !== 0 ? daysOfPossibleCommits : null;
    } catch (e) {
      return null;
    }
  }

  static RandomDatesByCommits(
    quantity: number,
    yourBadTime: Array<string>,
  ): Array<string> {
    const yourDate: Array<string> = [];
    while (yourDate.length < quantity) {
      const randomIndex = Math.floor(Math.random() * yourBadTime.length);
      const randomElement = yourBadTime[randomIndex];

      if (!yourDate.includes(randomElement)) {
        yourDate.push(randomElement);
      }
    }
    return yourDate;
  }

  static async PushCommits(arrayOfDates: Array<string>) {
    const FILE_PATH = './data.json';
    for (let i = 0; i < arrayOfDates.length; i++) {
      const dateInArray = arrayOfDates[i];
      const data = { date: dateInArray };
      await jsonfile.writeFile(FILE_PATH, data);
      simpleGit()
        .add([FILE_PATH])
        .commit(dateInArray, { '--date': dateInArray })
        .push();
      console.log(`${textCommit} ${dateInArray}`);
    }
    return textDone;
  }
}
