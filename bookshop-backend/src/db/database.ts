import { Pool, PoolClient, QueryResult } from 'pg';

// =============================================================================
// Shared Types
// =============================================================================

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  categoryId: string;
  coverUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  customerId: string;
  bookId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

interface StockMovement {
  id: string;
  bookId: string;
  oldStock: number;
  newStock: number;
  quantity: number;
  reason: 'order_deduction' | 'manual_restock' | 'manual_adjustment' | 'correction';
  referenceId?: string;
  createdAt: Date;
}

interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  previousState?: any;
  newState?: any;
  performedBy: string;
  createdAt: Date;
}

export type { Book, Category, Customer, Order, StockMovement, AuditEntry };

// =============================================================================
// InMemoryDatabase
//
// Phase 1 implementation — Map-based store for rapid prototyping.
// Data lives in RAM, resets on server restart, no external dependencies.
// Kept here as reference and for development environments without PostgreSQL.
// =============================================================================

class InMemoryDatabase {
  private books: Map<string, Book> = new Map();
  private customers: Map<string, Customer> = new Map();
  private orders: Map<string, Order> = new Map();
  private categories: Map<string, Category> = new Map();
  private stockMovements: Map<string, StockMovement> = new Map();
  private auditLogs: Map<string, AuditEntry> = new Map();

  async createBook(book: Book): Promise<Book> {
    this.books.set(book.id, book);
    return book;
  }

  async findAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findBookById(id: string): Promise<Book | null> {
    return this.books.get(id) || null;
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    const book = this.books.get(id);
    if (!book) return null;
    const updated = { ...book, ...updates, updatedAt: new Date() };
    this.books.set(id, updated);
    return updated;
  }

  async deleteBook(id: string): Promise<boolean> {
    return this.books.delete(id);
  }

  async searchBooks(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.books.values()).filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery)
    );
  }

  async findBooksByCategory(categoryId: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(
      (b) => b.categoryId === categoryId
    );
  }

  async createCategory(category: Category): Promise<Category> {
    this.categories.set(category.id, category);
    return category;
  }

  async findAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findCategoryById(id: string): Promise<Category | null> {
    return this.categories.get(id) || null;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const category = this.categories.get(id);
    if (!category) return null;
    const updated = { ...category, ...updates, updatedAt: new Date() };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  async createCustomer(customer: Customer): Promise<Customer> {
    this.customers.set(customer.id, customer);
    return customer;
  }

  async findAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findCustomerById(id: string): Promise<Customer | null> {
    return this.customers.get(id) || null;
  }

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    return (
      Array.from(this.customers.values()).find(
        (c) => c.email.toLowerCase() === email.toLowerCase()
      ) || null
    );
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.customers.values()).filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery) ||
        c.phone.toLowerCase().includes(lowerQuery)
    );
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customer = this.customers.get(id);
    if (!customer) return null;
    const updated = { ...customer, ...updates, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
  }

  async createOrder(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async findAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findOrderById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async findOrdersByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (o) => o.customerId === customerId
    );
  }

  async findOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => o.status === status);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const order = this.orders.get(id);
    if (!order) return null;
    const updated = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  async findAllBooksPaginated(page: number, limit: number): Promise<{ data: Book[]; total: number }> {
    const all = Array.from(this.books.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = (page - 1) * limit;
    return { data: all.slice(offset, offset + limit), total: all.length };
  }

  async searchBooksPaginated(query: string, page: number, limit: number): Promise<{ data: Book[]; total: number }> {
    const lowerQuery = query.toLowerCase();
    const filtered = Array.from(this.books.values()).filter(
      (book) => book.title.toLowerCase().includes(lowerQuery) || book.author.toLowerCase().includes(lowerQuery)
    );
    const offset = (page - 1) * limit;
    return { data: filtered.slice(offset, offset + limit), total: filtered.length };
  }

  async findAllCustomersPaginated(page: number, limit: number): Promise<{ data: Customer[]; total: number }> {
    const all = Array.from(this.customers.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = (page - 1) * limit;
    return { data: all.slice(offset, offset + limit), total: all.length };
  }

  async searchCustomersPaginated(query: string, page: number, limit: number): Promise<{ data: Customer[]; total: number }> {
    const lowerQuery = query.toLowerCase();
    const filtered = Array.from(this.customers.values()).filter(
      (c) => c.name.toLowerCase().includes(lowerQuery) || c.email.toLowerCase().includes(lowerQuery) || c.phone.toLowerCase().includes(lowerQuery)
    );
    const offset = (page - 1) * limit;
    return { data: filtered.slice(offset, offset + limit), total: filtered.length };
  }

  async findAllOrdersPaginated(page: number, limit: number, filters?: { status?: string; customerId?: string }): Promise<{ data: Order[]; total: number }> {
    let filtered = Array.from(this.orders.values());
    if (filters?.status) filtered = filtered.filter(o => o.status === filters.status);
    if (filters?.customerId) filtered = filtered.filter(o => o.customerId === filters.customerId);
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = (page - 1) * limit;
    return { data: filtered.slice(offset, offset + limit), total: filtered.length };
  }

  async findOrdersByCustomerIdPaginated(customerId: string, page: number, limit: number): Promise<{ data: Order[]; total: number }> {
    const filtered = Array.from(this.orders.values()).filter(o => o.customerId === customerId);
    const offset = (page - 1) * limit;
    return { data: filtered.slice(offset, offset + limit), total: filtered.length };
  }

  async findOrdersByStatusPaginated(status: string, page: number, limit: number): Promise<{ data: Order[]; total: number }> {
    const filtered = Array.from(this.orders.values()).filter(o => o.status === status);
    const offset = (page - 1) * limit;
    return { data: filtered.slice(offset, offset + limit), total: filtered.length };
  }

  async recordStockMovement(movement: StockMovement): Promise<void> {
    this.stockMovements.set(movement.id, movement);
  }

  async getStockMovements(bookId: string, page: number, limit: number): Promise<{ data: StockMovement[]; total: number }> {
    const all = Array.from(this.stockMovements.values())
      .filter(m => m.bookId === bookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = (page - 1) * limit;
    return { data: all.slice(offset, offset + limit), total: all.length };
  }

  async adjustStock(bookId: string, newStock: number, reason: string, referenceId?: string): Promise<Book> {
    const book = this.books.get(bookId);
    if (!book) throw new Error('Book not found');
    const oldStock = book.stock;
    const updatedBook = { ...book, stock: newStock, updatedAt: new Date() };
    this.books.set(bookId, updatedBook);
    const movement: StockMovement = {
      id: require('uuid').v4(),
      bookId,
      oldStock,
      newStock,
      quantity: newStock - oldStock,
      reason: reason as StockMovement['reason'],
      referenceId,
      createdAt: new Date(),
    };
    this.stockMovements.set(movement.id, movement);
    return updatedBook;
  }

  async createAuditLog(entry: AuditEntry): Promise<void> {
    this.auditLogs.set(entry.id, entry);
  }

  async getAuditLog(filters: { entityType?: string; entityId?: string; action?: string; fromDate?: string; toDate?: string; page: number; limit: number }): Promise<{ data: AuditEntry[]; total: number }> {
    let filtered = Array.from(this.auditLogs.values());
    if (filters.entityType) filtered = filtered.filter(e => e.entityType === filters.entityType);
    if (filters.entityId) filtered = filtered.filter(e => e.entityId === filters.entityId);
    if (filters.action) filtered = filtered.filter(e => e.action === filters.action);
    if (filters.fromDate) filtered = filtered.filter(e => e.createdAt >= new Date(filters.fromDate!));
    if (filters.toDate) filtered = filtered.filter(e => e.createdAt <= new Date(filters.toDate!));
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = (filters.page - 1) * filters.limit;
    return { data: filtered.slice(offset, offset + filters.limit), total: filtered.length };
  }

  async transaction<T>(callback: (db: InMemoryDatabase) => Promise<T>): Promise<T> {
    return await callback(this);
  }
}

// =============================================================================
// PostgreSQL Database
//
// Phase 2 implementation — persistent storage with pg Pool.
// All queries use parameterized inputs (no SQL injection).
// snake_case column names mapped to camelCase TypeScript interfaces.
// Transaction support via dedicated PoolClient with BEGIN/COMMIT/ROLLBACK.
// =============================================================================

const NUMERIC_FIELDS = new Set(['price', 'totalPrice']);

function toCamelCase(row: any): any {
  if (!row) return row;
  const result: any = {};
  for (const key of Object.keys(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = row[key];
    result[camelKey] = NUMERIC_FIELDS.has(camelKey) && typeof val === 'string' ? parseFloat(val) : val;
  }
  return result;
}

class PostgresDatabase {
  private pool: Pool;
  private txClient: PoolClient | null = null;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'bookshop',
      user: process.env.DB_USER || 'bookshop',
      password: process.env.DB_PASSWORD || 'bookshop',
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  private async query(text: string, params?: any[]): Promise<QueryResult> {
    if (this.txClient) {
      return this.txClient.query(text, params);
    }
    return this.pool.query(text, params);
  }

  async transaction<T>(callback: (db: PostgresDatabase) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    this.txClient = client;
    try {
      await client.query('BEGIN');
      const result = await callback(this);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      this.txClient = null;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  // ---- Books ----

  async createBook(book: Book): Promise<Book> {
    const { rows } = await this.query(
      `INSERT INTO books (id, title, author, price, stock, category_id, cover_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [book.id, book.title, book.author, book.price, book.stock, book.categoryId, book.coverUrl || null, book.createdAt, book.updatedAt]
    );
    return toCamelCase(rows[0]) as Book;
  }

  async findAllBooks(): Promise<Book[]> {
    const { rows } = await this.query('SELECT * FROM books ORDER BY created_at DESC');
    return rows.map((r) => toCamelCase(r) as Book);
  }

  async findBookById(id: string): Promise<Book | null> {
    const { rows } = await this.query('SELECT * FROM books WHERE id = $1', [id]);
    return rows.length ? (toCamelCase(rows[0]) as Book) : null;
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.title !== undefined) { fields.push(`title = $${idx++}`); values.push(updates.title); }
    if (updates.author !== undefined) { fields.push(`author = $${idx++}`); values.push(updates.author); }
    if (updates.price !== undefined) { fields.push(`price = $${idx++}`); values.push(updates.price); }
    if (updates.stock !== undefined) { fields.push(`stock = $${idx++}`); values.push(updates.stock); }
    if (updates.categoryId !== undefined) { fields.push(`category_id = $${idx++}`); values.push(updates.categoryId); }
    if (updates.coverUrl !== undefined) { fields.push(`cover_url = $${idx++}`); values.push(updates.coverUrl); }
    if (fields.length === 0) return this.findBookById(id);

    values.push(id);
    const { rows } = await this.query(
      `UPDATE books SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows.length ? (toCamelCase(rows[0]) as Book) : null;
  }

  async deleteBook(id: string): Promise<boolean> {
    const { rowCount } = await this.query('DELETE FROM books WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const { rows } = await this.query(
      `SELECT * FROM books WHERE LOWER(title) LIKE LOWER($1) OR LOWER(author) LIKE LOWER($1) ORDER BY created_at DESC`,
      [`%${query}%`]
    );
    return rows.map((r) => toCamelCase(r) as Book);
  }

  async findBooksByCategory(categoryId: string): Promise<Book[]> {
    const { rows } = await this.query(
      'SELECT * FROM books WHERE category_id = $1 ORDER BY created_at DESC',
      [categoryId]
    );
    return rows.map((r) => toCamelCase(r) as Book);
  }

  // ---- Categories ----

  async createCategory(category: Category): Promise<Category> {
    const { rows } = await this.query(
      `INSERT INTO categories (id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [category.id, category.name, category.description, category.createdAt, category.updatedAt]
    );
    return toCamelCase(rows[0]) as Category;
  }

  async findAllCategories(): Promise<Category[]> {
    const { rows } = await this.query('SELECT * FROM categories ORDER BY created_at DESC');
    return rows.map((r) => toCamelCase(r) as Category);
  }

  async findCategoryById(id: string): Promise<Category | null> {
    const { rows } = await this.query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows.length ? (toCamelCase(rows[0]) as Category) : null;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); values.push(updates.name); }
    if (updates.description !== undefined) { fields.push(`description = $${idx++}`); values.push(updates.description); }
    if (fields.length === 0) return this.findCategoryById(id);

    values.push(id);
    const { rows } = await this.query(
      `UPDATE categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows.length ? (toCamelCase(rows[0]) as Category) : null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { rowCount } = await this.query('DELETE FROM categories WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }

  // ---- Customers ----

  async createCustomer(customer: Customer): Promise<Customer> {
    const { rows } = await this.query(
      `INSERT INTO customers (id, name, email, phone, address, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customer.id, customer.name, customer.email, customer.phone, customer.address || null, customer.createdAt, customer.updatedAt]
    );
    return toCamelCase(rows[0]) as Customer;
  }

  async findAllCustomers(): Promise<Customer[]> {
    const { rows } = await this.query('SELECT * FROM customers ORDER BY created_at DESC');
    return rows.map((r) => toCamelCase(r) as Customer);
  }

  async findCustomerById(id: string): Promise<Customer | null> {
    const { rows } = await this.query('SELECT * FROM customers WHERE id = $1', [id]);
    return rows.length ? (toCamelCase(rows[0]) as Customer) : null;
  }

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    const { rows } = await this.query('SELECT * FROM customers WHERE LOWER(email) = LOWER($1)', [email]);
    return rows.length ? (toCamelCase(rows[0]) as Customer) : null;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const { rows } = await this.query(
      `SELECT * FROM customers WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1) OR phone LIKE $1 ORDER BY created_at DESC`,
      [`%${query}%`]
    );
    return rows.map((r) => toCamelCase(r) as Customer);
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); values.push(updates.name); }
    if (updates.email !== undefined) { fields.push(`email = $${idx++}`); values.push(updates.email); }
    if (updates.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(updates.phone); }
    if (updates.address !== undefined) { fields.push(`address = $${idx++}`); values.push(updates.address); }
    if (fields.length === 0) return this.findCustomerById(id);

    values.push(id);
    const { rows } = await this.query(
      `UPDATE customers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows.length ? (toCamelCase(rows[0]) as Customer) : null;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const { rowCount } = await this.query('DELETE FROM customers WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }

  // ---- Orders ----

  async createOrder(order: Order): Promise<Order> {
    const { rows } = await this.query(
      `INSERT INTO orders (id, customer_id, book_id, quantity, total_price, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [order.id, order.customerId, order.bookId, order.quantity, order.totalPrice, order.status, order.createdAt, order.updatedAt]
    );
    return toCamelCase(rows[0]) as Order;
  }

  async findAllOrders(): Promise<Order[]> {
    const { rows } = await this.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows.map((r) => toCamelCase(r) as Order);
  }

  async findOrderById(id: string): Promise<Order | null> {
    const { rows } = await this.query('SELECT * FROM orders WHERE id = $1', [id]);
    return rows.length ? (toCamelCase(rows[0]) as Order) : null;
  }

  async findOrdersByCustomerId(customerId: string): Promise<Order[]> {
    const { rows } = await this.query(
      'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    return rows.map((r) => toCamelCase(r) as Order);
  }

  async findOrdersByStatus(status: string): Promise<Order[]> {
    const { rows } = await this.query(
      'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return rows.map((r) => toCamelCase(r) as Order);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
    if (fields.length === 0) return this.findOrderById(id);

    values.push(id);
    const { rows } = await this.query(
      `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows.length ? (toCamelCase(rows[0]) as Order) : null;
  }

  // ---- Paginated Lists ----

  async findAllBooksPaginated(page: number, limit: number): Promise<{ data: Book[]; total: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.query('SELECT * FROM books ORDER BY created_at DESC OFFSET $1 LIMIT $2', [offset, limit]),
      this.query('SELECT COUNT(*) as count FROM books'),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as Book),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async searchBooksPaginated(query: string, page: number, limit: number): Promise<{ data: Book[]; total: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.query(`SELECT * FROM books WHERE LOWER(title) LIKE LOWER($1) OR LOWER(author) LIKE LOWER($1) ORDER BY created_at DESC OFFSET $2 LIMIT $3`, [`%${query}%`, offset, limit]),
      this.query(`SELECT COUNT(*) as count FROM books WHERE LOWER(title) LIKE LOWER($1) OR LOWER(author) LIKE LOWER($1)`, [`%${query}%`]),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as Book),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async findAllCustomersPaginated(page: number, limit: number): Promise<{ data: Customer[]; total: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.query('SELECT * FROM customers ORDER BY created_at DESC OFFSET $1 LIMIT $2', [offset, limit]),
      this.query('SELECT COUNT(*) as count FROM customers'),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as Customer),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async searchCustomersPaginated(query: string, page: number, limit: number): Promise<{ data: Customer[]; total: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.query(`SELECT * FROM customers WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1) OR phone LIKE $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3`, [`%${query}%`, offset, limit]),
      this.query(`SELECT COUNT(*) as count FROM customers WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1) OR phone LIKE $1`, [`%${query}%`]),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as Customer),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async findAllOrdersPaginated(page: number, limit: number, filters?: { status?: string; customerId?: string }): Promise<{ data: Order[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters?.status) { conditions.push(`status = $${idx++}`); params.push(filters.status); }
    if (filters?.customerId) { conditions.push(`customer_id = $${idx++}`); params.push(filters.customerId); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      this.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC OFFSET $${idx} LIMIT $${idx + 1}`, [...params, offset, limit]),
      this.query(`SELECT COUNT(*) as count FROM orders ${where}`, params),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as Order),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async findOrdersByCustomerIdPaginated(customerId: string, page: number, limit: number): Promise<{ data: Order[]; total: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3', [customerId, offset, limit]),
      this.query('SELECT COUNT(*) as count FROM orders WHERE customer_id = $1', [customerId]),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as Order),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async findOrdersByStatusPaginated(status: string, page: number, limit: number): Promise<{ data: Order[]; total: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.query('SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3', [status, offset, limit]),
      this.query('SELECT COUNT(*) as count FROM orders WHERE status = $1', [status]),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as Order),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  // ---- Stock Movements ----

  async recordStockMovement(movement: StockMovement): Promise<void> {
    await this.query(
      `INSERT INTO stock_movements (id, book_id, old_stock, new_stock, quantity, reason, reference_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [movement.id, movement.bookId, movement.oldStock, movement.newStock, movement.quantity, movement.reason, movement.referenceId || null, movement.createdAt]
    );
  }

  async getStockMovements(bookId: string, page: number, limit: number): Promise<{ data: StockMovement[]; total: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.query('SELECT * FROM stock_movements WHERE book_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3', [bookId, offset, limit]),
      this.query('SELECT COUNT(*) as count FROM stock_movements WHERE book_id = $1', [bookId]),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as StockMovement),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async adjustStock(bookId: string, newStock: number, reason: string, referenceId?: string): Promise<Book> {
    return await this.transaction(async (db) => {
      const book = await db.findBookById(bookId);
      if (!book) throw new Error('Book not found');
      const oldStock = book.stock;
      const updated = await db.updateBook(bookId, { stock: newStock });
      const movement: StockMovement = {
        id: require('uuid').v4(),
        bookId,
        oldStock,
        newStock,
        quantity: newStock - oldStock,
        reason: reason as StockMovement['reason'],
        referenceId,
        createdAt: new Date(),
      };
      await db.recordStockMovement(movement);
      return updated!;
    });
  }

  // ---- Audit Log ----

  async createAuditLog(entry: AuditEntry): Promise<void> {
    await this.query(
      `INSERT INTO audit_log (id, entity_type, entity_id, action, previous_state, new_state, performed_by, created_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)`,
      [entry.id, entry.entityType, entry.entityId, entry.action,
       entry.previousState ? JSON.stringify(entry.previousState) : null,
       entry.newState ? JSON.stringify(entry.newState) : null,
       entry.performedBy, entry.createdAt]
    );
  }

  async getAuditLog(filters: { entityType?: string; entityId?: string; action?: string; fromDate?: string; toDate?: string; page: number; limit: number }): Promise<{ data: AuditEntry[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filters.entityType) { conditions.push(`entity_type = $${idx++}`); params.push(filters.entityType); }
    if (filters.entityId) { conditions.push(`entity_id = $${idx++}`); params.push(filters.entityId); }
    if (filters.action) { conditions.push(`action = $${idx++}`); params.push(filters.action); }
    if (filters.fromDate) { conditions.push(`created_at >= $${idx++}`); params.push(filters.fromDate); }
    if (filters.toDate) { conditions.push(`created_at <= $${idx++}`); params.push(filters.toDate); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (filters.page - 1) * filters.limit;

    const [dataResult, countResult] = await Promise.all([
      this.query(`SELECT * FROM audit_log ${where} ORDER BY created_at DESC OFFSET $${idx} LIMIT $${idx + 1}`, [...params, offset, filters.limit]),
      this.query(`SELECT COUNT(*) as count FROM audit_log ${where}`, params),
    ]);
    return {
      data: dataResult.rows.map(r => toCamelCase(r) as AuditEntry),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }
}

// =============================================================================
// Database Selector
//
// Controlled by USE_IN_MEMORY env var:
//   USE_IN_MEMORY=true  → InMemoryDatabase (data resets on restart)
//   USE_IN_MEMORY=false or unset → PostgreSQL (persistent)
// =============================================================================

const useInMemory = process.env.USE_IN_MEMORY === 'true';

let db: PostgresDatabase | InMemoryDatabase;

if (useInMemory) {
  console.log('[DB] Using InMemoryDatabase (data resets on restart)');
  db = new InMemoryDatabase();
} else {
  console.log('[DB] Using PostgreSQL');
  db = new PostgresDatabase();
}

export { db, InMemoryDatabase, PostgresDatabase };
