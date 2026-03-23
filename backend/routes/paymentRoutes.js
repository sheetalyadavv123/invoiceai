import express from 'express';
import {
  recordPayment,
  getPaymentsByClient,
  getPaymentHistory,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', recordPayment);
router.get('/', getPaymentHistory);
router.get('/client/:clientId', getPaymentsByClient);

export default router;