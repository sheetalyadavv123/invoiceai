export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
    _id: string;
    name: string;
    email: string;
  };
  items: InvoiceItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}