import React, { useState, useEffect, useCallback } from 'react';

const ROWS = 9, COLS = 9, MINES = 10;

function createBoard() {
  const board = Array(ROWS).fill(null).map(() =>
    Array(COLS).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  );
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) count++;
      }
      board[r][c].count = count;
    }
  }
  return board;
}

function reveal(board, r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return board;
  if (board[r][c].revealed || board[r][c].flagged) return board;
  board[r][c].revealed = true;
  if (board[r][c].count === 0 && !board[r][c].mine) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      board = reveal(board, r + dr, c + dc);
    }
  }
  return board;
}

const COLORS = ['', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-700', 'text-red-800', 'text-teal-500', 'text-black', 'text-gray-500'];

export default function MinesweeperApp() {
  const [board, setBoard] = useState(() => createBoard());
  const [status, setStatus] = useState('playing'); // playing, won, lost
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (status !== 'playing') return;
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const reset = () => {
    setBoard(createBoard());
    setStatus('playing');
    setFlags(0);
    setTime(0);
  };

  const handleClick = (r, c) => {
    if (status !== 'playing') return;
    if (board[r][c].flagged || board[r][c].revealed) return;
    if (board[r][c].mine) {
      const nb = board.map(row => row.map(cell => ({ ...cell, revealed: cell.mine ? true : cell.revealed })));
      setBoard(nb);
      setStatus('lost');
      return;
    }
    const nb = board.map(row => row.map(cell => ({ ...cell })));
    const updated = reveal(nb, r, c);
    setBoard(updated);
    const unrevealedSafe = updated.flat().filter(cell => !cell.mine && !cell.revealed).length;
    if (unrevealedSafe === 0) setStatus('won');
  };

  const handleRightClick = (e, r, c) => {
    e.preventDefault();
    if (status !== 'playing' || board[r][c].revealed) return;
    const nb = board.map(row => row.map(cell => ({ ...cell })));
    nb[r][c].flagged = !nb[r][c].flagged;
    setFlags(f => nb[r][c].flagged ? f + 1 : f - 1);
    setBoard(nb);
  };

  const smiley = status === 'won' ? '😎' : status === 'lost' ? '😵' : '🙂';

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#c0c0c0]" style={{ fontFamily: 'monospace' }}>
      <div className="bg-[#c0c0c0] p-4 border-4" style={{ borderColor: '#ffffff #808080 #808080 #ffffff' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-2 py-2 border-2" style={{ borderColor: '#808080 #ffffff #ffffff #808080', background: '#c0c0c0' }}>
          <div className="bg-black text-red-500 font-bold text-xl px-2 py-1 min-w-[50px] text-center" style={{ fontFamily: 'Courier, monospace' }}>
            {String(MINES - flags).padStart(3, '0')}
          </div>
          <button onClick={reset} className="text-2xl w-10 h-10 flex items-center justify-center border-2 active:border-inset"
            style={{ borderColor: '#ffffff #808080 #808080 #ffffff', background: '#c0c0c0' }}>
            {smiley}
          </button>
          <div className="bg-black text-red-500 font-bold text-xl px-2 py-1 min-w-[50px] text-center" style={{ fontFamily: 'Courier, monospace' }}>
            {String(Math.min(time, 999)).padStart(3, '0')}
          </div>
        </div>
        {/* Board */}
        <div className="border-4" style={{ borderColor: '#808080 #ffffff #ffffff #808080' }}>
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                const revealed = cell.revealed;
                return (
                  <button
                    key={c}
                    onClick={() => handleClick(r, c)}
                    onContextMenu={e => handleRightClick(e, r, c)}
                    className="w-8 h-8 flex items-center justify-center text-sm font-bold select-none"
                    style={{
                      background: revealed ? '#c0c0c0' : '#c0c0c0',
                      border: revealed
                        ? '1px solid #808080'
                        : '2px solid',
                      borderColor: revealed ? '#808080' : '#ffffff #808080 #808080 #ffffff',
                    }}
                  >
                    {revealed
                      ? cell.mine ? '💣' : cell.count > 0 ? <span className={COLORS[cell.count]}>{cell.count}</span> : ''
                      : cell.flagged ? '🚩' : ''}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {status !== 'playing' && (
          <div className="mt-3 text-center">
            <p className="font-bold text-lg">{status === 'won' ? '🎉 You Won!' : '💥 Game Over!'}</p>
            <button onClick={reset} className="mt-1 px-4 py-1 bg-gray-300 border-2 text-sm font-bold hover:bg-gray-200"
              style={{ borderColor: '#ffffff #808080 #808080 #ffffff' }}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
