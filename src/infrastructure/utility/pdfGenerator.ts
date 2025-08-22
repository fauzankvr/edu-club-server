
import PDFDocument from "pdfkit";

export async function generatePdfReport(
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
