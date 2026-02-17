import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../API/api";
import { CheckCircle, AlertCircle } from "lucide-react";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/verify-email", { email, otp });
      setMessage("Email verified successfully! Redirecting...");

      // If token returned, login?
      if (data.token) {
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload(); // To update AuthContext
        }, 1500);
      } else {
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    try {
      await api.post("/auth/resend-otp", { email });
      setMessage("OTP resent successfully. Check your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Resend failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-[#0073b0] to-black p-4">
      <div className="w-full max-w-md p-8 border shadow-2xl bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-center text-white">
          Verify Your Email
        </h2>
        <p className="mb-8 text-center text-gray-300">
          We sent a verification code to <br />
          <span className="font-bold text-white">{email || "your email"}</span>
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-red-100 border border-red-500 rounded-lg bg-red-500/20">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 p-3 mb-4 text-green-100 border border-green-500 rounded-lg bg-green-500/20">
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!location.state?.email && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-white placeholder-gray-500 transition-all border border-gray-600 rounded-lg bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          )}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Verification Code (OTP)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 text-xl tracking-widest text-center text-white placeholder-gray-500 transition-all border border-gray-600 rounded-lg bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            className="text-sm text-blue-400 underline transition-colors hover:text-blue-300"
          >
            Resend Code
          </button>
          <div className="mt-4">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
