import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getPublicInvoice,
  markInvoiceAsPaid,
  resendInvoiceReminder,
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public/:id', getPublicInvoice);
router.patch('/public/:id/mark-paid', markInvoiceAsPaid);

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.post('/:id/remind', resendInvoiceReminder);

export default router;