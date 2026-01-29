import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../API/api';
import { Plus, Trash } from 'lucide-react';

const CreateQuiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [timer, setTimer] = useState(30);
    const [questions, setQuestions] = useState([
        { question_text: '', options: ['', ''], correct_option_index: 0, type: 'Multiple Choice' }
    ]);

    const handleAddQuestion = () => {
        setQuestions([...questions, { question_text: '', options: ['', ''], correct_option_index: 0, type: 'Multiple Choice' }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addOption = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push('');
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/quizzes', {
                course_id: courseId,
                title,
                timer_limit: timer,
                questions
            });
            navigate(`/courses/${courseId}`);
        } catch (error) {
            alert('Failed to create quiz');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 text-white">
            <h1 className="text-3xl font-bold mb-8">Create Quiz</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <label className="block text-gray-400 mb-2">Quiz Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Timer (mins)</label>
                        <input 
                            type="number" 
                            value={timer}
                            onChange={e => setTimer(e.target.value)}
                            className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white/5 border border-white/10 rounded-xl p-6 relative">
                            <h3 className="text-lg font-bold mb-4">Question {qIndex + 1}</h3>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-1">Question Text</label>
                                <input 
                                    type="text" 
                                    value={q.question_text}
                                    onChange={e => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                                    className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2 mb-4">
                                <label className="block text-sm text-gray-400">Options</label>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex gap-2">
                                        <input 
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correct_option_index === oIndex}
                                            onChange={() => handleQuestionChange(qIndex, 'correct_option_index', oIndex)}
                                            className="mt-3"
                                        />
                                        <input 
                                            type="text"
                                            value={opt}
                                            onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                            placeholder={`Option ${oIndex + 1}`}
                                            required
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOption(qIndex)} className="text-sm text-blue-400 hover:text-blue-300 mt-2">
                                    + Add Option
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={handleAddQuestion} className="w-full py-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-white transition-colors">
                    + Add Question
                </button>

                <div className="flex justify-end pt-6">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                        Save Quiz
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuiz;
