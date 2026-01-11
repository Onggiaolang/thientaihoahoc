
import React, { useState, useEffect } from 'react';
import { PlayerScore } from '../types';
import { PRIZE_LEVELS } from '../constants';
import { CheckCircleIcon, LoadingSpinner, MedalIcon } from '../components/icons';

const GameOverScreen: React.FC<{
    score: PlayerScore;
    onRestart: () => void;
    onShowLeaderboard: () => void;
}> = ({ score, onRestart, onShowLeaderboard }) => {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);

    useEffect(() => {
        try {
            const item = window.localStorage.getItem('leaderboard');
            setLeaderboard(item ? JSON.parse(item) : []);
        } catch (error) {
            console.error("Could not load leaderboard", error);
        }
    }, []);

    const handleSaveScore = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            const newLeaderboard = [...leaderboard, score]
                .sort((a, b) => b.score - a.score || a.time - b.time)
                .slice(0, 999);
            try {
                window.localStorage.setItem('leaderboard', JSON.stringify(newLeaderboard));
                setSaveStatus('saved');
            } catch (error) {
                console.error("Could not save to leaderboard", error);
                setSaveStatus('idle'); // Or an error state
            }
        }, 1000); // Simulate network delay
    };

    const prize = score.question > 0 ? PRIZE_LEVELS[score.question - 1] : 0;
    const isWinner = score.score === PRIZE_LEVELS[PRIZE_LEVELS.length - 1];

    if (isWinner) {
        return (
            <div className="text-center bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 max-w-3xl mx-auto animate-fade-in">
                <div className="border-4 border-yellow-400 p-6 rounded-lg bg-gray-900/50">
                    <MedalIcon className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
                    <h2 className="text-2xl font-serif text-gray-300 tracking-widest">CHỨNG NHẬN</h2>
                    <h1 className="text-5xl font-bold font-serif my-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                        THIÊN TÀI HÓA HỌC
                    </h1>
                    <p className="text-xl text-gray-300 mb-2 font-serif">Trân trọng trao cho</p>
                    <p className="text-4xl font-bold text-cyan-400 mb-6 font-serif">{score.name}</p>
                    <p className="text-lg text-gray-400 max-w-lg mx-auto mb-8">
                        Đã xuất sắc vượt qua 15 câu hỏi của chương trình "Ai là thiên tài" và giành được giải thưởng cao nhất.
                    </p>
                    <div className="flex justify-end items-center mt-8">
                         <div className="text-center">
                            <p className="text-2xl font-script text-white">Thầy Nguyễn Văn Hà</p>
                            <p className="border-t-2 border-gray-500 w-48 mx-auto mt-1 pt-1 text-gray-400">Người chứng nhận</p>
                         </div>
                    </div>
                </div>
                 <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    {saveStatus === 'idle' && (
                         <button onClick={handleSaveScore} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 text-lg">
                            Lưu điểm
                        </button>
                    )}
                     {saveStatus === 'saving' && (
                        <div className="flex items-center justify-center text-lg text-white font-bold py-3 px-6 rounded-lg bg-yellow-600">
                           <LoadingSpinner className="w-6 h-6 mr-2 animate-spin" /> Đang lưu...
                        </div>
                    )}
                    {saveStatus === 'saved' && (
                        <div className="flex items-center justify-center text-lg text-white font-bold py-3 px-6 rounded-lg bg-green-600">
                           <CheckCircleIcon className="w-6 h-6 mr-2" /> Đã lưu thành công!
                        </div>
                    )}
                    <button onClick={onRestart} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 text-lg">
                        Chơi lại
                    </button>
                    <button onClick={onShowLeaderboard} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 text-lg">
                        Bảng xếp hạng
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="text-center bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                KẾT THÚC
            </h1>
            <p className="text-xl text-gray-300 mb-2">Chúc mừng, {score.name}!</p>
            <p className="text-4xl font-bold text-yellow-400 mb-6">
                Bạn đã giành được {prize.toLocaleString()} điểm!
            </p>
            <div className="text-lg text-gray-400 space-y-2 mb-8">
                <p>Số câu trả lời đúng: {score.question}</p>
                <p>Tổng thời gian: {score.time} giây</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                {saveStatus === 'idle' && (
                     <button onClick={handleSaveScore} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 text-lg">
                        Lưu điểm
                    </button>
                )}
                 {saveStatus === 'saving' && (
                    <div className="flex items-center justify-center text-lg text-white font-bold py-3 px-6 rounded-lg bg-yellow-600">
                       <LoadingSpinner className="w-6 h-6 mr-2 animate-spin" /> Đang lưu...
                    </div>
                )}
                {saveStatus === 'saved' && (
                    <div className="flex items-center justify-center text-lg text-white font-bold py-3 px-6 rounded-lg bg-green-600">
                       <CheckCircleIcon className="w-6 h-6 mr-2" /> Đã lưu thành công!
                    </div>
                )}
                <button onClick={onRestart} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 text-lg">
                    Chơi lại
                </button>
                <button onClick={onShowLeaderboard} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 text-lg">
                    Bảng xếp hạng
                </button>
            </div>
        </div>
    );
};

export default GameOverScreen;