import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import {
  generateInvoiceDescription,
  generateFinancialInsights,
} from '../services/aiService.js';
import { sendReminderEmail } from '../services/emailService.js';
import { parseInvoiceImage } from '../services/ocrService.js';

export const getInvoiceDescription = async (req, res) => {
  try {
    const { items } = req.body;
    const description = await generateInvoiceDescription(items);
    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFinancialInsights = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id });
    if (invoices.length === 0) {
      return res.json({ insights: 'No invoices found to analyze.' });
    }
    const insights = await generateFinancialInsights(invoices);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendReminder = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.user._id,
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const client = await Client.findById(invoice.client);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const result = await sendReminderEmail(client, invoice);
    res.json({
      message: 'Reminder sent successfully',
      tone: result.tone,
      daysPastDue: result.daysPastDue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const parseOCR = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await parseInvoiceImage(req.file.path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};