import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { LogIn, Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Student");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password, role);
            }
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Authentication failed");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-[#0073b0] to-black p-4">
            <div className="w-full max-w-md p-8 border shadow-2xl bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl">
                <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-full bg-gradient-to-r from-black-500 to-blue-500">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="mb-8 text-3xl font-bold text-center text-white">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>

                {error && (
                    <div className="p-3 mb-4 text-center text-red-100 border border-red-500 rounded-lg bg-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 text-white placeholder-gray-500 transition-all border border-gray-600 rounded-lg bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your name"
                                    required={!isLogin}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-3 text-white transition-all border border-gray-600 rounded-lg cursor-pointer bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Tutor">Tutor</option>
                                </select>
                            </div>
                        </>
                    )}
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
                    <div className="relative">
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 text-white placeholder-gray-500 transition-all border border-gray-600 rounded-lg bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute text-gray-400 transform -translate-y-1/2 cursor-pointer right-3 top-1/2 hover:text-gray-300 focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                        {isLogin ? "Sign In" : "Sign Up"}
                    </button>
                </form>
                <div className="mt-6 text-sm text-center text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="p-0 font-medium text-blue-400 underline transition-colors bg-transparent border-none cursor-pointer hover:text-blue-300"
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
