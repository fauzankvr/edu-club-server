export type DashboardFilterType = "weekly" | "monthly" | "yearly" | "custom";

export interface DashboardFilter {
  type: DashboardFilterType;
  startDate?: Date; // required if type === "custom"
  endDate?: Date; // required if type === "custom"
}
