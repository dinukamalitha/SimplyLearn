import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../API/api';
import { ChevronLeft, FilePlus, Calendar, Target, Type } from 'lucide-react';

const CreateAssignment = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        instructions: '',
        deadline: '',
        max_points: 100
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/assignments', { ...formData, course_id: courseId });
            navigate(`/courses/${courseId}`);
        } catch (err) {
            console.error(err);
            alert('Failed to create assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto text-white">
            <Link to={`/courses/${courseId}`} className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" /> Back to Course
            </Link>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <FilePlus className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">New Assignment</h1>
                        <p className="text-gray-400">Set tasks and deadlines for your students.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                            <Type className="w-4 h-4" /> Assignment Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Final Research Project"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                            <FilePlus className="w-4 h-4" /> Instructions
                        </label>
                        <textarea
                            placeholder="Detail exactly what students need to do..."
                            value={formData.instructions}
                            onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 transition-all resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                <Calendar className="w-4 h-4" /> Deadline
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                <Target className="w-4 h-4" /> Max Points
                            </label>
                            <input
                                type="number"
                                value={formData.max_points}
                                onChange={e => setFormData({ ...formData, max_points: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Launch Assignment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignment;
