import IAdminRepository from "../interface/IAdminRepo";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { Readable } from "stream";
import bcrypt from "bcrypt"
import { generateAccessToken, generateRefreshToken } from "../../infrastructure/utility/GenarateToken";

export interface IAdminUseCase {
  loginAdmin(
    email: string,
    password: string
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
  }>;
  findAllStudents(): Promise<any[]>;
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
}

export class AdminUseCase {
  constructor(
    private adminRepository: IAdminRepository,
    private studentRepo: any, // IStudentRepo (replace with actual interface)
    private instructorRepo: any // IInstructorRepo (replace with actual interface)
  ) {}

  async loginAdmin(email: string, password: string) {
    const adminData = await this.adminRepository.findAdminByEmail(email);
    if (!adminData) {
      throw new Error("Invalid Credential");
    }
    const isMatch = await bcrypt.compare(password, adminData.password);
    if (!isMatch) {
      throw new Error("Invalid Credential");
    }
    const TokenPayload: any = {
      // TokenPayload (replace with actual interface)
      email: adminData.email,
      id: adminData._id.toString(),
      role: "admin",
    };
    const accessToken = generateAccessToken(TokenPayload);
    const refreshToken = generateRefreshToken(TokenPayload);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  }

  async findAllStudents() {
    return await this.studentRepo.getAllStudents();
  }

  async findAllTeachers() {
    const instructors = await this.instructorRepo.findAllInstructors();
    return instructors;
  }

  async blockTeacher(email: string) {
    const instructor = await this.instructorRepo.findInstructorByEmail(email);
    if (!instructor) {
      throw new Error("Instructor not found");
    }
    const id = instructor._id.toString();
    const res = await this.instructorRepo.updateById(id, {
      IsBlocked: !instructor.IsBlocked,
    });
    return res;
  }

  async blockStudent(email: string) {
    const student = await this.studentRepo.findStudentByEmail(email);
    if (!student) throw new Error("Student not found");
    const update = await this.studentRepo.updateById(student._id.toString(), {
      isBlocked: !student.isBlocked,
    });

    return update;
  }

  getPayouts = async () => {
    const payouts = await this.adminRepository.getPayouts();
    if (!payouts) {
      throw new Error("No payouts found");
    }
    return payouts;
  };

  async getDashboardData(filter?: {
    type: "weekly" | "monthly" | "yearly" | "custom";
    startDate?: Date;
    endDate?: Date;
  }) {
    const [
      totalRevenue,
      totalStudents,
      totalTeachers,
      totalCourses,
      revenueByPeriod,
      orderDetails,
    ] = await Promise.all([
      this.adminRepository.getTotalRevenue(filter),
      this.adminRepository.getTotalStudents(),
      this.adminRepository.getTotalTeachers(),
      this.adminRepository.getTotalCourses(),
      this.adminRepository.getRevenueByPeriod(filter),
      this.adminRepository.getOrderDetails(filter),
    ]);
    console.log(revenueByPeriod);

    return {
      totalRevenue,
      totalStudents,
      totalTeachers,
      totalCourses,
      revenueByPeriod,
      orderDetails,
    };
  }

  async getReportData(
    format: "pdf" | "excel",
    filter?: {
      type: "weekly" | "monthly" | "yearly" | "custom";
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    try {
      const datas = await this.adminRepository.getReportData(filter);
      const total = datas.totalRevenue || 0;
      const data = datas.orders || [];
      const totalRevenue = Number(total);
      if (format === "pdf") {
        const pdfBuffer = await this.generatePdfReport(data, totalRevenue);
        return {
          data: pdfBuffer,
          contentType: "application/pdf",
          filename: "admin_report.pdf",
        };
      } else {
        const excelBuffer = this.generateExcelReport(data, totalRevenue);
        return {
          data: excelBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          filename: "admin_report.xlsx",
        };
      }
    } catch (error) {
      console.error(`Error generating ${format} report:`, error);
      throw new Error(`Failed to generate ${format} report`);
    }
  }

  private async generatePdfReport(
    data: {
      courseName?: string;
      studentName?: string;
      priceUSD?: number;
      createdAt: string | Date;
    }[],
    totalRevenue: number
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      /* ------------ 0.  initialise doc & buffer plumbing ------------------- */
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      /* ------------ 1.  column layout -------------------------------------- */
      const marginLeft = 50;
      const marginRight = 50;
      const usableWidth = doc.page.width - marginLeft - marginRight;

      // columns: Course | Student | Price | Date
      const widths = [220, 140, 70, 65] as const;
      const xPos = [
        marginLeft,
        marginLeft + widths[0],
        marginLeft + widths[0] + widths[1],
        marginLeft + widths[0] + widths[1] + widths[2],
      ] as const;

      const HEADER_FONT_SIZE = 8;
      const BODY_FONT_SIZE = 8;
      const ROW_GAP = 4;

      const printableBottom = () => doc.page.height - doc.page.margins.bottom;

      /* ------------ 2.  helpers -------------------------------------------- */
      const drawHeader = () => {
        doc.fontSize(HEADER_FONT_SIZE).font("Helvetica-Bold");
        const yStart = doc.y;

        ["Course Name", "Student Name", "Price (USD)", "Date"].forEach(
          (txt, i) => doc.text(txt, xPos[i], yStart, { width: widths[i] })
        );

        doc.moveDown(0.5);
        doc
          .moveTo(marginLeft, doc.y)
          .lineTo(marginLeft + usableWidth, doc.y)
          .stroke();
        doc.moveDown(0.5);
      };

      /* ------------ 3.  title ---------------------------------------------- */
      doc.fontSize(20).text("Sales Report", { align: "center" });
      doc.moveDown(2);

      /* ------------ 4.  table ---------------------------------------------- */
      drawHeader();
      doc.fontSize(BODY_FONT_SIZE).font("Helvetica");

      let y = doc.y;

      for (const order of data) {
        const course = order.courseName || "N/A";
        const student = order.studentName || "N/A";
        const price = `${order.priceUSD?.toFixed(2) || "0.00"}`;
        const date = new Date(order.createdAt).toLocaleDateString();

        /* -- measure wrapped heights --------------------------------------- */
        const h = [
          doc.heightOfString(course, { width: widths[0] }),
          doc.heightOfString(student, { width: widths[1] }),
          doc.heightOfString(price, { width: widths[2] }),
          doc.heightOfString(date, { width: widths[3] }),
        ];
        const rowHeight = Math.max(...h) + ROW_GAP;

        /* -- page break ----------------------------------------------------- */
        if (y + rowHeight > printableBottom()) {
          doc.addPage();
          drawHeader();
          y = doc.y;
        }

        /* -- render cells --------------------------------------------------- */
        doc.text(course, xPos[0], y, { width: widths[0] });
        doc.text(student, xPos[1], y, { width: widths[1] });
        doc.text(price, xPos[2], y, {
          width: widths[2],
          align: "right",
        });
        doc.text(date, xPos[3], y, {
          width: widths[3],
          align: "right",
        });

        /* -- divider under row --------------------------------------------- */
        doc
          .moveTo(marginLeft, y + rowHeight - ROW_GAP / 2)
          .lineTo(marginLeft + usableWidth, y + rowHeight - ROW_GAP / 2)
          .stroke();

        y += rowHeight;
      }

      /* ------------ 5.  footer -------------------------------------------- */
      doc.moveDown(1);
      doc
        .moveTo(marginLeft, doc.y)
        .lineTo(marginLeft + usableWidth, doc.y)
        .stroke();
      doc.moveDown(1);

      doc.fontSize(12).font("Helvetica-Bold");
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, marginLeft);

      /* ------------ 6.  finish -------------------------------------------- */
      doc.end();
    });
  }

  private generateExcelReport(data: any[], totalRevenue: number): Buffer {
    try {
      const wsData = data.map((order) => ({
        CourseName: order.courseName || "N/A",
        StudentName: order.studentName || "N/A",
        PriceUSD: order.priceUSD?.toFixed(2) || "0.00",
        Date: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "N/A",
      }));

      // Add a blank row and total revenue
      wsData.push();
      wsData.push({
        CourseName: "Total Revenue",
        StudentName: "",
        PriceUSD: totalRevenue.toFixed(2),
        Date: "",
      });

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Revenue");
      return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    } catch (error) {
      console.error("Error generating Excel report:", error);
      throw new Error("Failed to generate Excel report");
    }
  }
}
