import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../API/api';
import AuthContext from '../context/AuthContext';
import { FileText, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const isTutor = user?.role === 'Tutor' || user?.role === 'Admin';

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!user) return; // Wait for user to be available
            try {
                const endpoint = isTutor ? '/assignments/tutor/my' : '/assignments/student/my';
                const { data } = await api.get(endpoint);
                setAssignments(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchAssignments();
    }, [user, isTutor]);

    const getStatusInfo = (assignment) => {
        if (isTutor) {
            const pending = assignment.submissionStats?.pending || 0;
            return {
                label: pending > 0 ? `${pending} Pending Grades` : 'All Graded',
                color: pending > 0 ? 'text-yellow-400' : 'text-green-400',
                bgColor: pending > 0 ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-green-400/10 border-green-400/30',
                icon: pending > 0 ? Clock : CheckCircle
            };
        }

        const now = new Date();
        const deadline = new Date(assignment.deadline);
        const isOverdue = now > deadline;
        const submitted = assignment.submission;

        if (submitted) {
            const subDate = new Date(submitted.submission_date);
            const isLate = subDate > deadline;
            return {
                label: isLate ? 'Submitted Late' : 'Submitted',
                color: isLate ? 'text-red-400' : 'text-green-400',
                bgColor: isLate ? 'bg-red-400/10 border-red-400/30' : 'bg-green-400/10 border-green-400/30',
                icon: isLate ? AlertCircle : CheckCircle
            };
        }

        return {
            label: isOverdue ? 'Overdue' : 'Pending',
            color: isOverdue ? 'text-red-500' : 'text-yellow-500',
            bgColor: isOverdue ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30',
            icon: Clock
        };
    };

    if (loading) return <div className="text-white text-center py-20">Loading assignments...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">{isTutor ? 'Managed Assignments' : 'My Assignments'}</h1>
                    <p className="text-gray-400 mt-2">
                        {isTutor ? 'Track submissions and grade student work.' : 'Track your deadlines and submit your work.'}
                    </p>
                </div>
                {isTutor && (
                    <p className="text-sm text-gray-400 mb-1">
                        Showing assignments from all your courses
                    </p>
                )}
            </div>

            <div className="grid gap-6">
                {assignments.length > 0 ? (
                    assignments.map(assignment => {
                        const status = getStatusInfo(assignment);
                        const Icon = status.icon;
                        
                        return (
                            <Link 
                                key={assignment._id}
                                to={`/assignments/${assignment._id}`}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-xl ${status.bgColor} border`}>
                                        <FileText className={`w-8 h-8 ${status.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{assignment.title}</h3>
                                        <p className="text-gray-400 text-sm mt-1">{assignment.course_id?.title}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                Due: {new Date(assignment.deadline).toLocaleDateString()}
                                            </span>
                                            <span className={`flex items-center gap-1.5 text-sm font-medium ${status.color}`}>
                                                <Icon className="w-4 h-4" />
                                                {status.label}
                                            </span>
                                            {isTutor && (
                                                <span className="text-sm text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                                    {assignment.submissionStats?.total || 0} Submissions
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-400 transition-colors" />
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h2 className="text-xl font-semibold text-gray-400">No assignments found</h2>
                        <p className="text-gray-500">
                            {isTutor ? 'You haven\'t created any assignments yet.' : 'Check back later for new academic tasks.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assignments;
