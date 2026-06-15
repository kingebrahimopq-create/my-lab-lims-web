import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToPDF = (title: string, headers: string[], data: (string | number)[][], filename: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFontSize(18);
  doc.text(title, 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 105, 25, { align: 'center' });

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
  });

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = (headers: string[], data: (string | number)[][], filename: string, sheetName?: string) => {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Sheet1');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

export const exportToCSV = (headers: string[], data: (string | number)[][], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...data.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

export const exportToWord = (title: string, headers: string[], data: (string | number)[][], filename: string) => {
  const tableRows = data
    .map((row) => {
      const cells = row.map((cell) => `<td style="border:1px solid #ddd;padding:8px;text-align:center">${cell}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const headerCells = headers.map((h) => `<th style="border:1px solid #ddd;padding:8px;background:#2980b9;color:white;text-align:center">${h}</th>`).join('');

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head><meta charset='utf-8'><title>${title}</title></head>
    <body style="font-family:Arial,sans-serif;direction:rtl">
      <h2 style="text-align:center">${title}</h2>
      <p style="text-align:center">تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</p>
      <table style="border-collapse:collapse;width:100%;margin-top:20px">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body></html>
  `;

  const blob = new Blob([html], { type: 'application/msword' });
  saveAs(blob, `${filename}.doc`);
};

export const printDocument = (title: string, content: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background: #2980b9; color: white; }
        tr:nth-child(even) { background: #f5f5f5; }
        h2 { text-align: center; }
        .header { text-align: center; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${title}</h2>
        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</p>
      </div>
      ${content}
      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};
