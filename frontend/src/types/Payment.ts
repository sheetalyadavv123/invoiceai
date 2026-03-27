export interface Payment {
  _id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
}