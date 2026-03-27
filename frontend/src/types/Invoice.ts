export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  _id: string;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
}