import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';

export const recordPayment = async (req, res) => {
  try {
    const { invoiceId, amount, method, note } = req.body;

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.user._id,
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const payment = await Payment.create({
      user: req.user._id,
      invoice: invoiceId,
      client: invoice.client,
      amount,
      method,
      note,
    });

    invoice.status = 'paid';
    await invoice.save();

    const daysLate = invoice.dueDate < new Date()
      ? Math.floor((new Date() - invoice.dueDate) / (1000 * 60 * 60 * 24))
      : 0;

    await Client.findByIdAndUpdate(invoice.client, {
      $push: {
        payHistory: {
          invoiceId: invoice._id,
          paidOnTime: daysLate === 0,
          daysLate,
        },
      },
      $inc: { payScore: daysLate === 0 ? 2 : -5 },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentsByClient = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
      client: req.params.clientId,
    }).populate('invoice', 'invoiceNumber totalAmount dueDate');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('client', 'name email')
      .populate('invoice', 'invoiceNumber totalAmount')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};