import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { User, Mail, Save, Edit2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.profile_data?.bio || '',
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
        profile_data: { bio: formData.bio }
      });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1118] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
              <div className="w-32 h-32 bg-[#0f1118] rounded-full p-2">
                <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {isEditing ? 'Cancel' : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                  <div className="flex items-center bg-black/20 border border-gray-700 rounded-lg px-4 py-3">
                    <User className="w-5 h-5 text-gray-500 mr-3" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-transparent w-full focus:outline-none text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                  <div className="flex items-center bg-black/20 border border-gray-700 rounded-lg px-4 py-3">
                    <Mail className="w-5 h-5 text-gray-500 mr-3" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-transparent w-full focus:outline-none text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none text-white h-32 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">{user?.name}</h1>
                  <span className="text-blue-400 text-sm font-medium px-2 py-1 bg-blue-400/10 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {user?.profile_data?.bio || 'No bio yet.'}
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
