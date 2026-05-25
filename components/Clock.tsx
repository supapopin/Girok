
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import Weather from './Weather';

interface ClockProps {
  lang: Language;
}

const Clock: React.FC<ClockProps> = ({ lang }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });

  const timeStr = time.toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-[27px] font-bold text-slate-800 tabular-nums leading-none mb-1">
          {timeStr}
        </span>
        <span className="text-sm uppercase tracking-wider text-slate-400 font-medium">
          {dateStr}
        </span>
      </div>
      <Weather />
    </div>
  );
};

export default Clock;
