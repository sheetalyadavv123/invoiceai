import express from 'express';
import { sendEmailReminder } from '../controllers/emailController.js';

const router = express.Router();

router.post('/send', sendEmailReminder);

export default router;