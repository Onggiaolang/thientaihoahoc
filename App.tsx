
import React, { useState, useCallback } from 'react';
import { Screen, PlayerScore } from './types';
import StartScreen from './screens/StartScreen';
import GameScreen from './screens/GameScreen';
import GameOverScreen from './screens/GameOverScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AdminScreen from './screens/AdminScreen';

const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>('start');
    const [playerName, setPlayerName] = useState('');
    const [finalScore, setFinalScore] = useState<PlayerScore | null>(null);

    const startGame = useCallback((name: string) => {
        setPlayerName(name);
        setCurrentScreen('game');
    }, []);

    const endGame = useCallback((score: PlayerScore) => {
        setFinalScore(score);
        setCurrentScreen('gameover');
    }, []);

    const restartGame = useCallback(() => {
        setFinalScore(null);
        setCurrentScreen('start');
    }, []);

    const showLeaderboard = useCallback(() => setCurrentScreen('leaderboard'), []);
    const showAdmin = useCallback(() => setCurrentScreen('admin'), []);
    const showStartScreen = useCallback(() => setCurrentScreen('start'), []);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'start':
                return <StartScreen onStartGame={startGame} onShowLeaderboard={showLeaderboard} onShowAdmin={showAdmin} />;
            case 'game':
                return <GameScreen playerName={playerName} onEndGame={endGame} />;
            case 'gameover':
                return finalScore && <GameOverScreen score={finalScore} onRestart={restartGame} onShowLeaderboard={showLeaderboard} />;
            case 'leaderboard':
                return <LeaderboardScreen onBack={showStartScreen} />;
            case 'admin':
                return <AdminScreen onBack={showStartScreen} />;
            default:
                return <StartScreen onStartGame={startGame} onShowLeaderboard={showLeaderboard} onShowAdmin={showAdmin} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] p-4 flex items-center justify-center transition-all duration-500">
            <div className="w-full max-w-7xl mx-auto">
                {renderScreen()}
            </div>
        </div>
    );
};

export default App;
