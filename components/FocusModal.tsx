
import React, { useEffect, useState } from 'react';
import { Note, Category, Language } from '../types';

interface FocusModalProps {
  note: Note;
  categories: Category[];
  lang: Language;
  onClose: () => void;
}

const FocusModal: React.FC<FocusModalProps> = ({ note, categories, lang, onClose }) => {
  const cat = categories.find(c => c.id === note.categoryId);
  const [fontSize, setFontSize] = useState(20); // Default 20px (text-xl equivalent)
  const [bgColor, setBgColor] = useState('#FDFDFD');
  
  const formatDate = (ts: number) => {
    const date = new Date(ts);
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${date.toLocaleString()}:${ss}`;
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isDark = bgColor === '#121212';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-[80vw] h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto transition-colors duration-300"
        style={{ backgroundColor: bgColor }}
      >
        <div className={`px-10 py-6 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/10' : 'border-slate-50'}`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-blue-500 text-white rounded-xl">
                {cat?.name || '...'}
              </span>
              <span className={`text-xs font-bold tabular-nums ${isDark ? 'text-slate-500' : 'text-slate-300'}`}>
                {formatDate(note.date)}
              </span>
            </div>

            <div className={`flex items-center rounded-xl p-1 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
              <button 
                onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                className={`p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all ${isDark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-500'}`}
                title="Decrease font size"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <span className={`px-3 text-[10px] font-black tabular-nums w-10 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {fontSize}
              </span>
              <button 
                onClick={() => setFontSize(prev => Math.min(prev + 2, 64))}
                className={`p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all ${isDark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-500'}`}
                title="Increase font size"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div className={`flex items-center gap-2 rounded-xl p-1 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
              {[
                { color: '#FDFDFD', label: 'Default' },
                { color: '#121212', label: 'Dark' },
                { color: '#F5EEDA', label: 'Yellow' }
              ].map((opt) => (
                <button
                  key={opt.color}
                  onClick={() => setBgColor(opt.color)}
                  className={`w-6 h-6 rounded-lg border-2 transition-all ${bgColor === opt.color ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: opt.color }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-3 rounded-2xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-12">
          <div className="max-w-4xl mx-auto w-full">
            {note.photoUrls && note.photoUrls.length > 0 && (
              <div className="flex flex-col gap-8 mb-12">
                {note.photoUrls.map((url, idx) => (
                  <div key={idx} className={`rounded-3xl overflow-hidden shadow-lg border ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            )}
            <div 
              className={`ql-editor leading-relaxed transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-700'}`}
              style={{ fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: note.textContent || `<p class="text-slate-200 italic">No content</p>` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusModal;
