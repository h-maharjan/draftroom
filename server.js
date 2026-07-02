require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/draftroom'
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS furniture_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        template TEXT NOT NULL UNIQUE,
        width NUMERIC(6,2) NOT NULL DEFAULT 1.0,
        depth NUMERIC(6,2) NOT NULL DEFAULT 1.0,
        category TEXT,
        color TEXT DEFAULT '#FF8A3D',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS room_layouts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        width NUMERIC(6,2) NOT NULL,
        depth NUMERIC(6,2) NOT NULL,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default furniture
    const defaultFurniture = [
      { name: 'Sofa', template: 'sofa', width: 2.0, depth: 0.9, category: 'seating', color: '#8FB8E8' },
      { name: 'Armchair', template: 'armchair', width: 0.8, depth: 0.8, category: 'seating', color: '#8FAE93' },
      { name: 'Coffee Table', template: 'coffee', width: 1.1, depth: 0.55, category: 'table', color: '#B08968' },
      { name: 'Dining Table', template: 'dtable', width: 1.4, depth: 0.9, category: 'table', color: '#B08968' },
      { name: 'Dining Chair', template: 'dchair', width: 0.45, depth: 0.45, category: 'seating', color: '#B08968' },
      { name: 'Bed', template: 'bed', width: 1.6, depth: 2.0, category: 'bedroom', color: '#8A6642' },
      { name: 'Bookshelf', template: 'shelf', width: 0.9, depth: 0.3, category: 'storage', color: '#B08968' },
      { name: 'Rug', template: 'rug', width: 2.0, depth: 1.4, category: 'decor', color: '#D3906B' },
      { name: 'Plant', template: 'plant', width: 0.4, depth: 0.4, category: 'decor', color: '#5E8C6A' },
      { name: 'Floor Lamp', template: 'lamp', width: 0.35, depth: 0.35, category: 'lighting', color: '#FFB27A' },
      { name: 'TV Stand', template: 'tv', width: 1.2, depth: 0.4, category: 'storage', color: '#3D4753' },
      { name: 'Desk', template: 'desk', width: 1.2, depth: 0.6, category: 'workspace', color: '#B08968' }
    ];

    for (const item of defaultFurniture) {
      await client.query(
        `INSERT INTO furniture_items (name, template, width, depth, category, color)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (template) DO NOTHING`,
        [item.name, item.template, item.width, item.depth, item.category, item.color]
      );
    }
  } finally {
    client.release();
  }
}

async function waitForDatabase(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      await pool.query('SELECT 1');
      console.log('✓ Database connected');
      return;
    } catch (error) {
      if (i === maxAttempts - 1) {
        console.error('✗ Failed to connect to database after', maxAttempts, 'attempts');
        throw error;
      }
      console.log(`Waiting for database... (attempt ${i+1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/furnitures', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM furniture_items ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/furnitures', async (req, res) => {
  const { name, template, width, depth, category, color } = req.body;
  if (!name || !template) {
    return res.status(400).json({ error: 'Name and template are required.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO furniture_items (name, template, width, depth, category, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, template, width || 1, depth || 1, category || 'custom', color || '#FF8A3D']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/furnitures/:id', async (req, res) => {
  const { id } = req.params;
  const { name, template, width, depth, category, color } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE furniture_items
       SET name = COALESCE($1, name), template = COALESCE($2, template), width = COALESCE($3, width), depth = COALESCE($4, depth), category = COALESCE($5, category), color = COALESCE($6, color)
       WHERE id = $7
       RETURNING *`,
      [name, template, width, depth, category, color, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Furniture not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/layouts', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM room_layouts ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/layouts', async (req, res) => {
  const { name, width, depth, items } = req.body;
  if (!name || width === undefined || depth === undefined) {
    return res.status(400).json({ error: 'Layout name, width, and depth are required.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO room_layouts (name, width, depth, items)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, width, depth, JSON.stringify(items || [])]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/layouts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, width, depth, items } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE room_layouts
       SET name = COALESCE($1, name), width = COALESCE($2, width), depth = COALESCE($3, depth), items = COALESCE($4, items)
       WHERE id = $5
       RETURNING *`,
      [name, width, depth, items ? JSON.stringify(items) : undefined, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Layout not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(`${__dirname}/draftroom.html`);
});

(async function start() {
  try {
    await waitForDatabase();
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Draftroom backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
