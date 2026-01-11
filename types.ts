export interface Question {
    id: string;
    question: string;
    options: string[];
    answer: number; // 0-3 index
    topic?: string;
}

export interface PlayerScore {
    name: string;
    score: number;
    question: number;
    time: number; // in seconds
}

export interface LifelineState {
    fiftyFifty: boolean;
    askExpert: boolean;
    skip: boolean;
}

export type Screen = 'start' | 'game' | 'gameover' | 'leaderboard' | 'admin';

export interface AIAssistance {
    suggestedAnswer: 'A' | 'B' | 'C' | 'D';
    confidence: number;
}
