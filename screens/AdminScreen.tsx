import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Question } from '../types';
import { INITIAL_QUESTIONS, ADMIN_PASSWORD } from '../constants';

const useLocalStorageQuestions = (): [Question[], React.Dispatch<React.SetStateAction<Question[]>>] => {
    const [questions, setQuestions] = useState<Question[]>(() => {
        try {
            const item = window.localStorage.getItem('questions');
            return item ? JSON.parse(item) : INITIAL_QUESTIONS;
        } catch (error) {
            console.error(error);
            return INITIAL_QUESTIONS;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('questions', JSON.stringify(questions));
        } catch (error) {
            console.error(error);
        }
    }, [questions]);

    return [questions, setQuestions];
};

const NEW_QUESTION_TEMPLATE: Question = {
    id: '',
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    topic: '',
};

const AdminScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [questions, setQuestions] = useLocalStorageQuestions();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [formQuestion, setFormQuestion] = useState<Question>(NEW_QUESTION_TEMPLATE);
    const [isEditing, setIsEditing] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filterTopic, setFilterTopic] = useState('all');

    const topics = useMemo(() => {
        const allTopics = questions
            .map(q => q.topic)
            .filter((t): t is string => !!t);
        return ['all', ...Array.from(new Set(allTopics))];
    }, [questions]);
    
    const filteredQuestions = useMemo(() => {
        if (filterTopic === 'all') {
            return questions;
        }
        return questions.filter(q => q.topic === filterTopic);
    }, [questions, filterTopic]);


    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Mật khẩu không đúng!');
        }
    };
    
    const handleEditQuestion = (question: Question) => {
        setFormQuestion(question);
        setIsEditing(true);
    };

    const handleSaveQuestion = (questionToSave: Question) => {
        if (isEditing) {
            setQuestions(questions.map(q => q.id === questionToSave.id ? questionToSave : q));
        } else {
            const newQuestion = { ...questionToSave, id: `q_${Date.now()}` };
            setQuestions([...questions, newQuestion]);
        }
        setFormQuestion(NEW_QUESTION_TEMPLATE);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setFormQuestion(NEW_QUESTION_TEMPLATE);
        setIsEditing(false);
    };

    const handleDeleteQuestion = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
            setQuestions(questions.filter(q => q.id !== id));
        }
    };
    
    const handleBulkAdd = () => {
        const lines = bulkText.split('\n').filter(line => line.trim() !== '');
        const newQuestions: Question[] = [];
        let currentQuestion: Partial<Question> & { options: string[] } = { options: [] };
        let currentTopic: string | undefined = undefined;
        
        try {
            for (const line of lines) {
                 if (line.startsWith('Chủ đề:')) {
                    currentTopic = line.substring(8).trim();
                } else if (line.startsWith('Câu hỏi:')) {
                    if (currentQuestion.question) {
                        // Incomplete previous question
                    }
                    currentQuestion = { 
                        id: `q_${Date.now()}_${newQuestions.length}`, 
                        question: line.substring(9).trim(), 
                        options: [],
                        topic: currentTopic
                    };
                } else if (line.match(/^[A-D]\.\s/)) {
                    currentQuestion.options.push(line.substring(3).trim());
                } else if (line.startsWith('ĐÁP ÁN ĐÚNG:')) {
                    const ans = line.substring(14).trim().toUpperCase();
                    const ansIndex = ['A', 'B', 'C', 'D'].indexOf(ans);
                    if (ansIndex !== -1 && currentQuestion.question && currentQuestion.options.length === 4) {
                        currentQuestion.answer = ansIndex;
                        newQuestions.push(currentQuestion as Question);
                        currentQuestion = { options: [] };
                    }
                }
            }
            if(newQuestions.length > 0) {
              setQuestions(prev => [...prev, ...newQuestions]);
              setBulkText('');
              alert(`${newQuestions.length} câu hỏi đã được thêm thành công!`);
            } else {
              throw new Error("Không tìm thấy câu hỏi hợp lệ nào.");
            }
        } catch (e) {
            alert(`Đã xảy ra lỗi khi xử lý dữ liệu: ${(e as Error).message}`);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const lines = text.split('\n').filter(line => line.trim() !== '');
                const dataLines = lines[0].toLowerCase().includes('question') ? lines.slice(1) : lines;

                const newQuestions: Question[] = dataLines.map((line, index) => {
                    const parts = line.split(',');
                     if (parts.length < 6) {
                        throw new Error(`Dòng ${index + 2} không hợp lệ: phải có ít nhất 6 cột.`);
                    }

                    const [question, optA, optB, optC, optD, answerIndexStr, topic] = parts.map(p => p.trim().replace(/^"|"$/g, ''));
                    const answer = parseInt(answerIndexStr, 10);

                    if (!question || !optA || !optB || !optC || !optD || isNaN(answer) || answer < 0 || answer > 3) {
                         throw new Error(`Dòng ${index + 2} có dữ liệu không hợp lệ.`);
                    }

                    return {
                        id: `q_csv_${Date.now()}_${index}`,
                        question,
                        options: [optA, optB, optC, optD],
                        answer,
                        topic: topic || undefined,
                    };
                });

                if (newQuestions.length > 0) {
                    setQuestions(prev => [...prev, ...newQuestions]);
                    alert(`${newQuestions.length} câu hỏi đã được nhập thành công từ file CSV!`);
                } else {
                    throw new Error("File không chứa câu hỏi hợp lệ nào.");
                }

            } catch (error) {
                 alert(`Lỗi khi xử lý file CSV: ${(error as Error).message}`);
            }
            if (event.target) {
                event.target.value = '';
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const handleExportCSV = () => {
        const header = 'question,optionA,optionB,optionC,optionD,correctAnswerIndex,topic\n';
        const rows = questions.map(q => 
            [q.question, ...q.options, q.answer, q.topic || '']
            .map(val => `"${String(val).replace(/"/g, '""')}"`) // Escape quotes and wrap in quotes
            .join(',')
        ).join('\n');
        
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(header + rows); // Add BOM for Excel compatibility
        const link = document.createElement('a');
        link.setAttribute('href', csvContent);
        link.setAttribute('download', 'questions_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-center mb-4 text-purple-400">Quản lý câu hỏi</h1>
                <p className="text-center text-gray-300 mb-6">Vui lòng nhập mật khẩu để tiếp tục.</p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Mật khẩu"
                />
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <div className="flex gap-4">
                     <button onClick={onBack} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Quay lại
                    </button>
                    <button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg max-w-7xl mx-auto text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-purple-400">Ngân hàng câu hỏi</h1>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Quay lại
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Question List */}
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                       <h2 className="text-2xl font-semibold">Danh sách ({filteredQuestions.length})</h2>
                       <div className='flex items-center gap-2'>
                          <select 
                            value={filterTopic} 
                            onChange={e => setFilterTopic(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500 h-full"
                          >
                             {topics.map(t => <option key={t} value={t}>{t === 'all' ? 'Tất cả chủ đề' : t}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                       {filteredQuestions.map(q => (
                           <div key={q.id} className="bg-gray-700 p-4 rounded-lg mb-4">
                                <div className="flex justify-between items-start">
                                     <p className="font-semibold text-lg flex-1 pr-4">{q.question}</p>
                                     {q.topic && <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full whitespace-nowrap">{q.topic}</span>}
                                </div>
                                <ul className="list-disc list-inside mt-2">
                                    {q.options.map((opt, i) => (
                                        <li key={i} className={i === q.answer ? 'text-green-400 font-bold' : ''}>{opt}</li>
                                    ))}
                                </ul>
                                <div className="mt-4 flex gap-2">
                                    <button onClick={() => handleEditQuestion(q)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Sửa</button>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Xóa</button>
                                </div>
                            </div>
                        ))}
                        {filteredQuestions.length === 0 && (
                            <div className="text-center p-8 text-gray-400 bg-gray-700 rounded-lg">
                                Không có câu hỏi nào.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Management Tools */}
                <div className="lg:col-span-2 space-y-8">
                     <div className="bg-gray-900/50 p-6 rounded-lg">
                         <h2 className="text-2xl font-semibold mb-4 text-purple-300">{isEditing ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</h2>
                         <QuestionForm 
                            key={formQuestion.id || 'new-question'}
                            question={formQuestion} 
                            onSave={handleSaveQuestion} 
                            onCancel={handleCancelEdit} 
                            isEditing={isEditing}
                        />
                    </div>
                    <div className="space-y-4 bg-gray-900/50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2 text-purple-300">Công cụ hàng loạt</h2>
                        <div>
                            <h3 className="font-semibold">Thêm từ văn bản</h3>
                            <textarea
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                className="w-full h-32 bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 my-2"
                                placeholder={`(Tùy chọn) Chủ đề:...\nCâu hỏi:...\nA. ...\nB. ...\nC. ...\nD. ...\nĐÁP ÁN ĐÚNG: A`}
                            />
                            <button onClick={handleBulkAdd} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Thêm từ văn bản
                            </button>
                        </div>
                        <div className="border-t border-gray-700 pt-4">
                             <h3 className="font-semibold">Nhập / Xuất File CSV</h3>
                             <p className="text-sm text-gray-400 my-2">
                                Định dạng: <code>question,...,correctAnswerIndex,topic</code>
                             </p>
                             <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                             <div className="flex gap-4">
                                <button onClick={handleImportClick} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    Nhập CSV
                                </button>
                                 <button onClick={handleExportCSV} className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    Xuất CSV
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuestionForm: React.FC<{ 
    question: Question; 
    onSave: (question: Question) => void; 
    onCancel: () => void;
    isEditing: boolean;
}> = ({ question, onSave, onCancel, isEditing }) => {
    const [formState, setFormState] = useState(question);

    useEffect(() => {
        setFormState(question);
    }, [question]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.question.trim() || formState.options.some(opt => !opt.trim())) {
            alert('Vui lòng điền đầy đủ câu hỏi và tất cả các đáp án.');
            return;
        }
        onSave(formState);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">Câu hỏi</label>
                <input type="text" value={formState.question} onChange={e => setFormState({...formState, question: e.target.value})} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300">Chủ đề (Tùy chọn)</label>
                <input type="text" value={formState.topic || ''} onChange={e => setFormState({...formState, topic: e.target.value})} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500" />
            </div>
            {formState.options.map((opt, index) => (
                <div key={index}>
                    <label className="block text-sm font-medium text-gray-300">Đáp án {String.fromCharCode(65 + index)}</label>
                    <input type="text" value={opt} onChange={e => {
                        const newOptions = [...formState.options];
                        newOptions[index] = e.target.value;
                        setFormState({...formState, options: newOptions});
                    }} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500" />
                </div>
            ))}
            <div>
                <label className="block text-sm font-medium text-gray-300">Đáp án đúng</label>
                <select value={formState.answer} onChange={e => setFormState({...formState, answer: parseInt(e.target.value)})} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500">
                    <option value={0}>A</option>
                    <option value={1}>B</option>
                    <option value={2}>C</option>
                    <option value={3}>D</option>
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">{isEditing ? 'Hủy' : 'Xóa trắng'}</button>
                <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">{isEditing ? 'Lưu thay đổi' : 'Thêm câu hỏi'}</button>
            </div>
        </form>
    );
}

export default AdminScreen;