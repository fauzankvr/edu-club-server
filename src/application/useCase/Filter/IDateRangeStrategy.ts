export interface IDateRangeStrategy {
  getDateRange(): { startDate?: Date; endDate?: Date };
}
