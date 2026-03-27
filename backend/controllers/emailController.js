import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import { sendReminderEmail } from '../services/emailService.js';

export const sendEmailReminder = async (req, res) => {
     console.log("EMAIL ROUTE HIT");
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const client = await Client.findById(invoice.client);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const result = await sendReminderEmail(client, invoice);

    res.json({
      message: 'Email sent successfully',
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    
  }
  
};