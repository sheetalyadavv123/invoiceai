import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import { generatePaymentReminder } from '../services/aiService.js';
import { sendReminder } from '../services/emailService.js';

export const sendEmailReminder = async (req, res) => {
  console.log("EMAIL ROUTE HIT");
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId)
      .populate('client');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const client = await Client.findById(invoice.client);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const daysPastDue = Math.floor(
      (Date.now() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
    );

    const reminderText = await generatePaymentReminder(invoice, client, daysPastDue);
    await sendReminder(client, invoice, reminderText);

    res.json({
      message: 'Email sent successfully',
      reminderText,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};