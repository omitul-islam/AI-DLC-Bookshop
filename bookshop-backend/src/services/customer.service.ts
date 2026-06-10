import { v4 as uuidv4 } from 'uuid';
import { db, Customer } from '../db/database';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../validators/customer.validator';
import { auditService } from './audit.service';
import { buildPagination } from '../utils/pagination';

// Reference: context/02-domain/03-business-rules/customer-rules.md

export class CustomerService {
  // US-006: Add Customer
  async addCustomer(request: CreateCustomerRequest): Promise<Customer> {
    // BR-CUSTOMER-003: Email uniqueness
    const existing = await db.findCustomerByEmail(request.email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    const customer: Customer = {
      id: uuidv4(),
      name: request.name,
      email: request.email,
      phone: request.phone,
      address: request.address,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await db.createCustomer(customer);
    await auditService.log('customer', created.id, 'created', null, created);
    return created;
  }

  // US-007: View Customers (paginated)
  async listCustomers(page = 1, limit = 20) {
    const { data, total } = await db.findAllCustomersPaginated(page, limit);
    return { data, pagination: buildPagination(page, limit, total) };
  }

  // Get Customer by ID
  async getCustomer(id: string): Promise<Customer> {
    const customer = await db.findCustomerById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  // Update Customer
  async updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer> {
    // BR-CUSTOMER-007: Verify customer exists
    const existing = await db.findCustomerById(id);
    if (!existing) {
      throw new Error('Customer not found');
    }

    // BR-CUSTOMER-003: Check email uniqueness if email is being changed
    if (request.email && request.email !== existing.email) {
      const emailExists = await db.findCustomerByEmail(request.email);
      if (emailExists) {
        throw new Error('Email is already registered');
      }
    }

    const updated = await db.updateCustomer(id, request);
    if (!updated) {
      throw new Error('Failed to update customer');
    }

    await auditService.log('customer', id, 'updated', existing, updated);
    return updated;
  }

  // Search customers by name, email, or phone (paginated)
  async searchCustomers(query: string, page = 1, limit = 20) {
    const { data, total } = await db.searchCustomersPaginated(query, page, limit);
    return { data, pagination: buildPagination(page, limit, total) };
  }

  // Delete Customer
  async deleteCustomer(id: string): Promise<void> {
    // BR-CUSTOMER-008: Verify customer exists
    const existing = await db.findCustomerById(id);
    if (!existing) {
      throw new Error('Customer not found');
    }

    const deleted = await db.deleteCustomer(id);
    if (!deleted) {
      throw new Error('Failed to delete customer');
    }

    await auditService.log('customer', id, 'deleted', existing, null);
  }
}

export const customerService = new CustomerService();
