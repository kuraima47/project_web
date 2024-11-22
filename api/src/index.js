import express from 'express';
import morgan from 'morgan';
import router from './routes/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));