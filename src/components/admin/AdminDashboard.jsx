import { useState, useEffect } from 'react';
import { Users, LayoutDashboard, UserPlus, Edit, Trash2, Shield, Search, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { calculatePerformanceMetrics } from '../../utils/helpers';
import AddUserModal from './AddUserModal';
import ExportMenu from '../common/ExportMenu';
import { exportUsers } from '../../utils/exportUtils';
import db from '../../services/databaseService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    managers: 0,
    employees: 0,
    totalTasks: 0
  });

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Performance', path: '/admin/performance', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Shield }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const metrics = calculatePerformanceMetrics(tasks);
    setStats({
      totalUsers: users.length,
      managers: users.filter(u => u.role === 'manager').length,
      employees: users.filter(u => u.role === 'employee').length,
      totalTasks: metrics.totalTasks
    });
  }, [users, tasks]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await db.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const newUser = await db.createUser(userData);
      toast.success(`User ${newUser.name} added successfully!`);
      await loadUsers();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding user:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('A user with this email already exists');
      } else {
        toast.error('Failed to add user. Please try again.');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      toast.error('You cannot delete your own account!');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await db.deleteUser(userId);
        toast.success('User deleted successfully');
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleExport = (format) => {
    exportUsers(filteredUsers, format);
  };

  const filteredUsers = users.filter(user => {
    if (!user || !user.name || !user.email) return false;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Admin Dashboard" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-800 hover-lift">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="mt-2 text-gray-600 animate-slideIn">Manage your organization's users and system settings</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-blue-100" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-blue-600 animate-number">{stats.totalUsers}</p>
              </div>
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center animate-float">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-purple-100" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Managers</p>
                <p className="text-3xl font-bold text-purple-600 animate-number">{stats.managers}</p>
              </div>
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center animate-float">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-green-100" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Employees</p>
                <p className="text-3xl font-bold text-green-600 animate-number">{stats.employees}</p>
              </div>
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center animate-float">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-orange-100" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-orange-600 animate-number">{stats.totalTasks}</p>
              </div>
              <div className="w-14 h-14 bg-gray-800/30 backdrop-blur rounded-xl flex items-center justify-center animate-float">
                <LayoutDashboard className="w-7 h-7 text-gray-100" />
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-slideIn hover-lift">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
              <div className="flex gap-3">
                <ExportMenu
                  data={filteredUsers}
                  onExport={handleExport}
                  type="users"
                />
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => navigate(`/profile?userId=${user.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 transition"
                        title="Edit User"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Delete User"
                        disabled={user.id === currentUser.id}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddUser}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
