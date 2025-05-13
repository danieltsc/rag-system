require('dotenv').config()

import express from 'express';
import cors from 'cors';
import uploadRoute from './routes/upload';
import chatRoute from './routes/chat';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRoute);
app.use('/api/chat', chatRoute);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'All good :)' })
})

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));