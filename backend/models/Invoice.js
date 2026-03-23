import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  items: [invoiceItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

invoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now();
  }
});

export default mongoose.model('Invoice', invoiceSchema);