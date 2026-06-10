import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'bookhouse_favorites';

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((bookId: string) => {
    setFavorites(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  }, []);

  const isFavorite = useCallback(
    (bookId: string) => favorites.includes(bookId),
    [favorites]
  );

  const addFavorite = useCallback((bookId: string) => {
    setFavorites(prev => prev.includes(bookId) ? prev : [...prev, bookId]);
  }, []);

  const removeFavorite = useCallback((bookId: string) => {
    setFavorites(prev => prev.filter(id => id !== bookId));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    favoriteCount: favorites.length,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
  };
}
