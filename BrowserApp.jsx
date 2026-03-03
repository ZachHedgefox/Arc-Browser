import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, X } from 'lucide-react';

export default function BrowserApp() {
  const [input, setInput] = useState('');
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [histIndex, setHistIndex] = useState(-1);

  const navigate = (target) => {
    let formatted = target.trim();
    if (!formatted) return;
    if (!formatted.includes('.') && !formatted.startsWith('http')) {
      formatted = 'https://www.google.com/search?q=' + encodeURIComponent(formatted);
    } else if (!formatted.startsWith('http')) {
      formatted = 'https://' + formatted;
    }
    const newHist = [...history.slice(0, histIndex + 1), formatted];
    setHistory(newHist);
    setHistIndex(newHist.length - 1);
    setUrl(formatted);
    setInput(formatted);
  };

  const goBack = () => {
    if (histIndex > 0) {
      const newIdx = histIndex - 1;
      setHistIndex(newIdx);
      setUrl(history[newIdx]);
      setInput(history[newIdx]);
    }
  };

  const goForward = () => {
    if (histIndex < history.length - 1) {
      const newIdx = histIndex + 1;
      setHistIndex(newIdx);
      setUrl(history[newIdx]);
      setInput(history[newIdx]);
    }
  };

  const reload = () => {
    if (url) { setUrl(''); setTimeout(() => setUrl(url), 50); }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#252525] border-b border-white/10 flex-shrink-0">
        <button onClick={goBack} disabled={histIndex <= 0}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={goForward} disabled={histIndex >= history.length - 1}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={reload}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <RotateCw className="w-4 h-4" />
        </button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-[#333] rounded-lg px-3 py-1.5 border border-white/10">
          <Globe className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
            placeholder="Search or enter URL..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(input)}
          />
          {input && (
            <button onClick={() => setInput('')}>
              <X className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">
        {url ? (
          <iframe
            key={url}
            src={url}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Browser"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-6xl mb-6">🌐</div>
            <p className="text-white/60 text-lg mb-2">Arc Browser</p>
            <p className="text-white/30 text-sm">Enter a URL or search above</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-md">
              {['google.com', 'wikipedia.org', 'youtube.com', 'github.com'].map(site => (
                <button key={site} onClick={() => navigate(site)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-all">
                  {site}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
