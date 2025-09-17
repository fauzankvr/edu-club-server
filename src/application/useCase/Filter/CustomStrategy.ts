import { IDateRangeStrategy } from "./IDateRangeStrategy";

export class CustomStrategy implements IDateRangeStrategy {
  constructor(private start: Date, private end: Date) {}
  getDateRange() {
    return { startDate: this.start, endDate: this.end };
  }
}
