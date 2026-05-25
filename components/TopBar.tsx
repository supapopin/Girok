
import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Clock from './Clock';

interface TopBarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  lang, setLang, user, onLogout
}) => {
  const t = TRANSLATIONS[lang];

  const [showLangPopup, setShowLangPopup] = useState(false);

  return (
    <header className="flex flex-col sticky top-0 z-20">
      <div className="h-5 bg-blue-500 w-full" />
      <div className="h-[65px] bg-white border-b border-slate-200 px-6 flex items-center justify-between mt-[5px] mb-[5px]">
        <div className="flex-1 flex justify-start items-center">
          <div className="w-fit text-center">
            <Clock lang={lang} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{user.displayName || 'Member'}</p>
                  <button onClick={onLogout} className="text-[9px] font-bold text-blue-500 hover:underline tracking-tighter uppercase">{t.logout}</button>
               </div>
               {user.photoURL ? (
                 <img src={user.photoURL} alt="profile" className="w-8 h-8 rounded-full border border-slate-100 shadow-sm" referrerPolicy="no-referrer" />
               ) : (
                 <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xs font-bold ring-1 ring-slate-200">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                 </div>
               )}
               <button onClick={onLogout} className="sm:hidden p-2 text-slate-300 hover:text-red-400 transition-colors" title={t.logout}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
               </button>
            </div>
          )}

          {/* PC Design: Keep as is */}
          <button 
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors px-2 py-1 rounded-md"
          >
            {lang === 'ko' ? 'English' : '한국어'}
          </button>

          {/* Mobile/Tablet Design: Globe Icon */}
          <button 
            onClick={() => setShowLangPopup(true)}
            className="block lg:hidden p-2 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Language Selection Popup (Mobile) */}
      {showLangPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Select Language</h3>
              <button onClick={() => setShowLangPopup(false)} className="text-slate-300 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-2">
              <button 
                onClick={() => { setLang('ko'); setShowLangPopup(false); }}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all ${lang === 'ko' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                한국어
                {lang === 'ko' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
              <button 
                onClick={() => { setLang('en'); setShowLangPopup(false); }}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all ${lang === 'en' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                English
                {lang === 'en' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
