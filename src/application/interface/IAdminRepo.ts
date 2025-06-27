import { IAdmin } from "../../infrastructure/database/models/AdminModel"


interface IAdminRepo {
  findAdminByEmail(email: string): Promise<IAdmin | null>;
  getPayouts(): Promise<any[]>;
  getTotalRevenue(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<number>;
  getRevenueByPeriod(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ name: string; revenue: number }[]>;
  getTotalStudents(): Promise<number>;
  getTotalTeachers(): Promise<number>;
  getTotalCourses(): Promise<number>;
  getReportData(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ totalRevenue: string; orders: any[] }>;
  getOrderDetails(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<
    {
      courseName: string;
      studentName: string;
      courseImage: string;
      price: number;
      date: string | Date;
    }[]
  >;
}

export default IAdminRepo