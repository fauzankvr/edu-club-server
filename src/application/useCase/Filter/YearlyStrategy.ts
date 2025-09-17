import { IDateRangeStrategy } from "./IDateRangeStrategy";

export class YearlyStrategy implements IDateRangeStrategy {
  getDateRange() {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5); 
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    console.log(startDate,endDate)
    return { startDate, endDate };
  }
}

