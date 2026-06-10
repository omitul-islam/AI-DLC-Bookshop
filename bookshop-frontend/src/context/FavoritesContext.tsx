import { createContext, useContext, ReactNode } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from './ToastContext';

interface FavoritesContextValue {
  favorites: string[];
  favoriteCount: number;
  toggleFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  addFavorite: (bookId: string) => void;
  removeFavorite: (bookId: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const favs = useFavorites();

  const toggleFavorite = (bookId: string) => {
    const wasFav = favs.isFavorite(bookId);
    favs.toggleFavorite(bookId);
    toast.showToast('success', wasFav ? 'Removed from favourites' : 'Added to favourites');
  };

  return (
    <FavoritesContext.Provider value={{ ...favs, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavoritesContext must be used within FavoritesProvider');
  return ctx;
}
