import moment from 'moment';

export class You {
  constructor(isoString: string) {
    this.yourDate = isoString;
  }
  private yourDate: string;
  public timeZone?: string;
  changeMyDate() {
    const timeZone = moment().format().slice(-6);
    this.timeZone = timeZone;
    this.yourDate = this.yourDate.split('.000Z')[0].concat(timeZone);
  }

  getMyDate() {
    return this.yourDate;
  }
}
