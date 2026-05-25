
import React, { useState } from 'react';
import { Note, Category, Language, SortOption } from '../types';
import { TRANSLATIONS, UI_MESSAGES } from '../constants';

interface NoteListProps {
  notes: Note[];
  categories: Category[];
  editingId: string | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onFocus: (note: Note) => void;
  onImageClick: (images: string[], index: number) => void;
  lang: Language;
  searchQuery: string;
  onSearch: (query: string) => void;
  searchDate: string;
  onSearchDate: (date: string) => void;
  selectedCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
  onCreateNote: () => void;
  onManageCategories: () => void;
  sortBy: SortOption;
  onSort: (sort: SortOption) => void;
  focusedNoteId: string | null;
  isMobile?: boolean;
}

const NoteList: React.FC<NoteListProps> = ({ 
  notes, categories, editingId, onEdit, onDelete, onFocus, onImageClick, lang, 
  searchQuery, onSearch, searchDate, onSearchDate, selectedCategoryId, onCategorySelect, onCreateNote,
  onManageCategories, sortBy, onSort, focusedNoteId, isMobile
}) => {
  const t = TRANSLATIONS[lang];
  const msg = UI_MESSAGES[lang];

  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showDatePopup, setShowDatePopup] = useState(false);

  const formatParts = (ts: number) => {
    const date = new Date(ts);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    const sep = lang === 'en' ? '-' : '/';
    return { date: `${y}${sep}${m}${sep}${d}`, time: `${hh}:${mm}:${ss}` };
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FDFDFD' }}>
      <div className="px-6 pt-4 pb-2 space-y-4 h-[127px] mt-0">
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <input 
              type="text"
              value={searchQuery}
              placeholder={lang === 'ko' ? "내용 검색..." : "Search content..."}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium h-[37px] text-[12px]"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pb-0 mb-0 mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* PC Date Search */}
          <div className="hidden xl:flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 group focus-within:ring-4 focus-within:ring-blue-50 transition-all h-[37px]">
            <input 
              type="date"
              value={searchDate}
              onChange={(e) => onSearchDate(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-slate-600 uppercase h-full cursor-pointer"
            />
            {searchDate && (
              <button onClick={() => onSearchDate('')} className="ml-2 text-slate-300 hover:text-red-500 h-[37px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Date Search Icon */}
          <button 
            onClick={() => setShowDatePopup(true)}
            className={`block xl:hidden p-3 rounded-2xl border transition-all h-[37px] w-[40px] mt-0 ${searchDate ? 'bg-blue-50 border-blue-200 text-blue-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
          >
            <svg className="w-5 h-5 -mt-[5px] mr-0 -ml-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* PC Category List */}
          <div className="hidden xl:flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
            <button
              onClick={() => onCategorySelect(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategoryId === null ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
            >
              {lang === 'ko' ? '전체' : 'All'}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategoryId === cat.id ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
              >
                {cat.name}
              </button>
            ))}
            <div className="relative group/manage shrink-0">
              <button
                onClick={onManageCategories}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                title={lang === 'ko' ? '카테고리 관리' : 'Manage Categories'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/manage:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {lang === 'ko' ? '카테고리 관리' : 'Manage Categories'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          </div>

          {/* Mobile Category Button */}
          <div className="flex xl:hidden items-center gap-2 flex-1 overflow-hidden">
            <button 
              onClick={() => setShowCategoryPopup(true)}
              className="w-[100px] flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 h-[37px]"
            >
              <span className="truncate">
                {selectedCategoryId 
                  ? categories.find(c => c.id === selectedCategoryId)?.name 
                  : (lang === 'ko' ? '전체' : 'All')}
              </span>
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={onManageCategories}
              className="p-2.5 rounded-xl text-slate-400 bg-slate-50 border border-slate-100 h-[37px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-100 shrink-0">
            <select 
              value={sortBy}
              onChange={(e) => onSort(e.target.value as SortOption)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase text-slate-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="date-desc">{t.date} ↓</option>
              <option value="date-asc">{t.date} ↑</option>
              <option value="category">{t.category}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Selection Popup (Mobile) */}
      {showCategoryPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.category}</h3>
              <button onClick={() => setShowCategoryPopup(false)} className="text-slate-300 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              <button 
                onClick={() => { onCategorySelect(null); setShowCategoryPopup(false); }}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all ${selectedCategoryId === null ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {lang === 'ko' ? '전체' : 'All'}
                {selectedCategoryId === null && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => { onCategorySelect(cat.id); setShowCategoryPopup(false); }}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all ${selectedCategoryId === cat.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {cat.name}
                  {selectedCategoryId === cat.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date Selection Popup (Mobile) */}
      {showDatePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.date}</h3>
              <button onClick={() => setShowDatePopup(false)} className="text-slate-300 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Date</label>
                <input 
                  type="date"
                  value={searchDate}
                  onChange={(e) => onSearchDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-600 uppercase"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { onSearchDate(''); setShowDatePopup(false); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowDatePopup(false)}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10 shadow-sm shadow-slate-50 hidden xl:table-header-group" style={{ backgroundColor: '#FDFDFD' }}>
            <tr className="border-b border-slate-50">
              <th className="w-20 xl:w-[122px] px-2 xl:px-6 py-4 text-[9px] xl:text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] xl:tracking-[0.2em]">{t.date}/{t.category}</th>
              <th className="px-2 xl:px-6 py-4 text-[9px] xl:text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] xl:tracking-[0.2em]">{t.note}</th>
              <th className="hidden xl:table-cell w-16 xl:w-32 px-2 xl:px-6 py-4 text-[9px] xl:text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] xl:tracking-[0.2em] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {notes.map((note, index) => {
              const cat = categories.find(c => c.id === note.categoryId);
              const isBeingEdited = editingId === note.id;
              const isFocused = focusedNoteId === note.id;
              const isModified = note.lastModifiedAt > note.date;
              const dt = formatParts(note.date);
              const md = formatParts(note.lastModifiedAt);

              return (
                <tr 
                  key={note.id}
                  className={`transition-all duration-200 group flex flex-col xl:table-row border-b border-slate-100 xl:border-none ${
                    isFocused 
                      ? 'bg-gray-100' 
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-4 py-4 xl:px-6 xl:py-8 align-top text-[9px] xl:text-[11px] font-bold text-slate-400 tabular-nums leading-relaxed block w-full xl:table-cell xl:w-[122px]">
                    <div className="flex items-start justify-between xl:flex-col xl:gap-1.5">
                      <div className="flex flex-col gap-2 xl:gap-1.5">
                        <div className="flex items-center gap-2 xl:flex-col xl:items-start xl:gap-0">
                          <div className="flex gap-1 xl:flex-col xl:gap-0">
                            <span>{dt.date}</span>
                            <span>{dt.time}</span>
                          </div>
                          
                          {/* Category Badge - Always visible under date/time */}
                          <div className="mt-1">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-lg font-black uppercase tracking-wider ${isBeingEdited ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {note.categoryName || cat?.name || '...'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Actions - Horizontal Row */}
                      <div className="xl:hidden flex items-center gap-1.5">
                        {!isMobile && (
                          <button 
                            onClick={() => onFocus(note)}
                            className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        <button 
                          onClick={() => onEdit(note)}
                          className={`p-1.5 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm ${isBeingEdited ? 'text-blue-500' : 'text-slate-300 hover:text-blue-500'}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onDelete(note.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {isModified && (
                        <div className="text-[8px] xl:text-[9px] text-blue-400/70 font-medium border-t border-blue-50 pt-1 mt-1">
                          <span className="opacity-60 block xl:inline xl:mr-1">{msg.lastModified}:</span>
                          <span className="block">{md.date}</span>
                          <span className="block">{md.time}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 xl:px-6 xl:py-8 align-top block w-full xl:table-cell">
                    <div 
                      className="text-xs xl:text-sm text-slate-600 font-medium leading-relaxed ql-preview mb-2 xl:mb-4"
                      dangerouslySetInnerHTML={{ __html: note.textContent || `<span class="text-slate-300 italic">No content</span>` }}
                    />
                    {note.photoUrls && note.photoUrls.length > 0 && (
                      <div className="flex flex-wrap gap-1 xl:gap-2 mt-1 xl:mt-2">
                        {note.photoUrls.map((url, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => onImageClick(note.photoUrls, idx)}
                            className="w-12 h-12 xl:w-20 xl:h-20 rounded-lg xl:rounded-xl overflow-hidden shadow-sm border border-slate-100 cursor-zoom-in hover:opacity-80 transition-opacity flex-shrink-0"
                          >
                            <img src={url} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="hidden xl:table-cell px-2 xl:px-6 py-4 xl:py-8 align-top">
                    <div className="flex flex-col items-center justify-center gap-1 xl:gap-1.5">
                      <button 
                        onClick={() => onFocus(note)}
                        className="p-1.5 xl:p-2 text-slate-300 hover:text-indigo-500 transition-colors bg-white rounded-lg xl:rounded-xl border border-slate-100 shadow-sm"
                        title="Focus"
                      >
                        <svg className="w-3.5 h-3.5 xl:w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onEdit(note)}
                        className={`p-1.5 xl:p-2 transition-colors bg-white rounded-lg xl:rounded-xl border border-slate-100 shadow-sm ${isBeingEdited ? 'text-blue-500' : 'text-slate-300 hover:text-blue-500'}`}
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5 xl:w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDelete(note.id)}
                        className="p-1.5 xl:p-2 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-lg xl:rounded-xl border border-slate-100 shadow-sm"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5 xl:w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {notes.length === 0 && (
          <div className="p-32 text-center text-slate-200">
            <p className="text-sm font-bold tracking-tight">{lang === 'ko' ? '기록을 찾을 수 없습니다' : 'No records found'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteList;
