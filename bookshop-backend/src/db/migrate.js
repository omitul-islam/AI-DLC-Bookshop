const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  console.log('[Migrate] Starting database migration...');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'bookshop',
    user: process.env.DB_USER || 'bookshop',
    password: process.env.DB_PASSWORD || 'bookshop',
  });

  try {
    // Apply full schema (CREATE TABLE IF NOT EXISTS for new installs)
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);

    // Apply ALTER statements for existing tables
    // 1. Add return_reason column if missing
    await pool.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS return_reason VARCHAR(500)
    `);

    // 2. Update orders status CHECK constraint to include 'completed'
    await pool.query(`
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check
    `);
    await pool.query(`
      ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'))
    `);

    // 3. Update stock_movements reason CHECK constraint to include 'return_restock'
    await pool.query(`
      ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_reason_check
    `);
    await pool.query(`
      ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_reason_check
      CHECK (reason IN ('order_deduction', 'manual_restock', 'manual_adjustment', 'correction', 'cancellation', 'return_restock'))
    `);

    console.log('[Migrate] Schema applied successfully.');
  } catch (error) {
    console.error('[Migrate] Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate();
