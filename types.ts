
export type Language = 'ko' | 'en';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  isDefault?: boolean;
}

export interface Note {
  id: string;
  userId: string;
  date: number; // timestamp
  lastModifiedAt: number; // timestamp
  categoryId: string;
  categoryName?: string; // Stored snapshot of the category name
  textContent: string; // HTML string from rich text
  photoUrls: string[]; // Array of strings for multiple photos
}

export type SortOption = 'date-desc' | 'date-asc' | 'category';

export interface AppTranslations {
  search: string;
  sortBy: string;
  date: string;
  category: string;
  note: string;
  save: string;
  cancel: string;
  delete: string;
  newNote: string;
  login: string;
  logout: string;
  settings: string;
  confirmUnsaved: string;
  uploadPhoto: string;
  manageCategories: string;
  placeholder: string;
  update: string;
}
