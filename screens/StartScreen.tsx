
import React, { useState } from 'react';
import { ChemistryIcon } from '../components/icons';

const StartScreen: React.FC<{
    onStartGame: (name: string) => void;
    onShowLeaderboard: () => void;
    onShowAdmin: () => void;
}> = ({ onStartGame, onShowLeaderboard, onShowAdmin }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleStart = () => {
        if (name.trim()) {
            onStartGame(name.trim());
        } else {
            setError('Vui lòng nhập tên của bạn!');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
            <div className="bg-gray-800/50 backdrop-blur-md p-10 rounded-3xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 animate-fade-in-up">
                <ChemistryIcon className="w-24 h-24 mx-auto mb-4 text-cyan-400" />
                <h1 className="text-5xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    AI LÀ THIÊN TÀI
                </h1>
                <p className="text-xl text-gray-300 mb-8">PHIÊN BẢN HÓA HỌC 11</p>
                
                <div className="max-w-sm mx-auto">
                    <input 
                        type="text"
                        placeholder="Nhập tên của bạn"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                        className="w-full text-center bg-gray-900/70 text-white text-xl p-4 rounded-lg mb-4 border-2 border-transparent focus:outline-none focus:border-purple-500 transition-all"
                    />
                    {error && <p className="text-red-400 mb-4">{error}</p>}
                    <button 
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-2xl py-4 px-4 rounded-lg transition-transform hover:scale-105 shadow-lg shadow-purple-500/30"
                    >
                        BẮT ĐẦU
                    </button>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                    <button onClick={onShowLeaderboard} className="text-gray-300 hover:text-white hover:underline transition-colors">
                        Bảng xếp hạng
                    </button>
                    <span className="text-gray-500">|</span>
                    <button onClick={onShowAdmin} className="text-gray-300 hover:text-white hover:underline transition-colors">
                        Quản lý
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
