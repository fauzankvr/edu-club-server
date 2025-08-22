import * as XLSX from "xlsx";

export const generateExcelReport = (data: any[], totalRevenue: number): Buffer => {
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
