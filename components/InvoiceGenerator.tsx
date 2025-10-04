import { Bill, CustomerProfile } from '../types';

export const generateInvoicePDF = (customer: CustomerProfile, bill: Bill) => {
  // Access jsPDF from the window object to ensure it's found
  // after being loaded by the CDN script tag.
  const jspdf = (window as any).jspdf;

  // More robust check: verify the constructor and the autoTable plugin on its prototype
  if (!jspdf || typeof jspdf.jsPDF !== 'function' || typeof jspdf.jsPDF.prototype.autoTable !== 'function') {
    console.error("jsPDF or jsPDF-autoTable not loaded. Check the script tags in index.html.");
    alert("Error: PDF generation library is not loaded.");
    return;
  }

  const { jsPDF } = jspdf;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 119, 182); // primary color
  doc.text('AquaTrack', 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Water Management Solutions', 14, 28);

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 196, 22, { align: 'right' });

  // Customer Info
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.name, 14, 51);
  doc.text(`Account No: ${customer.accountNumber}`, 14, 57);
  doc.text(`Meter No: ${customer.meterNumber}`, 14, 63);

  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', 196, 45, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice ID: ${bill.id}`, 196, 51, { align: 'right' });
  doc.text(`Billing Period: ${bill.period}`, 196, 57, { align: 'right' });
  doc.text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`, 196, 63, { align: 'right' });

  // Table using jspdf-autotable
  const tableColumn = ["Description", "Reading (Previous)", "Reading (Current)", "Consumption (m³)", "Rate", "Amount"];
  const tableRows = [
    [
      `Water Usage for ${bill.period}`,
      bill.previousReading,
      bill.currentReading,
      bill.consumption.toFixed(2),
      `KES ${bill.rate.toFixed(2)}`,
      `KES ${bill.amountDue.toFixed(2)}`,
    ]
  ];

  (doc as any).autoTable({
    startY: 80,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [2, 62, 138] }, // primary-dark
  });

  // Totals Section
  const finalY = (doc as any).autoTable.previous.finalY;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Due:', 140, finalY + 15);
  doc.setFontSize(16);
  doc.setTextColor(0, 119, 182);
  doc.text(`KES ${bill.amountDue.toFixed(2)}`, 196, finalY + 15, { align: 'right' });
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Thank you for your timely payment. Payments can be made via our online portal.', 14, doc.internal.pageSize.height - 15);
  doc.text('www.aquatrack.com', 14, doc.internal.pageSize.height - 10);
  
  // Save the PDF
  doc.save(`Invoice-${customer.accountNumber}-${bill.period.replace(' ', '-')}.pdf`);
};
