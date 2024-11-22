import { MongoClient } from 'mongodb';

const mongoURI = process.env.MONGO_URI;
const mongoDB = process.env.MONGO_DB;

if (!mongoURI || !mongoDB) {
    throw new Error('Missing MongoDB configuration in environment variables');
}

const client = new MongoClient(mongoURI);
let db;

export async function connectToDb() {
    if (!db) {
        await client.connect();
        db = client.db(mongoDB);
        console.log('Connected to MongoDB');
    }
    return db;
}

export async function findContacts() {
    const db = await connectToDb();
    return db.collection('contacts').find({}).toArray();
}

export async function saveContact(contact) {
    const db = await connectToDb();
    const result = await db.collection('contacts').insertOne(contact);
    return result.ops[0];
}