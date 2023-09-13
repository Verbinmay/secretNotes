import {
  textAskDates,
  textAskGitHub,
  textError,
  textGitHub,
  textPercent,
} from '../constants';
import { Program } from './programUtils';

export class StartFunc extends Program {
  static async GetGitHubCalendar(): Promise<string> {
    let controlYourChose: boolean = false;
    let githubLink: string = '';
    let pageTitle: string = '';

    do {
      githubLink = await Program.MakeMessage(textGitHub);
      controlYourChose = await Program.CheckYourOpinion(
        textAskGitHub,
        githubLink,
      );
      if (controlYourChose) {
        try {
          pageTitle = await Program.GetTbody(githubLink);
        } catch (e) {
          controlYourChose = false;
        }
      }
    } while (!controlYourChose);
    return pageTitle;
  }

  static async GetExpectingPercent() {
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
    return percent;
  }

  static async GetQuantity(
    arrayLength: number,
    percent: number,
  ): Promise<number> {
    return Math.round((arrayLength / 100) * percent);
  }

  static async ConfirmRandomDates(
    randomQuantity: number,
    yourBadTime: Array<string>,
  ): Promise<Array<string>> {
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
    } while (!yourChose);
    return arrayOfDatesForCommits;
  }
  static async ShowExecutionProcess(arrayOfDatesForCommits: Array<string>) {
    try {
      const answer = await Program.PushCommits(arrayOfDatesForCommits);
      console.log(answer);
    } catch (e) {
      console.log(textError);
    }
  }
  static async GetDatesByPercent(yourBadTimeLength: number) {
    let randomQuantity: number = 0;

    do {
      const percent: number = await StartFunc.GetExpectingPercent();
      randomQuantity = await StartFunc.GetQuantity(yourBadTimeLength, percent);
    } while (randomQuantity === 0);
    return randomQuantity;
  }
}
