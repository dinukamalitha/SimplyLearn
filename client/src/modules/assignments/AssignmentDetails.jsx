import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../API/api";
import AuthContext from "../../context/AuthContext";
import {
  Save,
  CheckCircle,
  Upload,
  AlertCircle,
  File,
  Download,
  Clock,
} from "lucide-react";

const AssignmentHeader = ({
  assignment,
  id,
  isOverdue,
  deadline,
  submission,
}) => (
  <div className="p-8 mb-8 border bg-white/5 border-white/10 rounded-2xl">
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">{assignment.title}</h1>
        <p className="text-gray-400">Assignment ID: {id}</p>
      </div>
      <div className="text-right">
        <div
          className={`text-sm font-bold px-3 py-1 rounded-full mb-2 ${isOverdue ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
        >
          {isOverdue ? "Overdue" : "Active"}
        </div>
        <p className="text-2xl font-bold">
          {assignment.max_points}{" "}
          <span className="text-sm text-gray-500">pts</span>
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 py-6 mb-6 border-y border-white/10">
      <div>
        <p className="mb-1 text-xs font-bold text-gray-500 uppercase">
          Due Date
        </p>
        <p className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          {deadline.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-gray-500 uppercase">Status</p>
        <p
          className={
            submission
              ? "text-green-400"
              : isOverdue
                ? "text-red-500"
                : "text-yellow-500"
          }
        >
          {submission ? "Submitted" : isOverdue ? "Missing" : "Pending"}
        </p>
      </div>
    </div>

    <div className="prose prose-invert max-w-none">
      <h3 className="mb-2 text-lg font-semibold">Instructions</h3>
      <p className="text-gray-300 whitespace-pre-line">
        {assignment.instructions}
      </p>
    </div>
  </div>
);

const StudentSubmissionView = ({
  submission,
  assignment,
  deadline,
  isOverdue,
  textEntry,
  setTextEntry,
  file,
  handleFileChange,
  handleSubmit,
  submitting,
  setSubmission,
}) => (
  <div
    className={`bg-white/5 border rounded-2xl p-8 ${submission ? "border-green-500/30" : isOverdue ? "border-red-500/30" : "border-white/10"}`}
  >
    <h2 className="mb-6 text-2xl font-bold">Your Submission</h2>
    {submission ? (
      <div className="space-y-6">
        {new Date(submission.submission_date) > deadline ? (
          <div className="flex items-center gap-3 p-4 text-red-400 border rounded-lg bg-red-500/10 border-red-500/30">
            <AlertCircle className="w-5 h-5" />
            <span>
              Submitted Late on{" "}
              {new Date(submission.submission_date).toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 text-green-400 border rounded-lg bg-green-500/10 border-green-500/30">
            <CheckCircle className="w-5 h-5" />
            <span>
              Submitted on{" "}
              {new Date(submission.submission_date).toLocaleString()}
            </span>
          </div>
        )}

        {submission.grade != null && (
          <div className="p-6 border bg-blue-500/10 border-blue-500/30 rounded-xl">
            <h4 className="mb-2 text-lg font-bold text-blue-200">
              Feedback & Grade
            </h4>
            <p className="mb-2 text-3xl font-bold text-white">
              {submission.grade}{" "}
              <span className="text-sm text-blue-400">
                / {assignment.max_points}
              </span>
            </p>
            {submission.feedback && (
              <p className="italic text-gray-300">"{submission.feedback}"</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {submission.file_url && (
            <div className="p-4 border bg-black/20 rounded-xl border-white/5">
              <p className="mb-2 text-xs font-bold text-gray-500 uppercase">
                Attached File
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-blue-400" />
                  <span className="text-sm truncate max-w-[150px]">
                    {submission.file_url.split("/").pop()}
                  </span>
                </div>
                <a
                  href={`http://localhost:8080${submission.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-blue-400 transition-colors rounded-lg hover:bg-white/10"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
          <div className="p-4 border bg-black/20 rounded-xl border-white/5">
            <p className="mb-2 text-xs font-bold text-gray-500 uppercase">
              Text Entry
            </p>
            <p className="text-sm italic text-gray-300">
              {submission.text_entry || "No text provided"}
            </p>
          </div>
        </div>

        {!submission.grade && (
          <button
            onClick={() => setSubmission(null)}
            className="text-sm text-gray-500 underline transition-colors hover:text-white"
          >
            Resubmit Assignment
          </button>
        )}
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-400">
            Text Content
          </label>
          <textarea
            value={textEntry}
            onChange={(e) => setTextEntry(e.target.value)}
            className="w-full h-32 p-4 text-white transition-all border border-gray-600 bg-black/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your summary or answer here..."
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-400">
            Upload File (PDF, DOC, ZIP, PPTX)
          </label>
          <div className="relative group">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-8 text-center transition-colors border-2 border-gray-600 border-dashed rounded-xl group-hover:border-blue-500 bg-black/10">
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500 group-hover:text-blue-400" />
              <p className="text-gray-400">
                {file ? file.name : "Click or drag file to upload"}
              </p>
              <p className="mt-2 text-xs text-gray-600">
                Maximum file size: 10MB
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] ${isOverdue ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {submitting
            ? "Submitting..."
            : isOverdue
              ? "Submit Late"
              : "Submit Assignment"}
        </button>
      </form>
    )}
  </div>
);

const TutorSubmissionView = ({
  submissions,
  assignment,
  deadline,
  handleGrade,
}) => (
  <div className="p-8 border bg-white/5 border-white/10 rounded-2xl">
    <h2 className="mb-6 text-2xl font-bold">
      Submissions ({submissions.length})
    </h2>
    <div className="space-y-4">
      {submissions.map((sub) => {
        const subDate = new Date(sub.submission_date);
        const isLate = subDate > deadline;

        return (
          <div
            key={sub._id}
            className="p-6 border bg-black/20 rounded-xl border-white/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold">
                  {sub.student_id?.name || "Unknown Student"}
                </h4>
                <p
                  className={`text-xs font-bold ${isLate ? "text-red-400" : "text-green-400"}`}
                >
                  {isLate ? "LATE SUBMISSION" : "ON TIME"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Date: {subDate.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                {sub.grade != null ? (
                  <span className="text-xl font-bold text-green-400">
                    {sub.grade} / {assignment.max_points}
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs italic text-yellow-400 rounded bg-yellow-400/10">
                    Pending Grade
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              {sub.file_url && (
                <a
                  href={`http://localhost:8080${sub.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download {sub.file_url.split(".").pop().toUpperCase()}
                </a>
              )}
            </div>

            {sub.text_entry && (
              <div className="p-4 mb-4 text-sm italic text-gray-300 border-l-2 border-gray-600 rounded-lg bg-white/5">
                "{sub.text_entry}"
              </div>
            )}

            <div className="flex items-end gap-4 p-4 border bg-black/20 rounded-xl border-white/5">
              <div className="w-32">
                <label className="block mb-1 text-xs text-gray-500">
                  Score
                </label>
                <input
                  type="number"
                  placeholder="0"
                  defaultValue={sub.grade}
                  id={`grade-${sub._id}`}
                  max={assignment.max_points}
                  className="w-full px-3 py-2 text-white border rounded bg-black/40 border-white/10"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-xs text-gray-500">
                  Feedback
                </label>
                <input
                  type="text"
                  placeholder="Write comments for the student..."
                  defaultValue={sub.feedback}
                  id={`feedback-${sub._id}`}
                  className="w-full px-3 py-2 text-white border rounded bg-black/40 border-white/10"
                />
              </div>
              <button
                onClick={() => {
                  const grade = document.getElementById(
                    `grade-${sub._id}`,
                  ).value;
                  const feedback = document.getElementById(
                    `feedback-${sub._id}`,
                  ).value;
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
);

const AssignmentDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]); // For tutors
  const [textEntry, setTextEntry] = useState("");
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

      if (user.role === "Student") {
        const subRes = await api.get(`/submissions/my/${id}`);
        setSubmission(subRes.data);
        if (subRes.data) setTextEntry(subRes.data.text_entry || "");
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
    formData.append("assignment_id", id);
    formData.append("text_entry", textEntry);
    if (file) formData.append("file", file);

    try {
      await api.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Submitted successfully!");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Submission failed");
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
      alert("Grading failed");
    }
  };

  if (loading)
    return <div className="py-20 text-center text-white">Loading...</div>;
  if (!assignment)
    return (
      <div className="py-20 text-center text-white">Assignment not found</div>
    );

  const isTutor = user.role !== "Student";
  const deadline = new Date(assignment.deadline);
  const now = new Date();
  const isOverdue = now > deadline;

  return (
    <div className="max-w-4xl p-8 mx-auto text-white">
      <Link
        to="/assignments"
        className="inline-block mb-6 text-blue-400 hover:underline"
      >
        ← Back to Assignments
      </Link>

      <AssignmentHeader
        assignment={assignment}
        id={id}
        isOverdue={isOverdue}
        deadline={deadline}
        submission={submission}
      />

      {!isTutor && (
        <StudentSubmissionView
          submission={submission}
          assignment={assignment}
          deadline={deadline}
          isOverdue={isOverdue}
          textEntry={textEntry}
          setTextEntry={setTextEntry}
          file={file}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          submitting={submitting}
          setSubmission={setSubmission}
        />
      )}

      {isTutor && (
        <TutorSubmissionView
          submissions={submissions}
          assignment={assignment}
          deadline={deadline}
          handleGrade={handleGrade}
        />
      )}
    </div>
  );
};

export default AssignmentDetails;
