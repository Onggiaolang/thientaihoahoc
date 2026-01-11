
import React, { useState, useEffect, useMemo } from 'react';
import { PlayerScore } from '../types';

const LeaderboardScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);

    useEffect(() => {
        try {
            const item = window.localStorage.getItem('leaderboard');
            setLeaderboard(item ? JSON.parse(item) : []);
        } catch (error) {
            console.error(error);
        }
    }, []);
    
    const handleExportCSV = () => {
        const header = 'Thứ hạng,Tên người chơi,Điểm,Số câu đúng,Thời gian (giây)\n';
        const rows = leaderboard.map((score, index) => 
            `${index + 1},"${score.name}",${score.score},${score.question},${score.time}`
        ).join('\n');
        
        const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
        const link = document.createElement('a');
        link.setAttribute('href', csvContent);
        link.setAttribute('download', 'leaderboard.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const memoizedLeaderboard = useMemo(() => leaderboard.map((score, index) => (
        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
            <td className={`p-4 font-bold text-center ${index < 3 ? 'text-yellow-300 text-xl' : ''}`}>{index + 1}</td>
            <td className="p-4">{score.name}</td>
            <td className="p-4 text-green-400 font-semibold">{score.score.toLocaleString()}</td>
            <td className="p-4 text-center">{score.question}</td>
            <td className="p-4 text-center">{score.time}s</td>
        </tr>
    )), [leaderboard]);

    return (
        <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Bảng Xếp Hạng
                </h1>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Quay lại
                </button>
            </div>

            {leaderboard.length > 999 && (
                <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 p-3 rounded-lg mb-4 text-center">
                    Cảnh báo: Bảng xếp hạng đã đầy. Các điểm số thấp hơn sẽ bị thay thế.
                </div>
            )}
            
            <div className="overflow-x-auto max-h-[60vh] rounded-lg">
                <table className="w-full text-left text-white">
                    <thead className="bg-gray-900 sticky top-0">
                        <tr>
                            <th className="p-4 text-center">Hạng</th>
                            <th className="p-4">Tên người chơi</th>
                            <th className="p-4">Điểm</th>
                            <th className="p-4 text-center">Câu đúng</th>
                            <th className="p-4 text-center">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {memoizedLeaderboard}
                    </tbody>
                </table>
                 {leaderboard.length === 0 && <p className="text-center p-8 text-gray-400">Chưa có ai trên bảng xếp hạng. Hãy là người đầu tiên!</p>}
            </div>

            {leaderboard.length > 0 &&
                <div className="mt-6 text-center">
                    <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Xuất file CSV
                    </button>
                </div>
            }
        </div>
    );
};

export default LeaderboardScreen;
