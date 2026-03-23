import Invoice from '../models/Invoice.js';

export const detectOverdue = async () => {
  const now = new Date();
  await Invoice.updateMany(
    { status: 'pending', dueDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
};