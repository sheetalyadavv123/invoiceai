import Invoice from '../models/Invoice.js';
import { detectOverdue } from '../services/invoiceService.js';
import { sendInvoiceEmail } from '../services/emailService.js';
import Client from '../models/Client.js';

export const createInvoice = async (req, res) => {
  try {
    const { client, items, totalAmount, dueDate, notes } = req.body;
    const invoice = await Invoice.create({
      user: req.user._id,
      client,
      items,
      totalAmount,
      dueDate,
      notes,
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('client', 'name email');

    try {
      const clientData = await Client.findById(client);
      if (clientData) {
        await sendInvoiceEmail(clientData, populatedInvoice);
      }
    } catch (emailErr) {
      console.error('Email failed but invoice created:', emailErr.message);
    }

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create invoice', error: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    await detectOverdue();
    const invoices = await Invoice.find({ user: req.user._id })
      .populate('client', 'name email')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('client', 'name email phone');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};