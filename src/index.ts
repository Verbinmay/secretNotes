import { StartFunc } from './utils/startUtils';
import { You } from './utils/you';
import { textEnd, textSMT, textStart } from './constants';

let you: any;

async function Start() {
  console.log(textStart);

  const myDate: string = await StartFunc.EnterYourDate();

  const pageTitle: string = await StartFunc.GetGitHubCalendar();

  you = new You(myDate);
  you.changeMyDate();

  const yourBadTime: Array<string> | null = await StartFunc.GetYourBadTime(
    pageTitle,
    you.timeZone,
    you.getMyDate(),
  );

  if (!yourBadTime) {
    console.log(textSMT);
    return;
  }

  const randomQuantity: number = await StartFunc.GetDatesByPercent(
    yourBadTime.length,
  );

  const arrayOfDatesForCommits: Array<string> =
    await StartFunc.ConfirmRandomDates(randomQuantity, yourBadTime);

  await StartFunc.ShowExecutionProcess(arrayOfDatesForCommits);

  console.log(textEnd);
  return;
}

Start();
