
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image } from 'lucide-react';
import { Note, Category, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface NoteEditorProps {
  note: Note;
  categories: Category[];
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
  onDirty: (dirty: boolean) => void;
  onChange?: (note: Note) => void;
  onManageCategories: () => void;
  lang: Language;
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
  onHide?: () => void;
  isMobile?: boolean;
}

const BASIC_COLORS = [
  '#000000', '#64748b', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#14b8a6', '#3b82f6', 
  '#6366f1', '#a855f7', '#ec4899', '#78350f'
];

const BG_COLORS = [
  '#f5c2c7', '#f9e2c6', '#fff3cd', '#d1e7dd', 
  '#cff4fc', '#cfe2ff', '#e2e3e5', '#f5d1e3'
];

const BG_TEXT_COLORS: Record<string, string> = {
  '#f5c2c7': '#842029',
  '#f9e2c6': '#664d03',
  '#fff3cd': '#664d03',
  '#d1e7dd': '#0f5132',
  '#cff4fc': '#055160',
  '#cfe2ff': '#084298',
  '#e2e3e5': '#41464b',
  '#f5d1e3': '#521838',
};

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, categories, onSave, onDelete, onReset, onDirty, onChange, onManageCategories, lang,
  isFocusMode, onToggleFocus, onHide, isMobile
}) => {
  const t = TRANSLATIONS[lang];
  const [localNote, setLocalNote] = useState<Note>(note);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);
  const fontSizePickerRef = useRef<HTMLDivElement>(null);

  const isEditingExisting = !note.id.startsWith('new-');
  const strippedText = localNote.textContent.replace(/<[^>]*>/g, '').trim();
  const isEmpty = strippedText === '' && (localNote.photoUrls || []).length === 0;

  const FONT_SIZES = [
    { label: lang === 'ko' ? '작게' : 'Small', value: '2' },
    { label: lang === 'ko' ? '보통' : 'Normal', value: '3' },
    { label: lang === 'ko' ? '크게' : 'Large', value: '5' },
    { label: lang === 'ko' ? '매우 크게' : 'Huge', value: '7' },
  ];

  useEffect(() => {
    setLocalNote(note);
    if (editorRef.current) {
      editorRef.current.innerHTML = note.textContent;
    }
  }, [note.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (bgPickerRef.current && !bgPickerRef.current.contains(event.target as Node)) {
        setShowBgColorPicker(false);
      }
      if (fontSizePickerRef.current && !fontSizePickerRef.current.contains(event.target as Node)) {
        setShowFontSizePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTextChange = useCallback(() => {
    const newText = editorRef.current?.innerHTML || '';
    if (newText !== localNote.textContent) {
      const updated = { ...localNote, textContent: newText };
      setLocalNote(updated);
      onDirty(true);
      if (onChange) onChange(updated);
    }
  }, [localNote, onDirty, onChange]);

  const handleOutdent = useCallback(() => {
    document.execCommand('styleWithCSS', false, false as any);
    document.execCommand('outdent');
    handleTextChange();
  }, [handleTextChange]);

  const handleIndent = useCallback(() => {
    document.execCommand('styleWithCSS', false, false as any);
    document.execCommand('indent');
    handleTextChange();
  }, [handleTextChange]);

  const handleQuote = useCallback(() => {
    document.execCommand('styleWithCSS', false, false as any);
    document.execCommand('formatBlock', false, 'blockquote');
    
    // Add is-quote class to the blockquote(s) in selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // Check if selection is inside a blockquote
      let parent = container.nodeType === Node.ELEMENT_NODE ? (container as HTMLElement) : container.parentElement;
      while (parent && parent !== editorRef.current) {
        if (parent.nodeName === 'BLOCKQUOTE') {
          parent.classList.add('is-quote');
          break;
        }
        parent = parent.parentElement;
      }
      
      // Check for blockquotes within selection
      if (container.nodeType === Node.ELEMENT_NODE) {
        const bqs = (container as HTMLElement).querySelectorAll('blockquote');
        bqs.forEach(bq => {
          if (selection.containsNode(bq, true)) {
            bq.classList.add('is-quote');
          }
        });
      }
    }
    handleTextChange();
  }, [handleTextChange]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Save (Ctrl + S)
      if (e.key === 's' || e.code === 'KeyS') {
        e.preventDefault();
        onSave({ ...localNote, lastModifiedAt: Date.now() });
        return;
      }

      // Font Size Up (Ctrl + + or Ctrl + =)
      if (e.key === '+' || e.key === '=' || e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        const size = document.queryCommandValue('fontSize');
        const nextSize = Math.min(7, parseInt(size || '3') + 1);
        document.execCommand('fontSize', false, nextSize.toString());
        return;
      }
      // Font Size Down (Ctrl + -)
      if (e.key === '-' || e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        const size = document.queryCommandValue('fontSize');
        const nextSize = Math.max(1, parseInt(size || '3') - 1);
        document.execCommand('fontSize', false, nextSize.toString());
        return;
      }
      // Indent Less (Ctrl + [)
      if (e.key === '[' || e.code === 'BracketLeft') {
        e.preventDefault();
        handleOutdent();
        return;
      }
      // Indent More (Ctrl + ])
      if (e.key === ']' || e.code === 'BracketRight') {
        e.preventDefault();
        handleIndent();
        return;
      }

      if (e.shiftKey) {
        // Bullet List (Ctrl + Shift + 8)
        if (e.key === '8' || e.key === '*' || e.code === 'Digit8') {
          e.preventDefault();
          document.execCommand('insertUnorderedList');
          return;
        }
        // Numbered List (Ctrl + Shift + 7)
        if (e.key === '7' || e.key === '&' || e.code === 'Digit7') {
          e.preventDefault();
          document.execCommand('insertOrderedList');
          return;
        }
        // Quote (Ctrl + Shift + 9)
        if (e.key === '9' || e.key === '(' || e.code === 'Digit9') {
          e.preventDefault();
          handleQuote();
          return;
        }
      }
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      // Default to non-CSS mode for standard tag usage (like blockquote for indent)
      document.execCommand('styleWithCSS', false, false as any);
      editor.addEventListener('keydown', handleKeyDown);
      return () => editor.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const applyColor = (color: string) => {
    document.execCommand('foreColor', false, color);
    if (!BASIC_COLORS.includes(color)) {
      setRecentColors(prev => [color, ...prev.filter(c => c !== color)].slice(0, 4));
    }
    setShowColorPicker(false);
    handleTextChange();
    editorRef.current?.focus();
  };

  const applyBgColor = (color: string) => {
    document.execCommand('hiliteColor', false, color);
    // Apply darker text color for contrast if it's one of the preset backgrounds
    const textColor = BG_TEXT_COLORS[color];
    if (textColor) {
      document.execCommand('foreColor', false, textColor);
    }
    setShowBgColorPicker(false);
    handleTextChange();
    editorRef.current?.focus();
  };

  const applyFontSize = (size: string) => {
    document.execCommand('fontSize', false, size);
    setShowFontSizePicker(false);
    handleTextChange();
    editorRef.current?.focus();
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    const newUrls: string[] = [];
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    for (const file of validFiles) {
      try {
        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newUrls.push(url);
      } catch (err) {
        console.error(err);
      }
    }
    if (newUrls.length > 0) {
      const updated = { ...localNote, photoUrls: [...(localNote.photoUrls || []), ...newUrls] };
      setLocalNote(updated);
      onDirty(true);
      if (onChange) onChange(updated);
    }
    setIsProcessing(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (clipboardData.files && clipboardData.files.length > 0) {
      const imageFiles = Array.from<File>(clipboardData.files).filter((f: File) => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        e.preventDefault();
        processFiles(imageFiles);
        return;
      }
    }
    const text = clipboardData.getData('text/plain');
    if (text) {
      e.preventDefault();
      document.execCommand('insertText', false, text);
      handleTextChange();
    }
  };

  const removePhoto = (idx: number) => {
    const updated = { ...localNote, photoUrls: localNote.photoUrls.filter((_, i) => i !== idx) };
    setLocalNote(updated);
    onDirty(true);
    if (onChange) onChange(updated);
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-sm font-black text-slate-800 animate-pulse">이미지 처리 중...</p>
        </div>
      )}

      <div className="px-6 pt-4 pb-[15px] bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Mobile/Tablet Hide Button removed as requested */}
          <button 
            onClick={onHide}
            className="hidden p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-500 rounded-xl transition-all shadow-sm"
            title={lang === 'ko' ? '닫기' : 'Close'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col">
            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{t.category}</label>
            <div className="flex items-center gap-2">
              <select 
                value={localNote.categoryId}
                onChange={(e) => {
                  const updated = { ...localNote, categoryId: e.target.value };
                  setLocalNote(updated);
                  onDirty(true);
                  if (onChange) onChange(updated);
                }}
                className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none appearance-none cursor-pointer hover:border-slate-400 transition-colors shadow-sm"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={onManageCategories} className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-blue-500 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Media</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border border-slate-200 hover:border-blue-400 text-slate-500 rounded-xl px-2.5 lg:px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              title={t.uploadPhoto}
            >
              <Image className="w-4 h-4" />
              <span className="hidden lg:inline">{t.uploadPhoto}</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={(e) => e.target.files && processFiles(e.target.files)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={isEmpty || !localNote.categoryId || isProcessing}
            onClick={() => onSave({ ...localNote, lastModifiedAt: Date.now() })}
            className={`px-8 py-2.5 rounded-2xl text-sm font-black shadow-xl transition-all active:scale-95 ${(isEmpty || !localNote.categoryId || isProcessing) ? 'bg-slate-200 text-slate-400' : 'bg-blue-500 text-white shadow-blue-100 hover:bg-blue-600'}`}
            title={isEditingExisting ? `${t.update} (Ctrl+S)` : `${t.save} (Ctrl+S)`}
          >
            {isEditingExisting ? t.update : t.save}
          </button>
        </div>
      </div>

      <div className="px-6 pt-[10px] pb-2 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-1 items-center shrink-0">
        <button onClick={() => document.execCommand('bold')} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 font-bold" title="Bold (Ctrl+B)">B</button>
        <button onClick={() => document.execCommand('italic')} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 italic" title="Italic (Ctrl+I)">I</button>
        <button onClick={() => document.execCommand('underline')} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 underline" title="Underline (Ctrl+U)">U</button>
        
        <div className="w-px h-5 bg-slate-200 mx-2" />

        <div className="relative" ref={fontSizePickerRef}>
          <button 
            onClick={() => setShowFontSizePicker(!showFontSizePicker)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold text-slate-500"
            title="Font Size (Ctrl + Plus / Ctrl + Minus)"
          >
            {lang === 'ko' ? '글자 크기' : 'Size'}
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showFontSizePicker && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 w-32 animate-in fade-in zoom-in-95 duration-200">
              {FONT_SIZES.map(size => (
                <button 
                  key={size.value} 
                  onClick={() => applyFontSize(size.value)} 
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 mx-2" />
        
        <button onClick={() => document.execCommand('insertUnorderedList')} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500" title="Bulleted list (Ctrl+Shift+8)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="6" r="1.5" fill="currentColor" />
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="5" cy="18" r="1.5" fill="currentColor" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6h10M10 12h10M10 18h10" />
          </svg>
        </button>
        <button onClick={() => document.execCommand('insertOrderedList')} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500" title="Numbered list (Ctrl+Shift+7)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6h10M10 12h10M10 18h10" />
            <text x="3" y="8" fontSize="6" fontWeight="900" fill="currentColor" fontFamily="sans-serif">1</text>
            <text x="3" y="14" fontSize="6" fontWeight="900" fill="currentColor" fontFamily="sans-serif">2</text>
            <text x="3" y="20" fontSize="6" fontWeight="900" fill="currentColor" fontFamily="sans-serif">3</text>
          </svg>
        </button>
        <button onClick={handleOutdent} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500" title="Indent Less (Ctrl+[)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
        </button>
        <button onClick={handleIndent} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500" title="Indent More (Ctrl+])">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
        <button onClick={handleQuote} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500" title="Quote (Ctrl+Shift+9)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-2" />
        
        <div className="relative" ref={pickerRef}>
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-200 transition-colors"
            title="Text Color"
          >
            <div className="w-4 h-4 rounded-sm shadow-sm border border-slate-300" style={{ backgroundColor: 'currentColor' }} />
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 w-44 animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-4 gap-2">
                {BASIC_COLORS.map(color => (
                  <button 
                    key={color} 
                    onClick={() => applyColor(color)} 
                    className="w-full aspect-square rounded-lg border border-slate-100 hover:scale-110 transition-transform active:scale-95" 
                    style={{ backgroundColor: color }} 
                  />
                ))}
              </div>
              {recentColors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <div className="flex gap-2">
                    {recentColors.map((color, i) => (
                      <button key={i} onClick={() => applyColor(color)} className="w-6 h-6 rounded-full border border-slate-100" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={bgPickerRef}>
          <button 
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-200 transition-colors"
            title="Highlight Color"
          >
            <div className="w-4 h-4 rounded-sm shadow-sm border border-slate-300 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fff' }}>
              <div className="w-full h-1 mt-auto bg-yellow-400" />
            </div>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showBgColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 w-44 animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => applyBgColor('transparent')} 
                  className="w-full aspect-square rounded-lg border border-slate-200 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 text-[10px] font-bold text-slate-400"
                >
                  X
                </button>
                {BG_COLORS.map(color => (
                  <button 
                    key={color} 
                    onClick={() => applyBgColor(color)} 
                    className="w-full aspect-square rounded-lg border border-slate-100 hover:scale-110 transition-transform active:scale-95" 
                    style={{ backgroundColor: color }} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto no-scrollbar bg-white">
        <div className="max-w-4xl mx-auto">
          {localNote.photoUrls && localNote.photoUrls.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-10">
              {localNote.photoUrls.map((url, i) => (
                <div key={i} className="relative group w-32 h-32 rounded-3xl overflow-hidden shadow-lg border border-slate-100 shrink-0">
                  <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ))}
            </div>
          )}
          <div 
            ref={editorRef}
            contentEditable
            onInput={handleTextChange}
            onPaste={handlePaste}
            className="ql-editor outline-none flex-1 focus:prose-blue min-h-[400px]"
            data-placeholder={t.placeholder}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
