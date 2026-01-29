import { useState, useEffect, useContext } from 'react';
import api from '../API/api';
import AuthContext from '../context/AuthContext';
import { MessageSquare, Send } from 'lucide-react';

const ForumSection = ({ courseId }) => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');

    useEffect(() => {
        fetchPosts();
    }, [courseId]);

    const fetchPosts = async () => {
        try {
            const { data } = await api.get(`/forum/course/${courseId}`);
            setPosts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/forum', { course_id: courseId, content: newPost });
            setNewPost('');
            fetchPosts();
        } catch (error) {
            alert('Failed to post');
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-[600px] flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" /> Discussion Board
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {posts.map(post => (
                    <div key={post._id} className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-bold text-sm text-blue-400">{post.user_id?.name}</span>
                                <span className="text-xs text-gray-500 ml-2">({post.user_id?.role})</span>
                            </div>
                            <span className="text-xs text-gray-600">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>
                ))}
                {posts.length === 0 && <div className="text-center text-gray-500 mt-20">No discussions yet. Start one!</div>}
            </div>

            <form onSubmit={handlePost} className="relative">
                <input 
                    type="text" 
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ask a question..."
                    required
                />
                <button type="submit" className="absolute right-2 top-2 p-1 bg-blue-600 rounded hover:bg-blue-700 text-white transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ForumSection;
