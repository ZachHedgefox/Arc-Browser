import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Win11Taskbar from './Win11Taskbar';
import BrowserApp from './BrowserApp';
import MinesweeperApp from './MinesweeperApp';
import SolitaireApp from './SolitaireApp';

const WALLPAPER = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80';

const APPS = [
  { id: 'browser', label: 'Arc Browser', icon: '🌐' },
  { id: 'minesweeper', label: 'Minesweeper', icon: '💣' },
  { id: 'solitaire', label: 'Solitaire', icon: '🃏' },
];

const DEFAULT_SIZE = { browser: { w: 900, h: 580 }, minesweeper: { w: 420, h: 480 }, solitaire: { w: 700, h: 540 } };

function DraggableWindow({ id, app, isActive, isMin, onFocus, onClose, onMinimize, children }) {
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - (DEFAULT_SIZE[id]?.w || 700) / 2, y: 40 });
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const size = DEFAULT_SIZE[id] || { w: 700, h: 500 };

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    dragging.current = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...pos };
    onFocus();
    e.preventDefault();
  }, [pos, onFocus]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - size.w, startPos.current.x + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, startPos.current.y + dy)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [size]);

  if (isMin) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex: isActive ? 100 : 50,
      }}
      onMouseDown={onFocus}
    >
      <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
        style={{ backdropFilter: 'blur(20px)' }}>
        {/* Title Bar - draggable */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 select-none"
          style={{ background: isActive ? 'rgba(30,30,30,0.95)' : 'rgba(20,20,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'grab' }}
          onMouseDown={onMouseDown}
        >
          <span className="text-lg">{app.icon}</span>
          <span className="text-white text-sm font-medium flex-1">{app.label}</span>
          <div className="flex items-center gap-2" onMouseDown={e => e.stopPropagation()}>
            <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors" />
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-300 transition-colors" />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function Win11Desktop() {
  const [openApps, setOpenApps] = useState([]);
  const [activeApp, setActiveApp] = useState(null);
  const [minimized, setMinimized] = useState([]);
  const [startOpen, setStartOpen] = useState(false);

  const openApp = (id) => {
    setStartOpen(false);
    if (!openApps.includes(id)) setOpenApps(prev => [...prev, id]);
    setMinimized(prev => prev.filter(m => m !== id));
    setActiveApp(id);
  };

  const closeApp = (id) => {
    setOpenApps(prev => prev.filter(a => a !== id));
    setMinimized(prev => prev.filter(m => m !== id));
    setActiveApp(prev => (prev === id ? null : prev));
  };

  const minimizeApp = (id) => {
    setMinimized(prev => prev.includes(id) ? prev : [...prev, id]);
    setActiveApp(prev => prev === id ? null : prev);
  };

  const toggleApp = (id) => {
    if (!openApps.includes(id)) { openApp(id); return; }
    if (minimized.includes(id)) {
      setMinimized(prev => prev.filter(m => m !== id));
      setActiveApp(id);
    } else if (activeApp === id) {
      minimizeApp(id);
    } else {
      setActiveApp(id);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: `url(${WALLPAPER}) center/cover` }}
      onClick={() => setStartOpen(false)}
    >
      {/* Desktop Area */}
      <div className="flex-1 relative">
        {/* Desktop Icons */}
        <div className="absolute top-8 left-8 flex flex-col gap-6">
          {APPS.map(app => (
            <button
              key={app.id}
              onDoubleClick={() => openApp(app.id)}
              className="flex flex-col items-center gap-1 group w-20"
            >
              <div className="text-4xl drop-shadow-lg">{app.icon}</div>
              <span className="text-white text-xs font-medium text-center drop-shadow px-1 py-0.5 rounded group-hover:bg-white/20 transition-colors">
                {app.label}
              </span>
            </button>
          ))}
        </div>

        {/* App Windows */}
        <AnimatePresence>
          {openApps.map(id => {
            const app = APPS.find(a => a.id === id);
            return (
              <DraggableWindow
                key={id}
                id={id}
                app={app}
                isActive={activeApp === id}
                isMin={minimized.includes(id)}
                onFocus={() => setActiveApp(id)}
                onClose={() => closeApp(id)}
                onMinimize={() => minimizeApp(id)}
              >
                {id === 'browser' && <BrowserApp />}
                {id === 'minesweeper' && <MinesweeperApp />}
                {id === 'solitaire' && <SolitaireApp />}
              </DraggableWindow>
            );
          })}
        </AnimatePresence>

        {/* Start Menu */}
        <AnimatePresence>
          {startOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-14 left-1/2 -translate-x-1/2 w-96 rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              style={{ background: 'rgba(25,25,25,0.92)', backdropFilter: 'blur(30px)', zIndex: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <p className="text-white font-semibold text-lg mb-4">Apps</p>
                <div className="grid grid-cols-3 gap-4">
                  {APPS.map(app => (
                    <button key={app.id} onClick={() => openApp(app.id)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-colors">
                      <span className="text-3xl">{app.icon}</span>
                      <span className="text-white text-xs text-center">{app.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Taskbar */}
      <Win11Taskbar
        apps={APPS}
        openApps={openApps}
        activeApp={activeApp}
        minimized={minimized}
        onAppClick={toggleApp}
        onStartClick={(e) => { e.stopPropagation(); setStartOpen(s => !s); }}
      />
    </div>
  );
}
