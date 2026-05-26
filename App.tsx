// App.tsx
import {
  auth,
  db,
  loginWithGoogle,
  logout,
  getNotesCollection,
  getCategoriesCollection,
  handleFirestoreError,
  OperationType
} from './lib/firebase';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Note, Category, Language, SortOption, UserProfile } from './types';
import { TRANSLATIONS, DEFAULT_CATEGORIES, UI_MESSAGES } from './constants';
import TopBar from './components/TopBar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import CategoryManager from './components/CategoryManager';
import Toast from './components/Toast';
import Lightbox from './components/Lightbox';
import FocusModal from './components/FocusModal';
import ConfirmModal from './components/ConfirmModal';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc, setDoc, deleteDoc, writeBatch, collection, query, orderBy, limit } from 'firebase/firestore';

const DRAFT_KEY = 'girok_draft_v5';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>('ko');
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [dbError, setDbError] = useState<boolean>(false);
  
  // Editor State
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter/UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Layout State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isEditorHidden, setIsEditorHidden] = useState(true);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);

  // Modals State
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [focusedNote, setFocusedNote] = useState<Note | null>(null);
  const [lastFocusedNoteId, setLastFocusedNoteId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [pendingDeleteCategoryId, setPendingDeleteCategoryId] = useState<string | null>(null);
  
  const [pendingUpdateNote, setPendingUpdateNote] = useState<Note | null>(null);
  const [showLeaveEditConfirm, setShowLeaveEditConfirm] = useState(false);
  const [pendingSwitchNote, setPendingSwitchNote] = useState<Note | null>(null);
  const [showNoCategoryModal, setShowNoCategoryModal] = useState(false);

  const t = TRANSLATIONS[lang];
  const msg = UI_MESSAGES[lang];

  // 1. Layout and Auth State
    useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsOverlay(width < 1280);
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    
    console.log("CURRENT URL:", window.location.href);
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("AUTH STATE:", firebaseUser);

      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
        setNotes([]);
        setCategories([]);
      }

      setIsLoading(false);
    });

    return () => {
      window.removeEventListener('resize', checkLayout);
      unsubscribeAuth();
    };
  }, []);

  // 2. Real-time Firestore Sync
  useEffect(() => {
    if (!user) return;

    setIsNotesLoading(true);
    
    // Sync Categories
    const categoriesRef = getCategoriesCollection(user.uid);
    const unsubscribeCats = onSnapshot(categoriesRef, (snapshot) => {
      const fetchedCats = snapshot.docs.map(doc => ({ ...doc.data() } as Category));
      
      if (fetchedCats.length === 0) {
        // Initialize default categories for new users
        const batch = writeBatch(db);
        const initialCats = DEFAULT_CATEGORIES.map(c => {
          const id = `cat-${crypto.randomUUID()}`;
          const catDoc = doc(db, `users/${user.uid}/categories`, id);
          const catData: Category = { id, userId: user.uid, name: c.name ?? '' };
          batch.set(catDoc, catData);
          return catData;
        });
        batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/categories`));
        setCategories(initialCats);
      } else {
        setCategories(fetchedCats);
      }
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/categories`);
      setDbError(true);
      setIsLoading(false);
    });

    // Sync Notes
    const notesRef = getNotesCollection(user.uid);
    const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({ ...doc.data() } as Note));
      setNotes(fetchedNotes);
      setIsNotesLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/notes`);
      setIsNotesLoading(false);
    });

    return () => {
      unsubscribeCats();
      unsubscribeNotes();
    };
  }, [user]);

  // 3. Draft Persistence (Keep Local for Speed)
  useEffect(() => {
    if (!user || !editingNote || !isDirty) return;
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`${DRAFT_KEY}_${user.uid}`, JSON.stringify(editingNote));
      } catch (e) {
        console.warn("Local storage error", e);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [editingNote, isDirty, user]);

  useEffect(() => {
    if (user && !editingNote && !isLoading && categories.length > 0) {
      const saved = localStorage.getItem(`${DRAFT_KEY}_${user.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only use draft if categories still exist
          if (categories.some(c => c.id === parsed.categoryId)) {
            setEditingNote(parsed);
            setIsDirty(true);
          } else {
            handleCreateNoteInternal();
          }
        } catch (e) {
          handleCreateNoteInternal();
        }
      } else {
        handleCreateNoteInternal();
      }
    }
  }, [user, isLoading, categories]);

  const filteredNotes = useMemo(() => {
    let result = [...notes];
    if (selectedCategoryId) {
      result = result.filter(n => n.categoryId === selectedCategoryId);
    }
    if (searchDate) {
      result = result.filter(n => {
        const d = new Date(n.date);
        return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}` === searchDate;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => n.textContent.toLowerCase().includes(q));
    }
    if (sortBy === 'date-desc') result.sort((a, b) => b.date - a.date);
    else if (sortBy === 'date-asc') result.sort((a, b) => a.date - b.date);
    else if (sortBy === 'category') result.sort((a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''));
    return result;
  }, [notes, searchQuery, searchDate, sortBy, selectedCategoryId]);

  const handleCreateNoteInternal = () => {
    if (categories.length === 0) return;
    setLastFocusedNoteId(null);
    const initialCategoryId = selectedCategoryId || (categories.length > 0 ? categories[0].id : '');
    const initialCategoryName = categories.find(c => c.id === initialCategoryId)?.name || '기타';
    setEditingNote({
      id: `new-${crypto.randomUUID()}`,
      userId: user?.uid || '',
      date: 0, 
      lastModifiedAt: 0,
      categoryId: initialCategoryId,
      categoryName: initialCategoryName,
      textContent: '',
      photoUrls: []
    });
    setIsDirty(false);
  };

  const handleCreateNoteRequested = () => {
    if (isDirty) setShowLeaveEditConfirm(true);
    else handleCreateNoteInternal();
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const handleEditRequest = (note: Note) => {
    if (editingNote?.id === note.id) {
      setIsMobileEditorOpen(true);
      return;
    }
    if (isDirty) setPendingSwitchNote(note);
    else {
      setEditingNote(note);
      setIsDirty(false);
      setIsMobileEditorOpen(true);
      setIsEditorHidden(false);
    }
  };

  const handleSaveNote = (note: Note) => {
    if (!note.id.startsWith('new-')) setPendingUpdateNote(note);
    else executeSave(note);
    console.log("Save requested for note:", note);
  };

  const executeSave = async (finalNote: Note) => {
    if (isSaving || !user) return;
    setIsSaving(true);
    const path = `users/${user.uid}/notes`;
    try {
      const isNew = finalNote.id.startsWith('new-');
      const storageId = isNew ? crypto.randomUUID() : finalNote.id;
      const now = Date.now();
      const currentCat = categories.find(c => c.id === finalNote.categoryId);
      const noteToSave: Note = {
        ...finalNote,
        id: storageId,
        userId: user.uid,
        categoryName: currentCat?.name || finalNote.categoryName || '기타',
        date: isNew ? now : finalNote.date,
        lastModifiedAt: now
      };
      
      const docRef = doc(db, path, storageId);
      await setDoc(docRef, noteToSave);

      if (isNew) setLastFocusedNoteId(null);
      setToastMessage(isNew ? msg.saved : msg.updated);
      setEditingNote(null);
      setIsDirty(false);
      setPendingUpdateNote(null);
      localStorage.removeItem(`${DRAFT_KEY}_${user.uid}`);
    } catch (e: any) {
      handleFirestoreError(e, OperationType.WRITE, path);
      setToastMessage("저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId || !user) return;
    const path = `users/${user.uid}/notes/${deleteConfirmId}`;
    try {
      await deleteDoc(doc(db, path));
      if (editingNote?.id === deleteConfirmId) {
        setEditingNote(null);
        setIsDirty(false);
        localStorage.removeItem(`${DRAFT_KEY}_${user.uid}`);
      }
      setToastMessage(lang === 'ko' ? '기록이 삭제되었습니다.' : 'Note deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      setToastMessage("삭제 실패");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 text-slate-800 p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-12 text-center border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100">
             <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
             </svg>
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Girok (기록)</h1>
          <p className="text-slate-400 mb-10 text-sm font-medium uppercase tracking-widest">{lang === 'ko' ? '나만의 개인 기록 공간' : 'Your personal space for records'}</p>
          
          <button 
            onClick={() => loginWithGoogle().catch(err => alert(err.message))}
            className="w-full py-4 px-6 bg-slate-900 hover:bg-black text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 640 640"><path fill="rgb(255, 255, 255)" d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z"/></svg>
            {lang === 'ko' ? 'Google로 시작하기' : 'Continue with Google'}
          </button>

          <div className="mt-8 flex items-center justify-center gap-4">
             <button onClick={() => setLang('ko')} className={`text-xs font-black ${lang === 'ko' ? 'text-blue-500' : 'text-slate-300'}`}>KOREAN</button>
             <div className="w-1 h-1 bg-slate-200 rounded-full" />
             <button onClick={() => setLang('en')} className={`text-xs font-black ${lang === 'en' ? 'text-blue-500' : 'text-slate-300'}`}>ENGLISH</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-800" style={{ backgroundColor: '#FDFDFD' }}>
      <TopBar lang={lang} setLang={setLang} user={user} onLogout={logout} />
      <main className="flex flex-1 overflow-hidden relative">
        {dbError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white text-center">
            <h2 className="text-2xl font-black mb-2">Database Error</h2>
            <p className="text-slate-500 mb-4">Failed to connect to Firestore. Please check your permissions.</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-900 text-white rounded-2xl">Reload Page</button>
          </div>
        ) : (
          <>
            <div 
              style={{ 
                flex: isOverlay ? '1 0 100%' : (isFocusMode ? '0 0 0%' : '2 0 0%'), 
                width: isOverlay ? '100%' : (isFocusMode ? '0' : 'auto'), 
                backgroundColor: '#FDFDFD' 
              }} 
              className={`border-r border-slate-200 flex flex-col transition-all duration-500 overflow-hidden ${isFocusMode ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
            >
              <NoteList 
                notes={filteredNotes} categories={categories} editingId={editingNote?.id || null}
                onEdit={handleEditRequest} onDelete={setDeleteConfirmId} 
                onFocus={(note) => {
                  setFocusedNote(note);
                  setLastFocusedNoteId(note.id);
                }}
                onImageClick={openLightbox} lang={lang} searchQuery={searchQuery} onSearch={setSearchQuery}
                searchDate={searchDate} onSearchDate={setSearchDate} selectedCategoryId={selectedCategoryId}
                onCategorySelect={setSelectedCategoryId} onCreateNote={() => { handleCreateNoteRequested(); setIsMobileEditorOpen(true); setIsEditorHidden(false); }}
                onManageCategories={() => setShowCategoryManager(true)}
                sortBy={sortBy} onSort={setSortBy} focusedNoteId={lastFocusedNoteId}
                isMobile={isOverlay}
              />
            </div>
            <div 
              style={{ 
                flex: isOverlay ? '1 0 100%' : (isEditorHidden ? '0 0 0%' : '1 0 0%'), 
                width: isOverlay ? '100%' : (isEditorHidden ? '0' : 'auto'), 
                height: isOverlay ? 'calc(100% - 85px)' : 'auto',
                top: isOverlay ? '85px' : 'auto',
                backgroundColor: '#FDFDFD' 
              }} 
              className={`
                flex flex-col overflow-hidden transition-all duration-500
                fixed bottom-0 left-0 right-0 z-[60] xl:relative xl:inset-auto xl:z-0
                ${isMobileEditorOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}
                ${!isOverlay && isEditorHidden ? 'opacity-0 invisible translate-x-full' : ''}
              `}
            >
              {isLoading || isNotesLoading ? (
                <div className="flex-1 flex items-center justify-center text-slate-300">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : editingNote ? (
                <NoteEditor 
                  note={editingNote} categories={categories} onSave={(note) => { handleSaveNote(note); setIsMobileEditorOpen(false); }}
                  onDelete={setDeleteConfirmId} onReset={handleCreateNoteRequested}
                  onDirty={setIsDirty} onChange={setEditingNote} onManageCategories={() => setShowCategoryManager(true)} lang={lang}
                  isFocusMode={isFocusMode} onToggleFocus={() => setIsFocusMode(!isFocusMode)}
                  onHide={() => { setIsEditorHidden(true); setIsMobileEditorOpen(false); }}
                  isMobile={isOverlay}
                />
              ) : (
                <button 
                  onClick={() => { handleCreateNoteRequested(); setIsMobileEditorOpen(true); }}
                  className="flex-1 flex flex-col items-center justify-center p-12 text-center group hover:bg-slate-50/50 transition-all"
                >
                  <div className="w-24 h-24 mb-6 text-slate-100 group-hover:text-blue-200 transition-colors relative">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-blue-500 transition-colors">
                    {lang === 'ko' ? '+ 기록 새로 작성하기' : '+ Create New Note'}
                  </p>
                  <p className="mt-4 text-[10px] text-slate-300 font-medium uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-opacity">
                    {lang === 'ko' ? '여기를 눌러서 시작하세요' : 'Click here to get started'}
                  </p>
                </button>
              )}
            </div>
            
            <button 
              onClick={() => { 
                if (isMobileEditorOpen) {
                  setIsMobileEditorOpen(false);
                  if (!isOverlay) setIsEditorHidden(true);
                } else {
                  handleCreateNoteRequested(); 
                  setIsMobileEditorOpen(true);
                  setIsEditorHidden(false);
                }
              }}
              className="fixed bottom-8 right-8 z-[70] w-14 h-14 bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-600 transition-all active:scale-95"
              title={isMobileEditorOpen ? 'Close Editor' : 'Open Editor'}
            >
              <svg className={`w-8 h-8 transition-transform duration-300 ${isMobileEditorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        )}
      </main>

      {showCategoryManager && user && (
        <CategoryManager 
          categories={categories}
          userId={user.uid}
          onUpdate={async (newCats) => {
            const addedCat = newCats.find(nc => !categories.some(c => c.id === nc.id));
            if (addedCat) {
              const path = `users/${user.uid}/categories/${addedCat.id}`;
              try {
                await setDoc(doc(db, path), addedCat);
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, path);
              }
            }
          }}
          onDeleteRequest={async (id) => {
            const path = `users/${user.uid}/categories/${id}`;
            try {
              await deleteDoc(doc(db, path));
              if (selectedCategoryId === id) setSelectedCategoryId(null);
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, path);
            }
          }}
          onClose={() => setShowCategoryManager(false)}
          lang={lang}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {lightboxImages && <Lightbox images={lightboxImages} index={lightboxIndex} onClose={() => setLightboxImages(null)} onIndexChange={setLightboxIndex} />}
      {focusedNote && <FocusModal note={focusedNote} categories={categories} lang={lang} onClose={() => setFocusedNote(null)} />}
      {deleteConfirmId && <ConfirmModal title={msg.deleteConfirm} onConfirm={confirmDelete} onCancel={() => setDeleteConfirmId(null)} lang={lang} variant="delete" />}
      {pendingUpdateNote && <ConfirmModal title={msg.editConfirm} onConfirm={() => executeSave(pendingUpdateNote)} onCancel={() => setPendingUpdateNote(null)} lang={lang} variant="edit" />}
      {showLeaveEditConfirm && <ConfirmModal title={msg.leaveEditConfirm} onConfirm={() => { handleCreateNoteInternal(); setShowLeaveEditConfirm(false); localStorage.removeItem(`${DRAFT_KEY}_${user?.uid}`); }} onCancel={() => setShowLeaveEditConfirm(false)} lang={lang} cancelLabel={msg.keepEditing} variant="info" />}
      {pendingSwitchNote && <ConfirmModal title={msg.switchNoteConfirm} onConfirm={() => { setEditingNote(pendingSwitchNote); setPendingSwitchNote(null); setIsDirty(false); setIsMobileEditorOpen(true); setIsEditorHidden(false); }} onCancel={() => setPendingSwitchNote(null)} lang={lang} cancelLabel={msg.keepEditing} variant="info" />}
    </div>
  );
};

export default App;

