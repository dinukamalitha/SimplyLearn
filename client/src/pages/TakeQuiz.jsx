import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../API/api';

const TakeQuiz = () => {
    const { id } = useParams(); // quiz id
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await api.get(`/quizzes/${id}`);
                setQuiz(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchQuiz();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correct_option_index) {
                score++;
            }
        });
        const percentage = (score / quiz.questions.length) * 100;
        setResult({ score, total: quiz.questions.length, percentage });
    };

    if (!quiz) return <div className="text-center py-20 text-white">Loading...</div>;

    if (result) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-white text-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
                    <div className="text-6xl font-bold text-blue-400 mb-4">{Math.round(result.percentage)}%</div>
                    <p className="text-xl text-gray-300">You scored {result.score} out of {result.total}</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-8 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                    >
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-400 mb-8">Time Limit: {quiz.timer_limit} minutes</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">{qIndex + 1}. {q.question_text}</h3>
                        <div className="space-y-3">
                            {q.options.map((opt, oIndex) => (
                                <label key={oIndex} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10">
                                    <input 
                                        type="radio" 
                                        name={`q-${qIndex}`}
                                        onChange={() => setAnswers({...answers, [qIndex]: oIndex})}
                                        checked={answers[qIndex] === oIndex}
                                        className="text-blue-500 focus:ring-blue-500 bg-black/20 border-gray-600"
                                    />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg">
                        Submit Quiz
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TakeQuiz;
