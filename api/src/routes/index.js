import express from 'express';
import contactsRouter from './contacts.js';

const router = express.Router();

router.use('/contacts', contactsRouter);

export default router;