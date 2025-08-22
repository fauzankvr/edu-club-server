export interface IAdminUseCase {
  loginAdmin(
    email: string,
    password: string
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
  }>;
  findAllStudents(limit: number, skip: number): Promise<any[]>;
  countAllStudents(): Promise<number>;
  findAllTeachers(): Promise<any[]>;
  blockTeacher(email: string): Promise<any>;
  blockStudent(email: string): Promise<any>;
  getPayouts(): Promise<any[]>;
  getDashboardData(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalRevenue: number;
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    revenueByPeriod: { name: string; revenue: number }[];
  }>;
  getReportData(
    format: "pdf" | "excel",
    filter?: {
      type: "weekly" | "monthly" | "yearly" | "custom";
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ data: Buffer; contentType: string; filename: string }>;
  approveTeacher(email: string): Promise<any>;
}
