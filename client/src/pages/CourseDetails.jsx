import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../API/api';
import AuthContext from '../context/AuthContext';
import { ChevronLeft, FileText, Video, Link as LinkIcon, Plus, FileQuestion } from 'lucide-react';
import ForumSection from '../components/ForumSection';

const CourseDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('materials');
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [newMaterial, setNewMaterial] = useState({ title: '', type: 'PDF', url: '' });

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/courses/${id}`);
            setCourse(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            // Optimistic update
            const updatedMaterials = {
                materials: newMaterial
            };
            
            await api.put(`/courses/${id}`, updatedMaterials);
            
            setNewMaterial({ title: '', type: 'PDF', url: '' });
            setShowMaterialModal(false);
            fetchCourse();
        } catch (error) {
            alert('Failed to add material');
        }
    };

    if (loading) return <div className="text-white text-center py-20">Loading...</div>;
    if (!course) return <div className="text-white text-center py-20">Course not found</div>;

    const isTutor = user?.role === 'Tutor' || user?.role === 'Admin';
    const tabs = [
        { id: 'materials', label: 'Materials' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'quizzes', label: 'Quizzes' },
        { id: 'forum', label: 'Forum' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">
            <Link to="/courses" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" /> Back to Courses
            </Link>

            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-white/10 rounded-2xl p-8 mb-8">
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-gray-300 leading-relaxed max-w-4xl">{course.description}</p>
                <div className="mt-6 flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium">
                        Instructor: {course.tutor_id?.name || 'Unknown'}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                            activeTab === tab.id ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></div>
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {activeTab === 'materials' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Course Materials</h2>
                                {isTutor && (
                                    <button 
                                        onClick={() => setShowMaterialModal(true)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold"
                                    >
                                        <Plus className="w-4 h-4" /> Add Material
                                    </button>
                                )}
                            </div>
                            
                            {course.materials?.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-500">
                                    No materials uploaded yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {course.materials.map((item, index) => (
                                        <a 
                                            key={index}
                                            href={item.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="block bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 rounded-xl p-4 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg ${item.type === 'PDF' ? 'bg-red-500/20 text-red-400' : item.type === 'Video' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                                    {item.type === 'PDF' ? <FileText className="w-6 h-6" /> : item.type === 'Video' ? <Video className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                                    <p className="text-sm text-gray-500">{item.type}</p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                       <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Assignments</h3>
                                {isTutor && (
                                    <Link to={`/courses/${id}/create-assignment`} className="text-blue-400 hover:text-blue-300 text-sm font-bold">
                                        + Create New
                                    </Link>
                                )}
                            </div>
                            <AssignmentsList courseId={id} />
                        </div>
                    )}

                    {activeTab === 'quizzes' && (
                         <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Quizzes</h3>
                                {isTutor && (
                                    <Link to={`/courses/${id}/create-quiz`} className="text-blue-400 hover:text-blue-300 text-sm font-bold">
                                        + Create New
                                    </Link>
                                )}
                            </div>
                            <QuizzesList courseId={id} />
                        </div>
                    )}

                    {activeTab === 'forum' && (
                        <ForumSection courseId={id} />
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Course Stats</h3>
                        <div className="space-y-4 text-sm text-gray-400">
                             <div className="flex justify-between">
                                <span>Materials</span>
                                <span className="text-white">{course.materials?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Created</span>
                                <span className="text-white">{new Date(course.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             {/* Add Material Modal */}
             {showMaterialModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1a1d2d] rounded-2xl p-8 w-full max-w-md border border-white/10">
                        <h2 className="text-2xl font-bold mb-6">Add Material</h2>
                        <form onSubmit={handleAddMaterial} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    value={newMaterial.title}
                                    onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                                <select 
                                    value={newMaterial.type}
                                    onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="PDF">PDF Document</option>
                                    <option value="Video">Video URL</option>
                                    <option value="Link">External Link</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                                <input 
                                    type="text" 
                                    value={newMaterial.url}
                                    onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                    required 
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setShowMaterialModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AssignmentsList = ({ courseId }) => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const { data } = await api.get(`/assignments/course/${courseId}`);
                setAssignments(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAssignments();
    }, [courseId]);

    if (assignments.length === 0) return <div className="text-gray-500 text-sm">No assignments yet.</div>;

    return (
        <div className="space-y-3">
            {assignments.map(a => (
                <Link to={`/assignments/${a._id}`} key={a._id} className="block p-4 bg-black/20 hover:bg-black/30 rounded-lg transition-colors border border-white/5 group">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{a.title}</h4>
                        <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">Due: {new Date(a.deadline).toLocaleDateString()}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
};

const QuizzesList = ({ courseId }) => {
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const { data } = await api.get(`/quizzes/course/${courseId}`);
                setQuizzes(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchQuizzes();
    }, [courseId]);

    if (quizzes.length === 0) return <div className="text-gray-500 text-sm">No quizzes yet.</div>;

    return (
        <div className="space-y-3">
            {quizzes.map(q => (
                <Link to={`/quizzes/${q._id}`} key={q._id} className="block p-4 bg-black/20 hover:bg-black/30 rounded-lg transition-colors border border-white/5 group">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileQuestion className="w-5 h-5 text-purple-400" />
                            <h4 className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors">{q.title}</h4>
                        </div>
                        <span className="text-xs text-gray-400">{q.timer_limit} mins</span>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default CourseDetails;
