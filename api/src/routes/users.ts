import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  if (typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
    return;
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Email must be a valid email string' });
    return;
  }

  try {
    const result = await query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    const pgErr = err as { code?: string; constraint?: string };
    if (pgErr.code === '23505' && pgErr.constraint === 'users_email_key') {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }
    if (pgErr.code === '23502') {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === undefined || isNaN(Number(id)) || Number(id) < 0 || id === '' || id.includes('.')) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

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

  if (id === undefined || isNaN(Number(id)) || id.includes('.') || Number(id) <= 0) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  if (!name && !email) {
    res.status(400).json({ error: 'At least name or email must be provided' });
    return;
  }

  if (name !== undefined && typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
    return;
  }

  if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
    res.status(400).json({ error: 'Email must be a valid email string' });
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

  try {
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: unknown) {
    const pgErr = err as { code?: string; constraint?: string };
    if (pgErr.code === '23505' && pgErr.constraint === 'users_email_key') {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }
    if (pgErr.code === '23502') {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === undefined || isNaN(Number(id)) || Number(id) < 0 || id === '' || id.includes('.')) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted', user: result.rows[0] });
  } catch (err: unknown) {
    const pgErr = err as { code?: string; constraint?: string };
    if (pgErr.code === '23503') {
      res.status(409).json({ error: 'Cannot delete user: user has associated orders' });
      return;
    }
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
