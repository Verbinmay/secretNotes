import {
  textErrorDate,
  textYYYY,
  textMM,
  textDD,
  textAskData,
  TextPossibleCommits,
  textCommit,
  textDone,
} from '../constants';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { log } from 'console';
import jsonfile from 'jsonfile';
import * as readline from 'node:readline/promises';
import simpleGit from 'simple-git';

import { _extractDate } from './utils';

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
    return madeChoice !== 'n';
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
    pageTitle: string,
    timeZone: string,
    startDate: string,
  ) {
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

  static async GetTbody(gitHub: string) {
    const response: AxiosResponse<any, any> = await axios.get(gitHub);
    const $: cheerio.CheerioAPI = cheerio.load(response.data);
    const pageTitle: string = $('tbody').text();
    return pageTitle;
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
      setTimeout(() => {
        console.log('перерыв');
      }, 3000);
    }
    return textDone;
  }
}
