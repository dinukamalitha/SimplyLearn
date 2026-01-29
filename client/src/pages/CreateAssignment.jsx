import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../API/api';
import AuthContext from '../context/AuthContext';

const CreateAssignment = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        instructions: '',
        deadline: '',
        max_points: 100
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assignments', { ...formData, course_id: courseId });
            navigate(`/courses/${courseId}`);
        } catch (error) {
            alert('Failed to create assignment');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Create Assignment</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-400 mb-2">Title</label>
                    <input 
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-2">Instructions</label>
                    <textarea 
                        value={formData.instructions}
                        onChange={e => setFormData({...formData, instructions: e.target.value})}
                        className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-2">Deadline</label>
                    <input 
                        type="date"
                        value={formData.deadline}
                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                        className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-2">Max Points</label>
                    <input 
                        type="number"
                        value={formData.max_points}
                        onChange={e => setFormData({...formData, max_points: e.target.value})}
                        className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Create Assignment
                </button>
            </form>
        </div>
    );
};

export default CreateAssignment;
