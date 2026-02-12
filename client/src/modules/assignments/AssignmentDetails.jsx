import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../API/api';
import AuthContext from '../../context/AuthContext';
import { FileText, Save, CheckCircle, Upload, AlertCircle, File, Download, Clock } from 'lucide-react';

const AssignmentDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [submissions, setSubmissions] = useState([]); // For tutors
    const [textEntry, setTextEntry] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
                if (subRes.data) setTextEntry(subRes.data.text_entry || '');
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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        formData.append('assignment_id', id);
        formData.append('text_entry', textEntry);
        if (file) formData.append('file', file);

        try {
            await api.post('/submissions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Submitted successfully!');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGrade = async (subId, grade, feedback) => {
        try {
            await api.put(`/submissions/${subId}/grade`, { grade, feedback });
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Grading failed');
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading...</div>;
    if (!assignment) return <div className="text-center py-20 text-white">Assignment not found</div>;

    const isTutor = user.role !== 'Student';
    const deadline = new Date(assignment.deadline);
    const now = new Date();
    const isOverdue = now > deadline;

    return (
        <div className="max-w-4xl mx-auto p-8 text-white">
            <Link to="/assignments" className="text-blue-400 hover:underline mb-6 inline-block">← Back to Assignments</Link>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
                        <p className="text-gray-400">Assignment ID: {id}</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-sm font-bold px-3 py-1 rounded-full mb-2 ${isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {isOverdue ? 'Overdue' : 'Active'}
                        </div>
                        <p className="text-2xl font-bold">{assignment.max_points} <span className="text-sm text-gray-500">pts</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 py-6 border-y border-white/10">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Due Date</p>
                        <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            {deadline.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Status</p>
                        <p className={submission ? 'text-green-400' : isOverdue ? 'text-red-500' : 'text-yellow-500'}>
                            {submission ? 'Submitted' : isOverdue ? 'Missing' : 'Pending'}
                        </p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                    <p className="text-gray-300 whitespace-pre-line">{assignment.instructions}</p>
                </div>
            </div>

            {/* Student View */}
            {!isTutor && (
                <div className={`bg-white/5 border rounded-2xl p-8 ${submission ? 'border-green-500/30' : isOverdue ? 'border-red-500/30' : 'border-white/10'}`}>
                    <h2 className="text-2xl font-bold mb-6">Your Submission</h2>
                    {submission ? (
                        <div className="space-y-6">
                            {new Date(submission.submission_date) > deadline ? (
                                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-center gap-3 text-red-400">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>Submitted Late on {new Date(submission.submission_date).toLocaleString()}</span>
                                </div>
                            ) : (
                                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg flex items-center gap-3 text-green-400">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Submitted on {new Date(submission.submission_date).toLocaleString()}</span>
                                </div>
                            )}

                            {submission.grade != null && (
                                <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-xl">
                                    <h4 className="text-blue-200 font-bold text-lg mb-2">Feedback & Grade</h4>
                                    <p className="text-3xl font-bold text-white mb-2">{submission.grade} <span className="text-sm text-blue-400">/ {assignment.max_points}</span></p>
                                    {submission.feedback && <p className="text-gray-300 italic">"{submission.feedback}"</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {submission.file_url && (
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <p className="text-gray-500 text-xs font-bold uppercase mb-2">Attached File</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <File className="w-5 h-5 text-blue-400" />
                                                <span className="text-sm truncate max-w-[150px]">{submission.file_url.split('/').pop()}</span>
                                            </div>
                                            <a href={`http://localhost:8000${submission.file_url}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Text Entry</p>
                                    <p className="text-sm text-gray-300 italic">{submission.text_entry || 'No text provided'}</p>
                                </div>
                            </div>

                            {!submission.grade && (
                                <button onClick={() => setSubmission(null)} className="text-sm text-gray-500 hover:text-white transition-colors underline">
                                    Resubmit Assignment
                                </button>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Text Content</label>
                                <textarea
                                    value={textEntry}
                                    onChange={(e) => setTextEntry(e.target.value)}
                                    className="w-full bg-black/20 border border-gray-600 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 transition-all"
                                    placeholder="Type your summary or answer here..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Upload File (PDF, DOC, ZIP, PPTX)</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center group-hover:border-blue-500 transition-colors bg-black/10">
                                        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500 group-hover:text-blue-400" />
                                        <p className="text-gray-400">{file ? file.name : 'Click or drag file to upload'}</p>
                                        <p className="text-xs text-gray-600 mt-2">Maximum file size: 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] ${isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {submitting ? 'Submitting...' : isOverdue ? 'Submit Late' : 'Submit Assignment'}
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
                        {submissions.map(sub => {
                            const subDate = new Date(sub.submission_date);
                            const isLate = subDate > deadline;

                            return (
                                <div key={sub._id} className="bg-black/20 p-6 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold">{sub.student_id?.name || 'Unknown Student'}</h4>
                                            <p className={`text-xs font-bold ${isLate ? 'text-red-400' : 'text-green-400'}`}>
                                                {isLate ? 'LATE SUBMISSION' : 'ON TIME'}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">Date: {subDate.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            {sub.grade != null ? (
                                                <span className="text-green-400 font-bold text-xl">{sub.grade} / {assignment.max_points}</span>
                                            ) : (
                                                <span className="text-yellow-400 italic bg-yellow-400/10 px-2 py-1 rounded text-xs">Pending Grade</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mb-4">
                                        {sub.file_url && (
                                            <a href={`http://localhost:8000${sub.file_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-600/30 transition-all">
                                                <Download className="w-4 h-4" />
                                                Download {sub.file_url.split('.').pop().toUpperCase()}
                                            </a>
                                        )}
                                    </div>

                                    {sub.text_entry && (
                                        <div className="bg-white/5 p-4 rounded-lg mb-4 text-sm text-gray-300 italic border-l-2 border-gray-600">
                                            "{sub.text_entry}"
                                        </div>
                                    )}

                                    <div className="flex gap-4 items-end bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div className="w-32">
                                            <label className="block text-xs text-gray-500 mb-1">Score</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                defaultValue={sub.grade}
                                                id={`grade-${sub._id}`}
                                                max={assignment.max_points}
                                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">Feedback</label>
                                            <input
                                                type="text"
                                                placeholder="Write comments for the student..."
                                                defaultValue={sub.feedback}
                                                id={`feedback-${sub._id}`}
                                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const grade = document.getElementById(`grade-${sub._id}`).value;
                                                const feedback = document.getElementById(`feedback-${sub._id}`).value;
                                                handleGrade(sub._id, grade, feedback);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 p-2.5 rounded-lg text-white transition-colors"
                                        >
                                            <Save className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDetails;
