
import React, { useState } from 'react';
import { Category, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface CategoryManagerProps {
  categories: Category[];
  userId: string; // userId 추가
  onUpdate: (cats: Category[]) => void;
  onDeleteRequest: (id: string) => void;
  onClose: () => void;
  lang: Language;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, userId, onUpdate, onDeleteRequest, onClose, lang }) => {
  const t = TRANSLATIONS[lang];
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddAction = () => {
    if (!newCatName.trim()) return;
    
    const name = newCatName.trim();
    const newCat: Category = {
      id: crypto.randomUUID(),
      userId: userId, // 핵심: 'user' 대신 전달받은 userId 사용
      name: name
    };
    
    onUpdate([...categories, newCat]);
    setNewCatName('');
    setIsAdding(false);
    
    setSuccessMsg(name);
    setTimeout(() => setSuccessMsg(null), 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative min-h-[500px] flex flex-col">
        
        {successMsg && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-white/95 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-[320px] flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-black text-slate-800 text-center leading-tight">
                <span className="text-blue-500 block mb-1">[{successMsg}]</span>
                {lang === 'ko' ? '추가되었습니다!' : 'added!'}
              </p>
            </div>
          </div>
        )}

        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{t.manageCategories}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-2xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 flex-1 overflow-hidden flex flex-col">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 mb-6 bg-blue-50 text-blue-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-all active:scale-95 border-2 border-dashed border-blue-200 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {lang === 'ko' ? '새 카테고리 추가' : 'Add New Category'}
          </button>

          <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pr-1">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-600 ml-1">{cat.name}</span>
                </div>
                <button 
                  onClick={() => onDeleteRequest(cat.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 hover:bg-white rounded-xl shadow-sm"
                  title="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50/50 flex justify-center shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            {lang === 'ko' ? '완료' : 'Done'}
          </button>
        </div>

        {isAdding && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-[320px] animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-black text-slate-800 mb-6 text-center">
                {lang === 'ko' ? '카테고리 이름' : 'Category Name'}
              </h3>
              <input 
                autoFocus
                type="text" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={lang === 'ko' ? "예: 여행, 공부" : "e.g. Travel, Study"}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 focus:bg-white text-sm font-bold transition-all mb-6 text-center"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAction()}
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => { setIsAdding(false); setNewCatName(''); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleAddAction}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-xs font-black hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  {lang === 'ko' ? '추가하기' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
