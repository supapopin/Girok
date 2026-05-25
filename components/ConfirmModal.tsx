
import React from 'react';
import { Language } from '../types';
import { UI_MESSAGES } from '../constants';

interface ConfirmModalProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  lang: Language;
  cancelLabel?: string;
  variant?: 'delete' | 'edit' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  title, description, onConfirm, onCancel, lang, cancelLabel, variant = 'info' 
}) => {
  const msg = UI_MESSAGES[lang];

  const getIcon = () => {
    switch (variant) {
      case 'delete':
        return (
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      case 'edit':
        return (
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getConfirmStyle = () => {
    if (variant === 'delete') {
      return "bg-red-500 text-white shadow-red-100 hover:bg-red-600";
    }
    return "bg-blue-500 text-white shadow-blue-100 hover:bg-blue-600";
  };

  const confirmText = variant === 'delete' ? msg.deleteAction : msg.yes;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onCancel} />
      
      <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200 pointer-events-auto">
        {getIcon()}
        
        <div className="text-lg font-bold text-slate-800 mb-2 leading-snug whitespace-pre-wrap text-center">
          {title}
        </div>

        {description && (
          <div className="text-[80%] text-slate-400 font-medium leading-relaxed mt-2 text-center whitespace-pre-wrap">
            {description}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button 
            onClick={onCancel}
            className="px-4 py-3 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all active:scale-95 whitespace-pre-wrap text-center flex items-center justify-center"
          >
            {cancelLabel || msg.no}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-3 rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95 whitespace-pre-wrap text-center flex items-center justify-center ${getConfirmStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
