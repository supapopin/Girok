import { AppTranslations, Category } from './types';

export const TRANSLATIONS: Record<'ko' | 'en', AppTranslations> = {
  ko: {
    search: '기록 검색',
    sortBy: '정렬',
    date: '날짜',
    category: '카테고리',
    note: '노트',
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    newNote: '새 기록',
    login: '시작하기',
    logout: '종료',
    settings: '설정',
    confirmUnsaved: '저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?',
    uploadPhoto: '사진 첨부',
    manageCategories: '카테고리 관리',
    placeholder: '당신의 생각을 기록하세요...',
    update: '수정'
  },
  en: {
    search: 'Search notes',
    sortBy: 'Sort',
    date: 'Date',
    category: 'Category',
    note: 'Note',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    newNote: 'New Note',
    login: 'Start Recording',
    logout: 'Exit',
    settings: 'Settings',
    confirmUnsaved: 'You have unsaved changes. Are you sure you want to leave?',
    uploadPhoto: 'Attach Photo',
    manageCategories: 'Manage Categories',
    placeholder: 'Write down your thoughts...',
    update: 'Update'
  }
};

export const UI_MESSAGES = {
  ko: {
    saved: '기록이 저장되었습니다.',
    updated: '기록을 수정하였습니다.',
    deleteConfirm: '해당 노트를 삭제하시겠습니까?',
    editConfirm: '해당 노트를 수정하시겠습니까?',
    leaveEditConfirm: '현재 노트 쓰기를 벗어나\n새 노트를 만드시나요?',
    switchNoteConfirm: '현재 노트 수정을 벗어나시나요?',
    lastModified: '최근 수정 날짜',
    yes: '예',
    no: '아니오',
    deleteAction: '삭제하기',
    keepEditing: '아니요,\n계속 수정할래요',
    deleteCategoryConfirmTitle: '를 지우시나요?',
    deleteCategoryConfirmDesc: '이 카테고리를 삭제하면, 해당 카테고리로 작성한 노트는 유지되지만\n카테고리별 검색은 지원되지 않습니다.',
    noCategoryTitle: '카테고리가 없습니다',
    noCategoryDesc: '노트를 작성하려면 카테고리가 최소 하나 필요합니다.\n지금 바로 추가해볼까요?',
    addCategoryNow: '카테고리 추가하기'
  },
  en: {
    saved: 'Note saved successfully.',
    updated: 'Note updated successfully.',
    deleteConfirm: 'Are you sure you want to delete this note?',
    editConfirm: 'Are you sure you want to edit this note?',
    leaveEditConfirm: 'Do you want to leave current writing\nand create a new note?',
    switchNoteConfirm: 'Do you want to leave the current edit?',
    lastModified: 'Last Modified',
    yes: 'Yes',
    no: 'No',
    deleteAction: 'Delete',
    keepEditing: 'No,\nkeep editing',
    deleteCategoryConfirmTitle: ' delete category?',
    deleteCategoryConfirmDesc: 'Deleting this category keeps the notes but removes\ncategory-specific filtering.',
    noCategoryTitle: 'No Categories Found',
    noCategoryDesc: 'You need at least one category to write a note.\nWould you like to add one now?',
    addCategoryNow: 'Add Category'
  }
};

export const DEFAULT_CATEGORIES: Partial<Category>[] = [
  { name: 'Diary', id: 'cat-diary' },
  { name: 'Movie', id: 'cat-movie' },
  { name: 'Food', id: 'cat-food' },
  { name: 'Book', id: 'cat-book' }
];

export const COLORS = {
  primary: '#3b82f6', // blue-500
  secondary: '#eff6ff', // blue-50
  accent: '#60a5fa', // blue-400
  background: '#f8fafc', // slate-50
};