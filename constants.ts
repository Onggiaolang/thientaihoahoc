import { Question } from './types';

export const PRIZE_LEVELS: number[] = [
    100, 200, 300, 500, 1000,
    2000, 4000, 8000, 16000, 32000,
    64000, 125000, 250000, 500000, 1000000
];

export const TIME_PER_QUESTION = 30; // seconds

export const ADMIN_PASSWORD = '123456';

export const INITIAL_QUESTIONS: Question[] = [
    {
        id: 'chem11_1',
        question: 'Dung dịch chất nào sau đây làm quỳ tím hóa xanh?',
        options: ['HCl', 'NaOH', 'NaCl', 'H2SO4'],
        answer: 1,
        topic: 'Sự điện li & pH'
    },
    {
        id: 'chem11_2',
        question: 'Chất nào sau đây là một anken?',
        options: ['CH4', 'C2H2', 'C2H4', 'C6H6'],
        answer: 2,
        topic: 'Hóa học hữu cơ'
    },
    {
        id: 'chem11_3',
        question: 'Công thức hóa học của axit nitric là gì?',
        options: ['HNO2', 'H2SO4', 'HCl', 'HNO3'],
        answer: 3,
        topic: 'Nitơ - Photpho'
    },
    {
        id: 'chem11_4',
        question: 'Phản ứng đặc trưng của ankan là gì?',
        options: ['Phản ứng cộng', 'Phản ứng trùng hợp', 'Phản ứng thế', 'Phản ứng oxi hóa - khử'],
        answer: 2,
        topic: 'Hóa học hữu cơ'
    },
    {
        id: 'chem11_5',
        question: 'Số oxi hóa của N trong NH3 là bao nhiêu?',
        options: ['+3', '-3', '0', '+5'],
        answer: 1,
        topic: 'Nitơ - Photpho'
    },
    {
        id: 'chem11_6',
        question: 'Dãy nào sau đây gồm các chất điện li mạnh?',
        options: ['HCl, NaOH, CH3COOH', 'H2SO4, KCl, Ba(OH)2', 'H2S, NaCl, H2O', 'CaCO3, Mg(OH)2, FeS'],
        answer: 1,
        topic: 'Sự điện li & pH'
    },
    {
        id: 'chem11_7',
        question: 'Trong công nghiệp, amoniac (NH3) được sản xuất chủ yếu từ đâu?',
        options: ['Khí nitơ và khí hiđro', 'Phân hủy amoni nitrat', 'Khí nitơ và khí oxi', 'Phân đạm urê'],
        answer: 0,
        topic: 'Nitơ - Photpho'
    },
    {
        id: 'chem11_8',
        question: 'Ancol etylic có công thức phân tử là gì?',
        options: ['CH3OH', 'C2H5OH', 'C3H7OH', 'CH3COOH'],
        answer: 1,
        topic: 'Hóa học hữu cơ'
    },
    {
        id: 'chem11_9',
        question: 'Kim loại nào sau đây không tác dụng với dung dịch HNO3 đặc, nguội?',
        options: ['Cu', 'Mg', 'Al', 'Ag'],
        answer: 2,
        topic: 'Nitơ - Photpho'
    },
    {
        id: 'chem11_10',
        question: 'Phenolphtalein chuyển màu gì trong môi trường bazơ?',
        options: ['Màu xanh', 'Màu vàng', 'Không màu', 'Màu hồng'],
        answer: 3,
        topic: 'Sự điện li & pH'
    },
    {
        id: 'chem11_11',
        question: 'Thành phần chính của khí thiên nhiên là gì?',
        options: ['Etan', 'Propan', 'Metan', 'Butan'],
        answer: 2,
        topic: 'Hóa học hữu cơ'
    },
    {
        id: 'chem11_12',
        question: 'Chất nào được dùng để khử chua đất trồng?',
        options: ['NaCl', 'Ca(OH)2', 'H2SO4', 'KNO3'],
        answer: 1,
        topic: 'Sự điện li & pH'
    },
    {
        id: 'chem11_13',
        question: 'Phản ứng giữa ancol và axit cacboxylic được gọi là gì?',
        options: ['Phản ứng xà phòng hóa', 'Phản ứng este hóa', 'Phản ứng trùng ngưng', 'Phản ứng hiđro hóa'],
        answer: 1,
        topic: 'Hóa học hữu cơ'
    },
    {
        id: 'chem11_14',
        question: 'Trong phân tử benzen (C6H6) có bao nhiêu liên kết pi (π)?',
        options: ['1', '2', '3', '6'],
        answer: 2,
        topic: 'Hóa học hữu cơ'
    },
    {
        id: 'chem11_15',
        question: 'Nguyên tố photpho (P) có thể có các số oxi hóa nào trong hợp chất?',
        options: ['-3, 0, +3, +5', '-3, +3, +5', '-2, 0, +2, +4', 'Chỉ có 0 và +5'],
        answer: 0,
        topic: 'Nitơ - Photpho'
    }
];
