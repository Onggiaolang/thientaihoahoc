
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, LifelineState, AIAssistance } from '../types';
import { PRIZE_LEVELS, TIME_PER_QUESTION, INITIAL_QUESTIONS } from '../constants';
import { FiftyFiftyIcon, AskAIIcon, SkipIcon, MuteIcon, UnmuteIcon, ChemistryIcon, LoadingSpinner } from '../components/icons';
import { useAudio } from '../hooks/useAudio';
import { getAIAssistance } from '../services/geminiService';
import Modal from '../components/Modal';
import MC from '../components/MC';

const GameScreen: React.FC<{
    playerName: string;
    onEndGame: (score: { name: string; score: number; question: number; time: number }) => void;
}> = ({ playerName, onEndGame }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'pending' | 'correct' | 'wrong'>('pending');
    const [timer, setTimer] = useState(TIME_PER_QUESTION);
    const [lifelines, setLifelines] = useState<LifelineState>({ fiftyFifty: true, askExpert: true, skip: true });
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
    const { isMuted, toggleMute, playSound } = useAudio();
    const [isStopModalOpen, setStopModalOpen] = useState(false);
    const [totalTime, setTotalTime] = useState(0);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<AIAssistance | null>(null);
    const [mcState, setMcState] = useState<'idle' | 'correct' | 'wrong' | 'thinking'>('idle');

    useEffect(() => {
        try {
            const item = window.localStorage.getItem('questions');
            const storedQuestions: Question[] = item ? JSON.parse(item) : INITIAL_QUESTIONS;
            // Shuffle questions for variety
            const shuffled = [...storedQuestions].sort(() => 0.5 - Math.random());
            setQuestions(shuffled.slice(0, PRIZE_LEVELS.length));
        } catch (error) {
            console.error(error);
            setQuestions(INITIAL_QUESTIONS.slice(0, PRIZE_LEVELS.length));
        }
    }, []);

    useEffect(() => {
        if (answerStatus !== 'pending') return;
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(t => t - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            handleAnswer(null);
        }
    }, [timer, answerStatus]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setTotalTime(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleAnswer = useCallback((answerIndex: number | null) => {
        if (answerStatus !== 'pending') return;

        setSelectedAnswer(answerIndex);
        playSound('select');
        
        setTimeout(() => {
            const isCorrect = answerIndex === questions[currentQuestionIndex]?.answer;
            setAnswerStatus(isCorrect ? 'correct' : 'wrong');
            setMcState(isCorrect ? 'correct' : 'wrong');
            playSound(isCorrect ? 'correct' : 'wrong');

            setTimeout(() => {
                if (isCorrect) {
                    if (currentQuestionIndex === questions.length - 1) {
                        onEndGame({ name: playerName, score: PRIZE_LEVELS[PRIZE_LEVELS.length - 1], question: questions.length, time: totalTime });
                    } else {
                        setCurrentQuestionIndex(prev => prev + 1);
                        setAnswerStatus('pending');
                        setSelectedAnswer(null);
                        setTimer(TIME_PER_QUESTION);
                        setHiddenOptions([]);
                        setAiSuggestion(null);
                        setMcState('idle');
                    }
                } else {
                    onEndGame({ name: playerName, score: currentQuestionIndex > 0 ? PRIZE_LEVELS[currentQuestionIndex-1] : 0, question: currentQuestionIndex, time: totalTime });
                }
            }, 2000);
        }, 1000);
    }, [answerStatus, currentQuestionIndex, questions, onEndGame, playerName, playSound, totalTime]);

    const useFiftyFifty = () => {
        if (!lifelines.fiftyFifty || answerStatus !== 'pending') return;
        playSound('lifeline');
        const correctAnswer = questions[currentQuestionIndex].answer;
        const incorrectOptions = [0, 1, 2, 3].filter(i => i !== correctAnswer);
        const randomIncorrect = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
        setHiddenOptions([0, 1, 2, 3].filter(i => i !== correctAnswer && i !== randomIncorrect));
        setLifelines(l => ({ ...l, fiftyFifty: false }));
    };

    const useAskExpert = async () => {
        if (!lifelines.askExpert || answerStatus !== 'pending') return;
        playSound('lifeline');
        setIsAIThinking(true);
        setMcState('thinking');
        setLifelines(l => ({ ...l, askExpert: false }));
        const suggestion = await getAIAssistance(questions[currentQuestionIndex]);
        setAiSuggestion(suggestion);
        setIsAIThinking(false);
        setMcState('idle');
    };

    const useSkip = () => {
        if (!lifelines.skip || answerStatus !== 'pending') return;
        playSound('lifeline');
        setLifelines(l => ({ ...l, skip: false }));
        if (currentQuestionIndex < questions.length - 1) {
             setCurrentQuestionIndex(prev => prev + 1);
             setAnswerStatus('pending');
             setSelectedAnswer(null);
             setTimer(TIME_PER_QUESTION);
             setHiddenOptions([]);
             setAiSuggestion(null);
             setMcState('idle');
        } else {
             // Can't skip the last question, just end the game with current winnings
             handleStopGame();
        }
    };
    
    const handleStopGame = () => {
        setStopModalOpen(false);
        const score = currentQuestionIndex > 0 ? PRIZE_LEVELS[currentQuestionIndex - 1] : 0;
        onEndGame({ name: playerName, score: score, question: currentQuestionIndex, time: totalTime });
    };

    const currentQuestion = questions[currentQuestionIndex];

    const getAnswerClass = (index: number) => {
        if (answerStatus !== 'pending') {
            if (index === currentQuestion.answer) return 'bg-green-500/80 border-green-400';
            if (index === selectedAnswer) return 'bg-red-500/80 border-red-400';
            return 'bg-gray-700/50 border-gray-600 opacity-50';
        }
        if (selectedAnswer === index) return 'bg-yellow-500/80 border-yellow-400 animate-pulse';
        if (hiddenOptions.includes(index)) return 'opacity-0 invisible';
        return 'bg-purple-800/60 border-purple-600 hover:bg-purple-700/80 hover:border-purple-500';
    };
    
    const memoizedPrizeLadder = useMemo(() => (
        <ul className="space-y-1 text-right text-lg">
            {PRIZE_LEVELS.slice().reverse().map((prize, index) => {
                const level = PRIZE_LEVELS.length - 1 - index;
                const isCurrent = level === currentQuestionIndex;
                const isAchieved = level < currentQuestionIndex;
                
                let levelClass = "text-gray-400";
                if (isCurrent) levelClass = "text-yellow-300 font-bold text-xl scale-110";
                if (isAchieved) levelClass = "text-green-400 line-through opacity-60";
                if (level === 4 || level === 9 || level === 14) levelClass += " font-extrabold text-white";

                return (
                    <li key={prize} className={`transition-all duration-300 transform ${levelClass}`}>
                        <span className="mr-2">{level + 1}</span> {prize.toLocaleString()}
                    </li>
                );
            })}
        </ul>
    ), [currentQuestionIndex]);

    if (!currentQuestion) {
        return <div className="flex items-center justify-center h-screen"><LoadingSpinner className="w-16 h-16 animate-spin text-purple-400" /></div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 flex flex-col">
                <header className="flex justify-between items-center mb-4 p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-4">
                        <ChemistryIcon className="w-10 h-10 text-cyan-400"/>
                        <div>
                             <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AI LÀ THIÊN TÀI</h1>
                             <p className="text-sm text-gray-300">HÓA HỌC / LỚP 11</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleMute} className="p-2 rounded-full bg-black/30 hover:bg-purple-500/50 transition-colors">
                            {isMuted ? <MuteIcon className="w-6 h-6"/> : <UnmuteIcon className="w-6 h-6"/>}
                        </button>
                        <button onClick={() => setStopModalOpen(true)} className="bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg transition-colors">Dừng cuộc chơi</button>
                    </div>
                </header>

                <div className="flex justify-center items-center gap-4 my-4">
                    {[
                        { name: "50:50", icon: <FiftyFiftyIcon className="w-6 h-6"/>, action: useFiftyFifty, available: lifelines.fiftyFifty },
                        { name: "Hỏi Chuyên gia", icon: <AskAIIcon className="w-6 h-6"/>, action: useAskExpert, available: lifelines.askExpert },
                        { name: "Bỏ qua", icon: <SkipIcon className="w-6 h-6"/>, action: useSkip, available: lifelines.skip }
                    ].map((lifeline) => (
                         <button 
                             key={lifeline.name} 
                             onClick={lifeline.action} 
                             disabled={!lifeline.available} 
                             className={`w-36 text-center p-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${lifeline.available ? 'bg-purple-600 hover:bg-purple-500 hover:scale-105' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}
                             aria-label={lifeline.name}
                         >
                            {lifeline.icon}
                            <span className="font-semibold">{lifeline.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-grow flex flex-col justify-center items-center bg-black/30 p-6 rounded-lg relative">
                    <div className={`relative w-24 h-24 flex items-center justify-center mb-6`}>
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                             <circle className="text-gray-700" strokeWidth="5" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                             <circle 
                                className="text-purple-400"
                                strokeWidth="5"
                                strokeDasharray={2 * Math.PI * 45}
                                strokeDashoffset={2 * Math.PI * 45 * (1 - timer / TIME_PER_QUESTION)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="45" cx="50" cy="50"
                                style={{transition: 'stroke-dashoffset 1s linear'}}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <span className="text-4xl font-bold">{timer}</span>
                    </div>

                    <div className="w-full text-center p-6 bg-black/20 rounded-lg min-h-[120px] flex items-center justify-center">
                        <h2 className="text-2xl md:text-3xl font-semibold">{currentQuestion.question}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {currentQuestion.options.map((option, index) => (
                        <button key={index} onClick={() => handleAnswer(index)} disabled={answerStatus !== 'pending' || hiddenOptions.includes(index)}
                            className={`p-4 rounded-lg text-left text-lg font-medium transition-all duration-300 border-2 ${getAnswerClass(index)}`}>
                            <span className="font-bold mr-2">{String.fromCharCode(65 + index)}:</span> {option}
                        </button>
                    ))}
                </div>
            </div>

            <aside className="lg:col-span-1 bg-black/30 p-6 rounded-lg flex flex-col justify-between">
                <div>
                     <h3 className="text-2xl font-bold mb-4 text-center text-purple-300">Thang điểm</h3>
                     {memoizedPrizeLadder}
                </div>
                <div>
                    <MC state={mcState} />
                    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg text-center min-h-[124px] flex flex-col justify-center">
                         {isAIThinking && <div className="flex items-center justify-center text-cyan-300"><LoadingSpinner className="w-6 h-6 mr-2 animate-spin"/>Chuyên gia đang suy nghĩ...</div>}
                        {aiSuggestion && (
                            <div className="animate-fade-in w-full">
                                <h4 className="font-bold text-cyan-400 mb-2">Chuyên gia Hóa học gợi ý:</h4>
                                <p className="text-3xl font-black text-white mb-3">Đáp án {aiSuggestion.suggestedAnswer}</p>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-300">Độ chắc chắn</span>
                                        <span className="text-sm font-bold text-white">{aiSuggestion.confidence}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div 
                                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${aiSuggestion.confidence}%` }}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <Modal isOpen={isStopModalOpen} onClose={() => setStopModalOpen(false)} title="Dừng cuộc chơi?">
                <p className="text-gray-300 mb-6">Bạn có chắc chắn muốn dừng cuộc chơi? Bạn sẽ ra về với số điểm của câu hỏi cuối cùng đã trả lời đúng.</p>
                <p className="text-xl font-bold text-yellow-400 mb-6">Điểm hiện tại: {(currentQuestionIndex > 0 ? PRIZE_LEVELS[currentQuestionIndex-1] : 0).toLocaleString()}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={() => setStopModalOpen(false)} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">Tiếp tục chơi</button>
                    <button onClick={handleStopGame} className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Dừng lại</button>
                </div>
            </Modal>
        </div>
    );
};

export default GameScreen;
