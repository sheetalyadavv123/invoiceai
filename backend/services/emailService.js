import Brevo from '@getbrevo/brevo';
import { generateInvoicePDF } from './pdfService.js';

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// ─── TONE ENGINE 
export const getTone = (daysPastDue) => {
  if (daysPastDue <= 7) return 'gentle';
  if (daysPastDue <= 20) return 'firm';
  return 'final';
};

// ─── SEND INVOICE EMAIL 
export const sendInvoiceEmail = async (client, invoice) => {
  try {
    const pdfBuffer = await generateInvoicePDF(invoice, client);
    const invoiceNum = invoice.invoiceNumber || `INV-${invoice._id.toString().slice(-6).toUpperCase()}`;
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const total = invoice.totalAmount || invoice.amount || 0;

    const itemsHtml = (invoice.items || []).map(item => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#374151">${item.description}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#374151;text-align:center">${item.quantity}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#374151;text-align:right">&#8377;${(item.price || 0).toLocaleString()}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#374151;text-align:right">&#8377;${((item.quantity || 1) * (item.price || 0)).toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1a1035,#2d1b69);padding:32px 40px">
      <div style="font-size:28px;font-weight:800;color:#ffffff">Invoi</div>
      <div style="font-size:12px;color:#a78bfa;margin-top:4px">AI-Powered Invoice Platform</div>
    </div>
    <div style="padding:36px 40px">
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Invoice from Your Business</h2>
      <p style="margin:0 0 28px;color:#6b7280;font-size:14px">Hi ${client.name}, please find your invoice details below.</p>

      <div style="display:flex;gap:16px;margin-bottom:28px;flex-wrap:wrap">
        <div style="flex:1;min-width:140px;background:#f9fafb;border-radius:10px;padding:14px 18px;border:1px solid #e5e7eb">
          <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Invoice No.</div>
          <div style="font-size:16px;font-weight:700;color:#111827;margin-top:4px">${invoiceNum}</div>
        </div>
        <div style="flex:1;min-width:140px;background:#f9fafb;border-radius:10px;padding:14px 18px;border:1px solid #e5e7eb">
          <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Amount Due</div>
          <div style="font-size:16px;font-weight:700;color:#111827;margin-top:4px">&#8377;${total.toLocaleString()}</div>
        </div>
        <div style="flex:1;min-width:140px;background:#f9fafb;border-radius:10px;padding:14px 18px;border:1px solid #e5e7eb">
          <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Due Date</div>
          <div style="font-size:16px;font-weight:700;color:#111827;margin-top:4px">${dueDate}</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
        <thead>
          <tr style="background:#7c3aed">
            <th style="padding:10px 16px;text-align:left;color:#fff;font-size:11px;text-transform:uppercase">Description</th>
            <th style="padding:10px 16px;text-align:center;color:#fff;font-size:11px;text-transform:uppercase">Qty</th>
            <th style="padding:10px 16px;text-align:right;color:#fff;font-size:11px;text-transform:uppercase">Price</th>
            <th style="padding:10px 16px;text-align:right;color:#fff;font-size:11px;text-transform:uppercase">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="background:#7c3aed;border-radius:10px;padding:16px 20px;margin-bottom:28px">
        <span style="color:#e9d5ff;font-size:14px;font-weight:600">Total Due: </span>
        <span style="color:#ffffff;font-size:22px;font-weight:800">&#8377;${total.toLocaleString()}</span>
      </div>

      ${invoice.notes ? `
      <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:28px;border-left:3px solid #7c3aed">
        <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;margin-bottom:6px">Notes</div>
        <div style="font-size:14px;color:#374151">${invoice.notes}</div>
      </div>` : ''}

      <p style="color:#6b7280;font-size:13px;margin:0">
        The invoice PDF is attached to this email. Please complete payment by <strong>${dueDate}</strong>.
      </p>
    </div>
    <div style="background:#1a1035;padding:24px 40px;text-align:center">
      <div style="color:#a78bfa;font-size:12px">Generated by Invoi — AI-Powered Invoice Platform</div>
      <div style="color:#4b5563;font-size:11px;margin-top:4px">Questions? Reply to this email.</div>
    </div>
  </div>
</body>
</html>`;

    await apiInstance.sendTransacEmail({
      sender: { name: 'Invoi', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: client.email, name: client.name }],
      subject: `Invoice ${invoiceNum} — &#8377;${total.toLocaleString()} due on ${dueDate}`,
      htmlContent: html,
      attachment: [{
        name: `${invoiceNum}.pdf`,
        content: pdfBuffer.toString('base64'),
      }],
    });

    console.log(`✅ Invoice email sent to ${client.email} via Brevo`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send invoice email:', err.message);
    throw err;
  }
};

// ─── SEND REMINDER EMAIL ──────────────────────────────────────────────────────
export const sendReminder = async (client, invoice, reminderText) => {
  try {
    const invoiceNum = invoice.invoiceNumber || `INV-${invoice._id.toString().slice(-6).toUpperCase()}`;
    const daysPastDue = Math.floor((Date.now() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
    const tone = getTone(daysPastDue);
    const total = invoice.totalAmount || invoice.amount || 0;

    const subjectMap = {
      gentle: `Friendly reminder: Invoice ${invoiceNum} is due`,
      firm:   `Action required: Invoice ${invoiceNum} is overdue`,
      final:  `Final notice: Invoice ${invoiceNum} — immediate payment required`,
    };

    const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1a1035,#2d1b69);padding:32px 40px">
      <div style="font-size:28px;font-weight:800;color:#ffffff">Invoi</div>
      <div style="font-size:12px;color:${tone === 'final' ? '#fca5a5' : '#a78bfa'};margin-top:4px">
        ${tone === 'gentle' ? 'Payment Reminder' : tone === 'firm' ? 'Overdue Notice' : 'Final Payment Notice'}
      </div>
    </div>
    <div style="padding:36px 40px">
      <p style="font-size:15px;color:#111827;line-height:1.7">${reminderText}</p>
      <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin:24px 0;border:1px solid #e5e7eb">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#6b7280;font-size:13px">Invoice</span>
          <span style="color:#111827;font-size:13px;font-weight:600">${invoiceNum}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#6b7280;font-size:13px">Amount Due</span>
          <span style="color:#111827;font-size:13px;font-weight:600">&#8377;${total.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#6b7280;font-size:13px">Days Overdue</span>
          <span style="color:#ef4444;font-size:13px;font-weight:600">${daysPastDue} days</span>
        </div>
      </div>
    </div>
    <div style="background:#1a1035;padding:24px 40px;text-align:center">
      <div style="color:#a78bfa;font-size:12px">Generated by Invoi — AI-Powered Invoice Platform</div>
    </div>
  </div>
</body>
</html>`;

    await apiInstance.sendTransacEmail({
      sender: { name: 'Invoi', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: client.email, name: client.name }],
      subject: subjectMap[tone],
      htmlContent: html,
    });

    console.log(`✅ Reminder sent to ${client.email} (tone: ${tone})`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send reminder:', err.message);
    throw err;
  }
};