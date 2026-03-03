import React, { useState, useEffect } from 'react';

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-white text-right text-xs leading-tight select-none cursor-default">
      <div className="font-medium">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <div className="opacity-70">{time.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
    </div>
  );
}

export default function Win11Taskbar({ apps, openApps, activeApp, minimized, onAppClick, onStartClick }) {
  return (
    <div
      className="h-12 flex items-center px-4 justify-between flex-shrink-0"
      style={{ background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Left: Start + Exit */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStartClick}
          className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-sky-400/20 transition-all text-2xl"
          style={{ color: '#60c8ff', textShadow: '0 0 12px #38bdf8' }}
          title="Start"
        >
          ⊞
        </button>
      </div>

      {/* Center: App icons */}
      <div className="flex items-center gap-1">
        {apps.map(app => {
          const isOpen = openApps.includes(app.id);
          const isActive = activeApp === app.id;
          const isMin = minimized.includes(app.id);
          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              title={app.label}
              className={`relative w-10 h-9 rounded-lg flex items-center justify-center text-xl transition-all
                ${isActive ? 'bg-white/15' : 'hover:bg-white/10'}
              `}
            >
              {app.icon}
              {isOpen && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all
                    ${isActive ? 'w-4 bg-blue-400' : 'w-2 bg-white/50'}
                    ${isMin ? 'w-1 bg-white/30' : ''}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right: Clock */}
      <div className="flex items-center gap-3">
        <Clock />
      </div>
    </div>
  );
}
