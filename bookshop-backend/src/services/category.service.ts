import { v4 as uuidv4 } from 'uuid';
import { db, Category } from '../db/database';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../validators/category.validator';

export class CategoryService {
  async addCategory(request: CreateCategoryRequest): Promise<Category> {
    const existing = (await db.findAllCategories()).find(
      (c) => c.name.toLowerCase() === request.name.toLowerCase()
    );
    if (existing) {
      throw new Error('Category with this name already exists');
    }

    const category: Category = {
      id: uuidv4(),
      name: request.name,
      description: request.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.createCategory(category);
  }

  async listCategories(): Promise<Category[]> {
    return await db.findAllCategories();
  }

  async getCategory(id: string): Promise<Category> {
    const category = await db.findCategoryById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<Category> {
    const existing = await db.findCategoryById(id);
    if (!existing) {
      throw new Error('Category not found');
    }

    if (request.name) {
      const duplicate = (await db.findAllCategories()).find(
        (c) => c.name.toLowerCase() === request.name!.toLowerCase() && c.id !== id
      );
      if (duplicate) {
        throw new Error('Category with this name already exists');
      }
    }

    const updated = await db.updateCategory(id, request);
    if (!updated) {
      throw new Error('Failed to update category');
    }

    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const existing = await db.findCategoryById(id);
    if (!existing) {
      throw new Error('Category not found');
    }

    const booksInCategory = await db.findBooksByCategory(id);
    if (booksInCategory.length > 0) {
      throw new Error(`Cannot delete category: ${booksInCategory.length} book(s) are assigned to it`);
    }

    const deleted = await db.deleteCategory(id);
    if (!deleted) {
      throw new Error('Failed to delete category');
    }
  }
}

export const categoryService = new CategoryService();
