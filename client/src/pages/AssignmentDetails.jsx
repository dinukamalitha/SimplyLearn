import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../API/api';
import AuthContext from '../context/AuthContext';
import { FileText, Save, CheckCircle } from 'lucide-react';

const AssignmentDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [submissions, setSubmissions] = useState([]); // For tutors
    const [textEntry, setTextEntry] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const assignmentRes = await api.get(`/assignments/${id}`);
            setAssignment(assignmentRes.data);

            if (user.role === 'Student') {
                const subRes = await api.get(`/submissions/my/${id}`);
                setSubmission(subRes.data);
                if (subRes.data) setTextEntry(subRes.data.text_entry);
            } else {
                const subsRes = await api.get(`/submissions/assignment/${id}`);
                setSubmissions(subsRes.data);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/submissions', {
                assignment_id: id,
                text_entry: textEntry,
                file_url: 'http://mock.url/file.pdf' // Mock for now
            });
            alert('Submitted successfully!');
            fetchData();
        } catch (error) {
            alert('Submission failed');
        }
    };

    const handleGrade = async (subId, grade, feedback) => {
        try {
            await api.put(`/submissions/${subId}/grade`, { grade, feedback });
            fetchData();
        } catch (error) {
            alert('Grading failed');
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading...</div>;
    if (!assignment) return <div className="text-center py-20 text-white">Assignment not found</div>;

    const isTutor = user.role !== 'Student';

    return (
        <div className="max-w-4xl mx-auto p-8 text-white">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-4">{assignment.title}</h1>
                <div className="flex justify-between text-gray-400 text-sm mb-6 pb-6 border-b border-white/10">
                    <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                    <span>Points: {assignment.max_points}</span>
                </div>
                <div className="prose prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                    <p className="text-gray-300 whitespace-pre-line">{assignment.instructions}</p>
                </div>
            </div>

            {/* Student View */}
            {!isTutor && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-6">Your Submission</h2>
                    {submission ? (
                        <div className="space-y-4">
                             <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg flex items-center gap-3 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span>Submitted on {new Date(submission.submission_date).toLocaleString()}</span>
                            </div>
                            {submission.grade != null && (
                                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                                    <p className="text-blue-200 font-bold">Grade: {submission.grade} / {assignment.max_points}</p>
                                    {submission.feedback && <p className="text-gray-300 mt-2">Feedback: {submission.feedback}</p>}
                                </div>
                            )}
                            <div className="bg-black/20 p-4 rounded-lg">
                                <p className="text-gray-400 text-sm mb-2">Text Entry:</p>
                                <p>{submission.text_entry}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <textarea 
                                value={textEntry}
                                onChange={(e) => setTextEntry(e.target.value)}
                                className="w-full bg-black/20 border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 mb-4"
                                placeholder="Type your answer here..."
                                required
                            />
                            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold">
                                Submit Assignment
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Tutor View */}
            {isTutor && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-6">Submissions ({submissions.length})</h2>
                    <div className="space-y-4">
                        {submissions.map(sub => (
                            <div key={sub._id} className="bg-black/20 p-6 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold">{sub.student_id?.name || 'Unknown Student'}</h4>
                                        <p className="text-gray-400 text-sm">Submitted: {new Date(sub.submission_date).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        {sub.grade != null ? (
                                            <span className="text-green-400 font-bold">{sub.grade} / {assignment.max_points}</span>
                                        ) : (
                                            <span className="text-yellow-400 italic">Ungraded</span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg mb-4 text-sm text-gray-300">
                                    {sub.text_entry}
                                </div>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">Grade</label>
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            defaultValue={sub.grade}
                                            id={`grade-${sub._id}`}
                                            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex-[3]">
                                        <label className="block text-xs text-gray-500 mb-1">Feedback</label>
                                        <input 
                                            type="text" 
                                            placeholder="Feedback"
                                            defaultValue={sub.feedback}
                                            id={`feedback-${sub._id}`}
                                            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const grade = document.getElementById(`grade-${sub._id}`).value;
                                            const feedback = document.getElementById(`feedback-${sub._id}`).value;
                                            handleGrade(sub._id, grade, feedback);
                                        }}
                                        className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg text-white"
                                    >
                                        <Save className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDetails;
