import { v4 as uuidv4 } from 'uuid';
import { PostgresDatabase } from './database';

async function seed() {
  console.log('[Seed] Starting database seed...');

  const db = new PostgresDatabase();
  const pool = db.getPool();
  const now = new Date();

  try {
    // Clear existing data (order matters: child tables first)
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM books');
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM customers');

    // ---- Categories ----
    const categories = [
      { id: uuidv4(), name: 'Fiction', description: 'Fiction and literature books' },
      { id: uuidv4(), name: 'Non-Fiction', description: 'Factual and educational books' },
      { id: uuidv4(), name: 'Science', description: 'Science, technology, and mathematics' },
      { id: uuidv4(), name: 'History', description: 'Historical events and biographies' },
      { id: uuidv4(), name: 'Fantasy', description: 'Fantasy and science fiction' },
    ];

    for (const cat of categories) {
      await pool.query(
        `INSERT INTO categories (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`,
        [cat.id, cat.name, cat.description, now, now]
      );
    }
    console.log(`[Seed] Created ${categories.length} categories`);

    // ---- Books ----
    const books = [
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 15.99, stock: 25, categoryId: categories[0].id },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 18.99, stock: 30, categoryId: categories[0].id },
      { title: '1984', author: 'George Orwell', price: 14.99, stock: 20, categoryId: categories[0].id },
      { title: 'A Brief History of Time', author: 'Stephen Hawking', price: 24.99, stock: 15, categoryId: categories[2].id },
      { title: 'The Art of War', author: 'Sun Tzu', price: 9.99, stock: 40, categoryId: categories[1].id },
      { title: 'Sapiens', author: 'Yuval Noah Harari', price: 22.99, stock: 18, categoryId: categories[1].id },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 16.99, stock: 35, categoryId: categories[4].id },
      { title: 'Dune', author: 'Frank Herbert', price: 19.99, stock: 12, categoryId: categories[4].id },
      { title: 'The Diary of a Young Girl', author: 'Anne Frank', price: 11.99, stock: 22, categoryId: categories[3].id },
      { title: 'Cosmos', author: 'Carl Sagan', price: 20.99, stock: 8, categoryId: categories[2].id },
    ];

    for (const book of books) {
      await pool.query(
        `INSERT INTO books (id, title, author, price, stock, category_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [uuidv4(), book.title, book.author, book.price, book.stock, book.categoryId, now, now]
      );
    }
    console.log(`[Seed] Created ${books.length} books`);

    // ---- Customers ----
    const customers = [
      { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101', address: '123 Oak St, Springfield' },
      { name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-0102', address: '456 Maple Ave, Portland' },
      { name: 'Carol Davis', email: 'carol@example.com', phone: '+1-555-0103' },
      { name: 'David Wilson', email: 'david@example.com', phone: '+1-555-0104', address: '789 Pine Rd, Seattle' },
    ];

    for (const cust of customers) {
      await pool.query(
        `INSERT INTO customers (id, name, email, phone, address, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), cust.name, cust.email, cust.phone, cust.address || null, now, now]
      );
    }
    console.log(`[Seed] Created ${customers.length} customers`);

    console.log('[Seed] Done!');
  } catch (error) {
    console.error('[Seed] Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
