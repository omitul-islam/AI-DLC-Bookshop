import { useState, useCallback } from 'react';
import { categoriesApi } from '../api/categories.api';
import type { Category, CreateCategoryRequest } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CreateCategoryRequest) => {
    const category = await categoriesApi.create(data);
    return category;
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<CreateCategoryRequest>) => {
    const category = await categoriesApi.update(id, data);
    return category;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await categoriesApi.delete(id);
  }, []);

  return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
}
