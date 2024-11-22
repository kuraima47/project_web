import { findContacts, saveContact } from '../services/database.js';

export async function getContacts(req, res) {
    try {
        const contacts = await findContacts();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}

export async function addContact(req, res) {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).send({ message: 'Name and email are required' });
    }

    try {
        const contact = await saveContact({ name, email });
        res.status(201).json(contact);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}