import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'card', 'other'],
    default: 'other',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);