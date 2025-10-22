import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Briefcase, Building, Phone, MapPin, Calendar, ArrowLeft, Save, X, Camera } from 'lucide-react';
import Header from './Header';
import { storage } from '../../utils/storage';
import db from '../../services/databaseService';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');

  // Determine which user to display/edit
  const [profileUser, setProfileUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  // Load the user data (either from URL param or current user)
  useEffect(() => {
    const loadUserData = async () => {
      let userToDisplay = currentUser;

      // If userId is provided in URL, load that user's data
      if (userIdFromUrl && currentUser?.role === 'admin') {
        try {
          const users = await db.getUsers();
          const foundUser = users.find(u => u.id === userIdFromUrl);
          if (foundUser) {
            userToDisplay = foundUser;
          } else {
            toast.error('User not found');
            navigate('/admin/users');
            return;
          }
        } catch (error) {
          console.error('Error loading user:', error);
          toast.error('Failed to load user data');
        }
      }

      setProfileUser(userToDisplay);
      setFormData({
        name: userToDisplay?.name || '',
        email: userToDisplay?.email || '',
        department: userToDisplay?.department || '',
        phone: userToDisplay?.phone || '',
        address: userToDisplay?.address || '',
        password: '',
        confirmPassword: ''
      });
    };

    loadUserData();
  }, [userIdFromUrl, currentUser, navigate]);

  const navigation = currentUser?.role === 'admin'
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: User },
        { name: 'Users', path: '/admin/users', icon: User },
      ]
    : currentUser?.role === 'manager'
    ? [
        { name: 'Dashboard', path: '/manager/dashboard', icon: User },
        { name: 'Tasks', path: '/manager/tasks', icon: User },
      ]
    : [
        { name: 'My Tasks', path: '/employee/dashboard', icon: User },
        { name: 'Performance', path: '/employee/performance', icon: User },
      ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!profileUser) return;

    // Validate passwords if they're being changed
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match!');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters!');
        return;
      }
    }

    try {
      // Prepare updated user data
      const updatedUserData = {
        ...profileUser,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        phone: formData.phone,
        address: formData.address,
        ...(formData.password && { password: formData.password })
      };

      // Update user in database
      await db.updateUser(profileUser.id, updatedUserData);

      // Update local profileUser state
      setProfileUser(updatedUserData);

      // Re-login ONLY if editing own profile
      if (profileUser.id === currentUser.id) {
        login(formData.email, formData.password || currentUser.password);
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);

      // Clear password fields
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileUser?.name || '',
      email: profileUser?.email || '',
      department: profileUser?.department || '',
      phone: profileUser?.phone || '',
      address: profileUser?.address || '',
      password: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'from-danger-500 to-danger-600';
      case 'manager':
        return 'from-accent-500 to-accent-600';
      case 'employee':
        return 'from-success-500 to-success-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-danger-100 text-danger-800';
      case 'manager':
        return 'bg-accent-100 text-accent-800';
      case 'employee':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state while profileUser is being loaded
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="User Profile" navigation={navigation} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors animate-fadeIn"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-slideIn">
          {/* Header Section with Gradient */}
          <div className={`h-32 bg-gradient-to-r ${getRoleColor(profileUser?.role)} relative`}>
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${getRoleColor(profileUser?.role)} flex items-center justify-center`}>
                    <span className="text-white text-4xl font-bold">
                      {profileUser?.name?.charAt(0)}
                    </span>
                  </div>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileUser?.name}</h1>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(profileUser?.role)} capitalize`}>
                  {profileUser?.role}
                </span>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <User className="w-5 h-5 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{profileUser?.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{profileUser?.email}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <Building className="w-4 h-4 mr-2 text-gray-500" />
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{profileUser?.department || 'Not specified'}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{profileUser?.phone || 'Not specified'}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    placeholder="Full Address"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{profileUser?.address || 'Not specified'}</p>
                )}
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  Member Since
                </label>
                <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">
                  {profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Password Change Section (Only in Edit Mode) */}
            {isEditing && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Password must be at least 6 characters long
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="font-mono text-gray-900">{profileUser?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Status:</span>
              <span className="px-3 py-1 bg-success-100 text-success-800 rounded-full font-semibold">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Login:</span>
              <span className="text-gray-900">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
