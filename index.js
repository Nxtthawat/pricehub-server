import express from 'express';
import cors from 'cors';

import userRoute from './api/users.js';
import adminRoute from './api/admin.js';
import menuRoute from './api/menu.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/menu', menuRoute);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});