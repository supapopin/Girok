
import React, { useEffect } from 'react';

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, index, onClose, onIndexChange }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, images]);

  const showPrev = () => {
    onIndexChange((index - 1 + images.length) % images.length);
  };

  const showNext = () => {
    onIndexChange((index + 1) % images.length);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 cursor-zoom-out" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[80vw] max-h-[80vh] flex items-center justify-center pointer-events-none">
        <img 
          src={images[index]} 
          alt={`Lightbox ${index + 1}`} 
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-300" 
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-all pointer-events-auto group"
            >
              <svg className="w-10 h-10 group-active:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); showNext(); }}
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-all pointer-events-auto group"
            >
              <svg className="w-10 h-10 group-active:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 text-white hover:bg-white/10 rounded-full transition-all"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white/80 text-xs font-black tracking-widest tabular-nums uppercase">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default Lightbox;
