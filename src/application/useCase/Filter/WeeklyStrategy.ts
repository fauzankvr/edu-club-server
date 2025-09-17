import { IDateRangeStrategy } from "./IDateRangeStrategy";

export class WeeklyStrategy implements IDateRangeStrategy {
  getDateRange() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return { startDate: oneWeekAgo };
  }
}
