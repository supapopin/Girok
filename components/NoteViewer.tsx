
import React from 'react';
import { Note, Category, Language } from '../types';

interface NoteViewerProps {
  note: Note;
  categories: Category[];
  lang: Language;
}

const NoteViewer: React.FC<NoteViewerProps> = ({ note, categories }) => {
  const cat = categories.find(c => c.id === note.categoryId);
  
  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar p-10 border-b border-slate-200 shadow-inner">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-500 text-white rounded-full">
            {cat?.name || 'Category'}
          </span>
          <span className="text-xs text-slate-400 font-medium tabular-nums">
            {formatDate(note.date)}
          </span>
        </div>

        {/* Fix: Property 'photoUrl' does not exist on type 'Note'. Using 'photoUrls' array instead. */}
        {note.photoUrls && note.photoUrls.length > 0 && (
          <div className="mb-10 flex flex-col gap-6">
            {note.photoUrls.map((url, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                <img src={url} alt={`Attached ${idx + 1}`} className="w-full h-auto" />
              </div>
            ))}
          </div>
        )}

        <div 
          className="ql-editor text-slate-700 text-lg leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: note.textContent || `<p class="text-slate-300 italic">No content available</p>` }}
        />
      </div>
    </div>
  );
};

export default NoteViewer;
