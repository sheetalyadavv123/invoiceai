import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (invoice, client) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const purple = '#7c3aed';
    const dark = '#1a1035';
    const gray = '#6b7280';
    const light = '#f3f4f6';

    // HEADER BAR 
    doc.rect(0, 0, doc.page.width, 80).fill(dark);

    doc.fontSize(26).font('Helvetica-Bold').fillColor('#ffffff')
      .text('INVOI', 50, 28);

    doc.fontSize(10).font('Helvetica').fillColor('#a78bfa')
      .text('AI-Powered Invoice Platform', 50, 58);

    // Invoice number top right
    const invoiceNum = invoice.invoiceNumber || `INV-${invoice._id.toString().slice(-6).toUpperCase()}`;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff')
      .text(invoiceNum, 0, 35, { align: 'right', width: doc.page.width - 50 });

    doc.fillColor('#000000');

    //  STATUS BADGE 
    const statusColors = { paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444' };
    const statusColor = statusColors[invoice.status] || '#6b7280';
    doc.roundedRect(50, 100, 80, 24, 4).fill(statusColor);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff')
      .text(invoice.status.toUpperCase(), 50, 107, { width: 80, align: 'center' });

    // FROM / TO SECTION 
    doc.fillColor(gray).fontSize(9).font('Helvetica').text('FROM', 50, 145);
    doc.fillColor(dark).fontSize(13).font('Helvetica-Bold').text('Your Business', 50, 158);
    doc.fillColor(gray).fontSize(10).font('Helvetica')
      .text('invoiai@yourbusiness.com', 50, 175)
      .text('www.invoi.app', 50, 189);

    doc.fillColor(gray).fontSize(9).font('Helvetica').text('BILL TO', 300, 145);
    doc.fillColor(dark).fontSize(13).font('Helvetica-Bold').text(client.name || 'Client', 300, 158);
    doc.fillColor(gray).fontSize(10).font('Helvetica')
      .text(client.email || '', 300, 175)
      .text(client.phone || '', 300, 189);

    // INVOICE META 
    doc.moveTo(50, 220).lineTo(doc.page.width - 50, 220).strokeColor('#e5e7eb').lineWidth(1).stroke();

    const metaY = 232;
    const metaItems = [
      { label: 'Invoice Date', value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
      { label: 'Due Date', value: new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
      { label: 'Invoice No.', value: invoiceNum },
      { label: 'Status', value: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) },
    ];

    metaItems.forEach((item, i) => {
      const x = 50 + i * 125;
      doc.fillColor(gray).fontSize(8).font('Helvetica').text(item.label, x, metaY);
      doc.fillColor(dark).fontSize(10).font('Helvetica-Bold').text(item.value, x, metaY + 14);
    });

    doc.moveTo(50, 272).lineTo(doc.page.width - 50, 272).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // ITEMS TABLE HEADER 
    const tableTop = 285;
    doc.rect(50, tableTop, doc.page.width - 100, 26).fill(purple);
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
      .text('DESCRIPTION', 62, tableTop + 9)
      .text('QTY', 340, tableTop + 9, { width: 60, align: 'center' })
      .text('UNIT PRICE', 400, tableTop + 9, { width: 80, align: 'right' })
      .text('TOTAL', 480, tableTop + 9, { width: 65, align: 'right' });

    //  ITEMS TABLE ROWS 
    const items = invoice.items || [];
    let rowY = tableTop + 26;

    items.forEach((item, i) => {
      const rowBg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
      const lineTotal = (item.quantity || 1) * (item.price || 0);

      doc.rect(50, rowY, doc.page.width - 100, 28).fill(rowBg);
      doc.fillColor(dark).fontSize(10).font('Helvetica')
        .text(item.description || 'Service', 62, rowY + 9, { width: 270 })
        .text(String(item.quantity || 1), 340, rowY + 9, { width: 60, align: 'center' })
        .text(`₹${(item.price || 0).toLocaleString()}`, 400, rowY + 9, { width: 80, align: 'right' })
        .text(`₹${lineTotal.toLocaleString()}`, 480, rowY + 9, { width: 65, align: 'right' });

      rowY += 28;
    });

    // TOTALS 
    const subtotal = items.reduce((s, i) => s + (i.quantity || 1) * (i.price || 0), 0);
    const tax = 0;
    const total = subtotal + tax;

    doc.moveTo(50, rowY + 8).lineTo(doc.page.width - 50, rowY + 8).strokeColor('#e5e7eb').lineWidth(1).stroke();

    const totalsX = 380;
    let totY = rowY + 20;

    doc.fillColor(gray).fontSize(10).font('Helvetica').text('Subtotal:', totalsX, totY);
    doc.fillColor(dark).fontSize(10).font('Helvetica-Bold').text(`₹${subtotal.toLocaleString()}`, totalsX, totY, { align: 'right', width: doc.page.width - 50 - totalsX });

    totY += 18;
    doc.fillColor(gray).fontSize(10).font('Helvetica').text('Tax (0%):', totalsX, totY);
    doc.fillColor(dark).fontSize(10).font('Helvetica').text('₹0', totalsX, totY, { align: 'right', width: doc.page.width - 50 - totalsX });

    totY += 14;
    doc.moveTo(totalsX, totY).lineTo(doc.page.width - 50, totY).strokeColor(purple).lineWidth(1.5).stroke();
    totY += 10;

    doc.rect(totalsX - 10, totY - 4, doc.page.width - 40 - totalsX, 30).fill(purple);
    doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold')
      .text('TOTAL DUE:', totalsX, totY + 5)
      .text(`₹${total.toLocaleString()}`, totalsX, totY + 5, { align: 'right', width: doc.page.width - 50 - totalsX });

    // NOTES 
    if (invoice.notes) {
      totY += 50;
      doc.fillColor(gray).fontSize(9).font('Helvetica').text('NOTES', 50, totY);
      doc.fillColor(dark).fontSize(10).font('Helvetica').text(invoice.notes, 50, totY + 14, { width: 400 });
    }

    // FOOTER 
    const footerY = doc.page.height - 70;
    doc.rect(0, footerY, doc.page.width, 70).fill(dark);
    doc.fillColor('#a78bfa').fontSize(9).font('Helvetica')
      .text('Thank you for your business! Payment due by ' + new Date(invoice.dueDate).toLocaleDateString('en-IN'), 0, footerY + 15, { align: 'center', width: doc.page.width })
      .text('Generated by Invoi — AI-Powered Invoice Platform', 0, footerY + 32, { align: 'center', width: doc.page.width });
    doc.fillColor('#6b7280').fontSize(8)
      .text('Questions? Contact us at support@invoi.app', 0, footerY + 48, { align: 'center', width: doc.page.width });

    doc.end();
  });
};