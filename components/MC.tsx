
import React from 'react';

type MCState = 'idle' | 'correct' | 'wrong' | 'thinking';

interface MCProps {
    state: MCState;
}

const MC_MESSAGES: Record<MCState, string[]> = {
    idle: ["Chúc may mắn!", "Bạn đã sẵn sàng chưa?", "Câu hỏi tiếp theo đây!", "Tập trung nhé!"],
    correct: ["Chính xác!", "Tuyệt vời!", "Làm tốt lắm!", "Bạn thật thông minh!"],
    wrong: ["Rất tiếc, sai rồi!", "Cố gắng lần sau nhé.", "Chưa đúng rồi.", "Tiếc quá!"],
    thinking: ["Để xem nào...", "Câu này thú vị đây...", "Tôi đang suy nghĩ..."]
};

// A simple robot character SVG
const MCRobot: React.FC<{ state: MCState }> = ({ state }) => {
    let eyes = <><circle cx="12" cy="14" r="2" /><circle cx="20" cy="14" r="2" /></>;
    let mouth = <path d="M12 20 C 14 22, 18 22, 20 20" stroke="white" strokeWidth="1.5" fill="none" />; // Smile

    switch (state) {
        case 'correct':
            eyes = <><path d="M10 14 C 11 12, 13 12, 14 14" stroke="white" strokeWidth="1.5" fill="none" /><path d="M18 14 C 19 12, 21 12, 22 14" stroke="white" strokeWidth="1.5" fill="none" /></>; // Happy eyes
            mouth = <path d="M12 20 Q 16 24, 20 20" stroke="white" strokeWidth="1.5" fill="none" />; // Big smile
            break;
        case 'wrong':
            eyes = <><line x1="10" y1="15" x2="14" y2="13"/><line x1="14" y1="15" x2="10" y2="13"/><line x1="18" y1="15" x2="22" y2="13"/><line x1="22" y1="15" x2="18" y2="13"/></>; // X eyes
            mouth = <path d="M12 22 C 14 20, 18 20, 20 22" stroke="white" strokeWidth="1.5" fill="none" />; // Frown
            break;
        case 'thinking':
             eyes = <><circle cx="12" cy="14" r="1.5" fill="none" stroke="white" strokeWidth="1"/><path d="M20 14 L 18 14 L 22 14" stroke="white" strokeWidth="1.5"/></>; // one eye normal, one squinting
             mouth = <line x1="12" y1="21" x2="20" y2="21" stroke="white" strokeWidth="1.5" />; // Flat mouth
            break;
        case 'idle':
        default:
            // Default eyes and mouth
            break;
    }

    return (
        <svg viewBox="0 0 32 32" className="w-24 h-24">
            {/* Head */}
            <rect x="6" y="6" width="20" height="20" rx="4" fill="#4A5568" />
            {/* Antenna */}
            <line x1="16" y1="6" x2="16" y2="2" stroke="white" strokeWidth="1.5" />
            <circle cx="16" cy="2" r="2" fill="#818CF8" />
            {/* Screen */}
            <rect x="8" y="8" width="16" height="18" rx="2" fill="black" />
            {/* Eyes and Mouth */}
            <g className="transition-all duration-300 ease-in-out">
               {eyes}
               {mouth}
            </g>
        </svg>
    );
};


const MC: React.FC<MCProps> = ({ state }) => {
    // Using a simple modulo to cycle through messages, or just pick one randomly
    const message = MC_MESSAGES[state][Math.floor(Math.random() * MC_MESSAGES[state].length)];
    
    const stateKey = `${state}-${message}`;

    return (
        <div className="flex flex-col items-center gap-2 mt-6">
            <MCRobot state={state} />
            <div key={stateKey} className="relative bg-purple-900/70 p-3 rounded-lg animate-fade-in">
                 <p className="text-white text-md italic">"{message}"</p>
                 <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-purple-900/70 border-r-[10px] border-r-transparent"></div>
            </div>
        </div>
    );
};

export default MC;
