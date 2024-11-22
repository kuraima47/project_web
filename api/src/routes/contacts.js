import express from 'express';
import { getContacts, addContact } from '../controllers/contactsController.js';

const router = express.Router();

router.get('/', getContacts);
router.post('/', addContact);

export default router;