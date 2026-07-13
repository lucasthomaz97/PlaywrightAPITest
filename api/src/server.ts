import 'dotenv/config';
import express from 'express';
import productsRouter from './routes/products';
import usersRouter from './routes/users';
import { initDb } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/products', productsRouter);
app.use('/users', usersRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'E-commerce API' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });

export default app;
