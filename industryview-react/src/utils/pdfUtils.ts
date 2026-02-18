import jsPDF from 'jspdf';

interface PdfOptions {
  title: string;
  subtitle?: string;
  date?: string;
  projectName?: string;
}

interface PdfTableColumn {
  header: string;
  key: string;
  width?: number;
}

interface PdfTableRow {
  [key: string]: string | number;
}

/** Generate a simple PDF report */
export function generatePdfReport(
  options: PdfOptions,
  columns: PdfTableColumn[],
  rows: PdfTableRow[]
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtitle
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(options.subtitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  // Date and project
  doc.setFontSize(10);
  if (options.projectName) {
    doc.text(`Projeto: ${options.projectName}`, 14, yPos);
    yPos += 6;
  }
  if (options.date) {
    doc.text(`Data: ${options.date}`, 14, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Divider line
  doc.setDrawColor(200);
  doc.line(14, yPos, pageWidth - 14, yPos);
  yPos += 10;

  // Table header
  const colWidth = (pageWidth - 28) / columns.length;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(14, yPos - 5, pageWidth - 28, 8, 'F');

  columns.forEach((col, i) => {
    doc.text(col.header, 14 + i * colWidth + 2, yPos);
  });
  yPos += 8;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  rows.forEach((row) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }

    columns.forEach((col, i) => {
      const value = String(row[col.key] ?? '');
      doc.text(value, 14 + i * colWidth + 2, yPos);
    });

    // Row divider
    doc.setDrawColor(230);
    doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
    yPos += 7;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'IndustryView',
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Save
  doc.save(`${options.title.replace(/\s+/g, '_')}.pdf`);
}

/** Generate a simple text-based PDF */
export function generateSimplePdf(title: string, content: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(content, pageWidth - 28);
  doc.text(lines, 14, 35);

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}
