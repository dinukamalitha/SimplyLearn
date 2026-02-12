/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect, useContext, useRef } from "react";
import api from "../../API/api";
import AuthContext from "../../context/AuthContext";
import {
    MessageSquare,
    Send,
    MoreVertical,
    Smile,
    MessageCircleMore,
} from "lucide-react";

const ForumSection = ({ courseId }) => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        fetchPosts();
    }, [courseId]);

    useEffect(() => {
        // Only scroll to bottom when user sends a new message
        if (
            posts.length > 0 &&
            posts[posts.length - 1]?.user_id?._id === user?._id
        ) {
            scrollToBottom();
        }
    }, [posts]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchPosts = async () => {
        try {
            const { data } = await api.get(`/forum/course/${courseId}`);
            // Ensure posts are sorted by date (oldest first)
            const sortedPosts = data.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            );
            setPosts(sortedPosts);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        try {
            await api.post("/forum", { course_id: courseId, content: newPost });
            setNewPost("");
            fetchPosts();
        } catch (error) {
            alert("Failed to post");
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString([], { month: "short", day: "numeric" });
        }
    };

    // Group posts by date
    const groupPostsByDate = () => {
        const grouped = {};
        // Sort posts chronologically before grouping
        const sortedPosts = [...posts].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );

        sortedPosts.forEach((post) => {
            const date = new Date(post.createdAt).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(post);
        });
        return grouped;
    };

    const groupedPosts = groupPostsByDate();

    // Handle manual scroll to bottom
    const handleManualScrollToBottom = () => {
        scrollToBottom();
    };

    return (
        <div className="bg-[#0c1317] border border-white/10 rounded-xl p-0 h-[600px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#202c33]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-full">
                        <MessageCircleMore className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Discussion Forum</h3>
                        <p className="text-xs text-gray-400">Course Forum</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto bg-[#0c1317] bg-gradient-to-b from-[#0c1317] to-[#222e35] p-4"
            >
                {Object.entries(groupedPosts).map(([date, datePosts]) => (
                    <div key={date} className="mb-6">
                        {/* Date separator */}
                        <div className="flex justify-center my-4">
                            <span className="px-3 py-1 text-xs text-gray-400 bg-[#222e35] rounded-full">
                                {formatDate(datePosts[0].createdAt)}
                            </span>
                        </div>

                        {/* Messages - oldest at top, newest at bottom */}
                        {datePosts.map((post) => {
                            const isCurrentUser = post.user_id?._id === user?._id;
                            return (
                                <div
                                    key={post._id}
                                    className={`flex mb-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}
                                    >
                                        {/* Sender info for others' messages */}
                                        {!isCurrentUser && (
                                            <div className="flex items-center gap-2 mb-1 ml-1">
                                                <span className="text-xs font-medium text-[#00a884]">
                                                    {post.user_id?.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({post.user_id?.role})
                                                </span>
                                            </div>
                                        )}

                                        {/* Message bubble */}
                                        <div
                                            className={`rounded-lg px-3 py-2 ${isCurrentUser
                                                ? "bg-[#005c4b] rounded-tr-none"
                                                : "bg-[#202c33] rounded-tl-none"
                                                }`}
                                        >
                                            <p className="text-sm text-white whitespace-pre-wrap">
                                                {post.content}
                                            </p>
                                        </div>

                                        {/* Time and status */}
                                        <div
                                            className={`flex items-center gap-2 mt-1 text-xs ${isCurrentUser ? "justify-end mr-1" : "ml-1"
                                                }`}
                                        >
                                            <span className="text-gray-500">
                                                {formatTime(post.createdAt)}
                                            </span>
                                            {isCurrentUser && (
                                                <span className="text-[#53bdeb]">✓✓</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Avatar */}
                                    <div
                                        className={`flex items-end ${isCurrentUser ? "order-1 ml-2" : "order-2 mr-2"
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCurrentUser
                                                ? "bg-green-600 text-white"
                                                : "bg-blue-600 text-white"
                                                }`}
                                        >
                                            {post.user_id?.name?.charAt(0) || "U"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="p-4 mb-4 bg-[#202c33] rounded-full">
                            <MessageSquare className="w-12 h-12 text-gray-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-white">
                            No messages yet
                        </h3>
                        <p className="text-gray-400 max-w-[300px]">
                            Start the conversation by sending the first message!
                        </p>
                    </div>
                )}

                <div ref={messagesEndRef} />

                {/* Scroll to bottom button when not at bottom */}
                {posts.length > 5 && (
                    <button
                        onClick={handleManualScrollToBottom}
                        className="fixed bottom-24 right-8 p-2 bg-[#00a884] text-white rounded-full shadow-lg hover:bg-[#06cf9c] transition-colors"
                        title="Scroll to latest"
                    >
                        <Send className="w-4 h-4 rotate-90" />
                    </button>
                )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-white/10 bg-[#202c33]">
                <form onSubmit={handlePost} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="flex-1 py-3 px-4 text-white rounded-lg bg-[#2a3942] border-none focus:outline-none focus:ring-2 focus:ring-[#00a884]"
                        placeholder="Type a message..."
                        required
                        autoComplete="off"
                    />

                    <button
                        type="submit"
                        className="p-3 text-white rounded-full bg-[#00a884] hover:bg-[#06cf9c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!newPost.trim()}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForumSection;
