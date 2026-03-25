import nodemailer from 'nodemailer';
import { getTone, getToneMessage } from '../utils/toneEngine.js';
import { generatePaymentReminder } from './aiService.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReminderEmail = async (client, invoice) => {
  try {
    const daysPastDue = Math.floor(
      (new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
    );

    const tone = getTone(daysPastDue);
    const toneMessage = getToneMessage(tone);
    const aiMessage = await generatePaymentReminder(invoice, client, daysPastDue);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `Payment Reminder — Invoice ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Reminder</h2>
          <p><strong>${toneMessage}</strong></p>
          <hr/>
          <p>${aiMessage}</p>
          <hr/>
          <h3>Invoice Details</h3>
          <p>Invoice Number: <strong>${invoice.invoiceNumber}</strong></p>
          <p>Amount Due: <strong>₹${invoice.totalAmount}</strong></p>
          <p>Due Date: <strong>${new Date(invoice.dueDate).toDateString()}</strong></p>
          <hr/>
          <p style="color: #888; font-size: 12px;">This is an automated reminder.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, tone, daysPastDue };
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};