import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Client email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  payScore: {
    type: Number,
    default: 100,
  },
  payHistory: [
    {
      invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
      paidOnTime: { type: Boolean },
      daysLate: { type: Number, default: 0 },
    }
  ],
}, { timestamps: true });

export default mongoose.model('Client', clientSchema);