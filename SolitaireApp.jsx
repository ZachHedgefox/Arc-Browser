import React, { useState, useCallback } from 'react';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED = ['♥', '♦'];

function makeDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r, faceUp: false });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function rankVal(r) { return RANKS.indexOf(r); }
function isRed(s) { return RED.includes(s); }

function initGame() {
  const deck = makeDeck();
  const tableau = Array(7).fill(null).map(() => []);
  let idx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      tableau[col].push({ ...deck[idx], faceUp: row === col });
      idx++;
    }
  }
  return { tableau, stock: deck.slice(idx).map(c => ({ ...c, faceUp: false })), waste: [], foundations: [[], [], [], []] };
}

function Card({ card, small, onClick, selected, style }) {
  if (!card) return null;
  const red = isRed(card.suit);
  const bg = selected ? '#dbeafe' : 'white';
  return (
    <div
      onClick={onClick}
      style={{ ...style, cursor: onClick ? 'pointer' : 'default', userSelect: 'none' }}
      className={`rounded border flex items-center justify-center font-bold select-none transition-all
        ${small ? 'w-10 h-14 text-xs' : 'w-14 h-20 text-sm'}
        ${selected ? 'ring-2 ring-blue-400' : ''}
      `}
      title={card.faceUp ? `${card.rank}${card.suit}` : ''}
    >
      {card.faceUp ? (
        <div className={`text-center leading-tight ${red ? 'text-red-600' : 'text-gray-900'}`}
          style={{ background: bg, width: '100%', height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2px 3px' }}>
          <div>{card.rank}{card.suit}</div>
          <div style={{ transform: 'rotate(180deg)' }}>{card.rank}{card.suit}</div>
        </div>
      ) : (
        <div className="w-full h-full rounded flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 25%, #2563eb 100%)' }}>
          <span className="text-white/30 text-lg">🂠</span>
        </div>
      )}
    </div>
  );
}

export default function SolitaireApp() {
  const [game, setGame] = useState(initGame);
  const [selected, setSelected] = useState(null); // {from, colIdx, cardIdx}
  const [won, setWon] = useState(false);

  const reset = () => { setGame(initGame()); setSelected(null); setWon(false); };

  const checkWin = (foundations) => foundations.every(f => f.length === 13);

  const canPlaceOnFoundation = (card, foundation) => {
    if (foundation.length === 0) return card.rank === 'A';
    const top = foundation[foundation.length - 1];
    return card.suit === top.suit && rankVal(card.rank) === rankVal(top.rank) + 1;
  };

  const canPlaceOnTableau = (card, col) => {
    if (col.length === 0) return card.rank === 'K';
    const top = col[col.length - 1];
    if (!top.faceUp) return false;
    return isRed(card.suit) !== isRed(top.suit) && rankVal(card.rank) === rankVal(top.rank) - 1;
  };

  const handleStockClick = () => {
    setSelected(null);
    setGame(g => {
      const g2 = JSON.parse(JSON.stringify(g));
      if (g2.stock.length === 0) {
        g2.stock = g2.waste.reverse().map(c => ({ ...c, faceUp: false }));
        g2.waste = [];
      } else {
        const card = g2.stock.pop();
        card.faceUp = true;
        g2.waste.push(card);
      }
      return g2;
    });
  };

  const handleWasteClick = () => {
    const g2 = JSON.parse(JSON.stringify(game));
    if (g2.waste.length === 0) return;
    const card = g2.waste[g2.waste.length - 1];
    setSelected({ from: 'waste', card });
  };

  const handleFoundationClick = (fIdx) => {
    if (!selected) return;
    const g2 = JSON.parse(JSON.stringify(game));
    let card;
    if (selected.from === 'waste') {
      if (!canPlaceOnFoundation(g2.waste[g2.waste.length - 1], g2.foundations[fIdx])) { setSelected(null); return; }
      card = g2.waste.pop();
    } else if (selected.from === 'tableau') {
      const col = g2.tableau[selected.colIdx];
      if (selected.cardIdx !== col.length - 1) { setSelected(null); return; }
      if (!canPlaceOnFoundation(col[selected.cardIdx], g2.foundations[fIdx])) { setSelected(null); return; }
      card = col.pop();
      if (col.length > 0) col[col.length - 1].faceUp = true;
    } else { setSelected(null); return; }
    g2.foundations[fIdx].push(card);
    setSelected(null);
    const didWin = checkWin(g2.foundations);
    setGame(g2);
    if (didWin) setWon(true);
  };

  const handleTableauClick = (colIdx, cardIdx) => {
    const g2 = JSON.parse(JSON.stringify(game));
    const col = g2.tableau[colIdx];
    if (cardIdx < col.length && !col[cardIdx].faceUp) {
      if (cardIdx === col.length - 1) { col[cardIdx].faceUp = true; setGame(g2); }
      setSelected(null); return;
    }
    if (selected) {
      // Try to place
      const toCol = g2.tableau[colIdx];
      let cards = [];
      if (selected.from === 'waste') {
        const card = g2.waste[g2.waste.length - 1];
        if (!canPlaceOnTableau(card, toCol)) { setSelected(null); return; }
        g2.waste.pop();
        cards = [card];
      } else if (selected.from === 'tableau') {
        const fromCol = g2.tableau[selected.colIdx];
        cards = fromCol.splice(selected.cardIdx);
        if (!canPlaceOnTableau(cards[0], toCol)) {
          fromCol.push(...cards); setSelected(null); return;
        }
        if (fromCol.length > 0) fromCol[fromCol.length - 1].faceUp = true;
      }
      toCol.push(...cards);
      setSelected(null);
      setGame(g2);
    } else {
      if (!col[cardIdx]?.faceUp) return;
      setSelected({ from: 'tableau', colIdx, cardIdx });
    }
  };

  const selCard = selected?.from === 'waste' ? selected.card : selected?.from === 'tableau' ? game.tableau[selected.colIdx]?.[selected.cardIdx] : null;

  return (
    <div className="h-full flex flex-col items-center" style={{ background: '#1a6b3c', padding: '12px 8px', overflowY: 'auto' }}>
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-2xl font-bold mb-2">You Win!</div>
            <button onClick={reset} className="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold">Play Again</button>
          </div>
        </div>
      )}
      {/* Top Row */}
      <div className="flex items-start gap-2 w-full mb-3">
        {/* Stock */}
        <div onClick={handleStockClick} className="w-14 h-20 rounded border-2 border-white/30 flex items-center justify-center cursor-pointer"
          style={{ background: game.stock.length ? 'linear-gradient(135deg,#1e3a5f,#2563eb)' : 'rgba(255,255,255,0.1)' }}>
          {game.stock.length ? <span className="text-white/30">🂠</span> : <span className="text-white/40 text-xs">↺</span>}
        </div>
        {/* Waste */}
        <div onClick={handleWasteClick} className="w-14 h-20 rounded border-2 border-white/30 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.1)' }}>
          {game.waste.length > 0 ? (
            <Card card={game.waste[game.waste.length - 1]} small
              selected={selected?.from === 'waste'}
              onClick={handleWasteClick} />
          ) : <span className="text-white/30 text-xs">Empty</span>}
        </div>
        <div className="flex-1" />
        {/* Foundations */}
        {game.foundations.map((f, fi) => (
          <div key={fi} onClick={() => handleFoundationClick(fi)}
            className="w-14 h-20 rounded border-2 border-white/30 flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            {f.length > 0
              ? <Card card={f[f.length - 1]} small onClick={() => handleFoundationClick(fi)} />
              : <span className="text-white/40 text-lg">{SUITS[fi]}</span>}
          </div>
        ))}
      </div>
      {/* Tableau */}
      <div className="flex gap-2 w-full items-start">
        {game.tableau.map((col, ci) => (
          <div key={ci} className="flex-1 relative" style={{ minHeight: 120 }}>
            <div onClick={() => col.length === 0 && handleTableauClick(ci, 0)}
              className="w-full rounded border-2 border-white/20 absolute top-0" style={{ height: 80, background: 'rgba(255,255,255,0.07)', cursor: 'pointer' }} />
            {col.map((card, i) => (
              <div key={i} style={{ position: 'absolute', top: i * 22, zIndex: i + 1, width: '100%' }}>
                <Card card={card}
                  selected={selected?.from === 'tableau' && selected.colIdx === ci && selected.cardIdx <= i && i >= selected.cardIdx}
                  onClick={() => handleTableauClick(ci, i)} small />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={reset} className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-all">New Game</button>
        {selected && <button onClick={() => setSelected(null)} className="px-4 py-1.5 bg-red-500/40 hover:bg-red-500/60 text-white text-sm rounded-lg transition-all">Deselect</button>}
      </div>
    </div>
  );
}
