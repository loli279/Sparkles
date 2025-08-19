import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../state/AppContext';
import { useSound } from '../hooks/useSound';

interface GremlinSweeperProps {
    onExit: () => void;
}

type TileValue = number | 'gremlin';
interface Tile {
    value: TileValue;
    state: 'hidden' | 'visible' | 'flagged';
}

const ROWS = 8;
const COLS = 8;
const GREMLINS = 10;

const createEmptyBoard = (): Tile[][] =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => ({ value: 0, state: 'hidden' })));

const GremlinSweeper: React.FC<GremlinSweeperProps> = ({ onExit }) => {
    const { state, dispatch } = useAppContext();
    const { user } = state;
    const { playSound } = useSound();

    const [board, setBoard] = useState<Tile[][]>(createEmptyBoard());
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
    const [firstClick, setFirstClick] = useState(true);

    const initializeBoard = useCallback((firstRow: number, firstCol: number) => {
        let newBoard = createEmptyBoard();
        let gremlinsPlaced = 0;

        // Place gremlins
        while (gremlinsPlaced < GREMLINS) {
            const row = Math.floor(Math.random() * ROWS);
            const col = Math.floor(Math.random() * COLS);
            if (newBoard[row][col].value !== 'gremlin' && !(row === firstRow && col === firstCol)) {
                newBoard[row][col].value = 'gremlin';
                gremlinsPlaced++;
            }
        }

        // Calculate clues
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (newBoard[r][c].value === 'gremlin') continue;
                let adjacentGremlins = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const nr = r + i;
                        const nc = c + j;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].value === 'gremlin') {
                            adjacentGremlins++;
                        }
                    }
                }
                newBoard[r][c].value = adjacentGremlins;
            }
        }
        setBoard(newBoard);
        return newBoard;
    }, []);

    useEffect(() => {
        if (gameState !== 'playing' || firstClick) return;
    
        const hiddenTiles = board.flat().filter(tile => tile.state === 'hidden' || tile.state === 'flagged').length;
        
        if (hiddenTiles === GREMLINS) {
            setGameState('won');
            playSound('achievement');
            
            if (user && !state.isGuest && user.gameData) {
                const pointsToAdd = 50; // Winning bonus
                const newGameData = { 
                    ...user.gameData, 
                    points: user.gameData.points + pointsToAdd 
                };
                dispatch({ type: 'UPDATE_USER_STATE', payload: { id: user.id, gameData: newGameData } });
            }
        }
    }, [board, gameState, firstClick, playSound, user, dispatch, state.isGuest]);

    const revealTile = (row: number, col: number, currentBoard: Tile[][]) => {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS || currentBoard[row][col].state === 'visible' || currentBoard[row][col].state === 'flagged') {
            return;
        }

        currentBoard[row][col].state = 'visible';

        if (currentBoard[row][col].value === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    revealTile(row + i, col + j, currentBoard);
                }
            }
        }
    };

    const handleTileClick = (row: number, col: number) => {
        if (gameState !== 'playing') return;

        let currentBoard = board.map(r => r.map(c => ({...c})));

        if (firstClick) {
            currentBoard = initializeBoard(row, col);
            setFirstClick(false);
        }
        
        const tile = currentBoard[row][col];
        if (tile.state !== 'hidden') return;
        
        if (tile.value === 'gremlin') {
            playSound('click'); // Bad sound
            setGameState('lost');
            // Reveal all gremlins
            currentBoard.forEach(r => r.forEach(t => {
                if (t.value === 'gremlin') t.state = 'visible';
            }));
        } else {
            playSound('message');
            revealTile(row, col, currentBoard);
        }

        setBoard(currentBoard);
    };

    const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        if (gameState !== 'playing' || firstClick) return;

        const newBoard = board.map(r => r.map(c => ({...c})));
        const tile = newBoard[row][col];

        if (tile.state === 'hidden') {
            tile.state = 'flagged';
        } else if (tile.state === 'flagged') {
            tile.state = 'hidden';
        }
        setBoard(newBoard);
    };
    
    const resetGame = () => {
        setFirstClick(true);
        setBoard(createEmptyBoard());
        setGameState('playing');
    }

    const tileColors: { [key: number]: string } = {
        1: 'text-blue-500', 2: 'text-green-600', 3: 'text-red-500',
        4: 'text-blue-800', 5: 'text-red-800', 6: 'text-teal-500',
    };

    return (
        <div className="w-full max-w-lg mx-auto text-center">
            <h3 className="text-3xl font-bold text-[var(--color-text-strong)] mb-4">👾 Gremlin Sweeper 👾</h3>
            
            <div className="relative inline-block bg-slate-300 p-2 rounded-lg shadow-inner">
                <AnimatePresence>
                {gameState !== 'playing' && (
                    <motion.div 
                        initial={{opacity: 0}} 
                        animate={{opacity: 1}} 
                        exit={{opacity: 0}}
                        className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm"
                    >
                        <p className="text-4xl font-black text-white drop-shadow-lg">{gameState === 'won' ? 'You Won! 🎉' : 'Oh No! 🦷'}</p>
                        {gameState === 'won' && <p className="text-lg font-bold text-amber-300">+50 Points!</p>}
                        <button onClick={resetGame} className="mt-4 py-2 px-6 btn-primary text-white font-bold rounded-full">Play Again</button>
                    </motion.div>
                )}
                </AnimatePresence>
                 <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${COLS}, 1fr)`}}>
                    {board.map((row, rIndex) =>
                        row.map((tile, cIndex) => (
                            <button
                                key={`${rIndex}-${cIndex}`}
                                onClick={() => handleTileClick(rIndex, cIndex)}
                                onContextMenu={(e) => handleRightClick(e, rIndex, cIndex)}
                                className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-xl transition-colors duration-200 select-none ${
                                    tile.state === 'visible' ? 'bg-slate-200' : 'bg-slate-400 hover:bg-slate-500'
                                }`}
                            >
                                {tile.state === 'flagged' && '🚩'}
                                {tile.state === 'visible' && tile.value !== 0 && (
                                    tile.value === 'gremlin' ? '👾' : <span className={tileColors[tile.value]}>{tile.value}</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-6">
                <button onClick={onExit} className="py-3 px-8 bg-slate-200 text-slate-700 font-bold rounded-full">
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default GremlinSweeper;