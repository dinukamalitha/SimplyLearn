import { useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { User, Mail, Save, Edit2 } from "lucide-react";

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.profile_data?.bio || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        profile_data: { bio: formData.bio },
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1118] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="overflow-hidden border bg-white/5 border-white/10 rounded-2xl">
          <div className="h-32 bg-linear-to-r from-blue-600 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="relative flex items-end justify-between mb-6 -mt-16">
              <div className="w-32 h-32 bg-[#0f1118] rounded-full p-2">
                <div className="flex items-center justify-center w-full h-full text-4xl font-bold bg-gray-700 rounded-full">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
              >
                {isEditing ? (
                  "Cancel"
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Full Name
                  </label>
                  <div className="flex items-center px-4 py-3 border border-gray-700 rounded-lg bg-black/20">
                    <User className="w-5 h-5 mr-3 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full text-white bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Email Address
                  </label>
                  <div className="flex items-center px-4 py-3 border border-gray-700 rounded-lg bg-black/20">
                    <Mail className="w-5 h-5 mr-3 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full text-white bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full h-32 px-4 py-3 text-white border border-gray-700 rounded-lg resize-none bg-black/20 focus:outline-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 font-bold text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">{user?.name}</h1>
                  <span className="px-2 py-1 text-sm font-medium text-blue-400 rounded-full bg-blue-400/10">
                    {user?.role}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-xl">
                  <h3 className="mb-2 text-lg font-semibold">About</h3>
                  <p className="leading-relaxed text-gray-300">
                    {user?.profile_data?.bio || "No bio yet."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
