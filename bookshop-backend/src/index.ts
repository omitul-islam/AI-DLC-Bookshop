import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import booksRouter from './routes/books';
import customersRouter from './routes/customers';
import ordersRouter from './routes/orders';
import categoriesRouter from './routes/categories';
import contextRouter from './routes/context';
import stockRouter from './routes/stock.routes';
import auditRouter from './routes/audit.routes';
import exportRouter from './routes/export.routes';
import uploadRouter from './routes/upload.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes - Following OpenAPI contract structure
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/context', contextRouter);
app.use('/api/v1', stockRouter);
app.use('/api/v1/audit-log', auditRouter);
app.use('/api/v1/export', exportRouter);
app.use('/api/v1', uploadRouter);

// API documentation endpoint
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    name: 'Bookshop Management System API',
    version: '1.0.0',
    description: 'API for managing bookshop inventory, customers, and orders',
    endpoints: {
      books: '/api/v1/books',
      customers: '/api/v1/customers',
      orders: '/api/v1/orders',
      categories: '/api/v1/categories',
      'stock-movements': '/api/v1/books/:id/stock-movements',
      'stock-adjust': '/api/v1/books/:id/stock-adjust',
      'cover-upload': '/api/v1/books/:id/cover',
      'audit-log': '/api/v1/audit-log',
      export: '/api/v1/export/:entity',
    },
    documentation: {
      openapi: {
        books: '../bookshop-product-context/06-contracts/01-apis/rest/books.yaml',
        customers: '../bookshop-product-context/06-contracts/01-apis/rest/customers.yaml',
        orders: '../bookshop-product-context/06-contracts/01-apis/rest/orders.yaml',
        categories: '../bookshop-product-context/06-contracts/01-apis/rest/categories.yaml',
        stock: '../bookshop-product-context/06-contracts/01-apis/rest/stock.yaml',
        audit: '../bookshop-product-context/06-contracts/01-apis/rest/audit.yaml',
        export: '../bookshop-product-context/06-contracts/01-apis/rest/export.yaml',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║        Bookshop Management System API Server                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
  console.log('Available Endpoints:');
  console.log(`  📗 Books:      http://localhost:${PORT}/api/v1/books`);
  console.log(`  👥 Customers:  http://localhost:${PORT}/api/v1/customers`);
  console.log(`  📦 Orders:     http://localhost:${PORT}/api/v1/orders`);
  console.log(`  🏷️ Categories: http://localhost:${PORT}/api/v1/categories\n`);
  console.log('Implementation based on AI-DLC pattern');
  console.log('Context: ../bookshop-product-context/\n');
});

export default app;
