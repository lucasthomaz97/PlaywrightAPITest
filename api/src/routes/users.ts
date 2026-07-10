import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const result = await query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );

  res.status(201).json(result.rows[0]);
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(result.rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name && !email) {
    res.status(400).json({ error: 'At least name or email must be provided' });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (name) {
    fields.push(`name = $${index++}`);
    values.push(name);
  }
  if (email) {
    fields.push(`email = $${index++}`);
    values.push(email);
  }

  values.push(id);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(result.rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ message: 'User deleted', user: result.rows[0] });
});

export default router;
