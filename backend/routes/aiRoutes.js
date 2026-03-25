import express from 'express';
import {
  getInvoiceDescription,
  getFinancialInsights,
  sendReminder,
  parseOCR,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/description', getInvoiceDescription);
router.get('/insights', getFinancialInsights);
router.post('/reminder', sendReminder);
router.post('/parse-ocr', upload.single('invoice'), parseOCR);

export default router;
