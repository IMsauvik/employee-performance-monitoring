import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Shield, Target, Plus, Filter, Search, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import { storage } from '../../utils/storage';
import { goalCategories, goalCycles } from '../../data/goalsData';

const AdminGoalsPage = () => {
  const { currentUser } = useAuth();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals(currentUser?.id, currentUser?.role);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('Q4-2025');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'objective',
    category: 'company',
    specificCategory: 'customer_success',
    level: 'company',
    cycle: 'Q4-2025',
    startDate: '',
    dueDate: '',
    assignedTo: [],
    priority: 'medium'
  });

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Goals', path: '/admin/goals', icon: Target },
    { name: 'Settings', path: '/admin/settings', icon: Shield }
  ];

  useEffect(() => {
    const fetchEmployees = () => {
      try {
        const allUsers = storage.getUsers() || [];
        const employeesList = allUsers.filter(user => user.role === 'employee');
        setEmployees(employeesList);
        setLoading(false);
      } catch (error) {
        console.error('Error loading employees:', error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.description) {
      alert('Please fill in all required fields');
      return;
    }

    const goalData = {
      ...newGoal,
      owner: currentUser.id,
      status: 'not_started',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    addGoal(goalData);
    setShowAddModal(false);
    setNewGoal({
      title: '',
      description: '',
      type: 'objective',
      category: 'company',
      specificCategory: 'customer_success',
      level: 'company',
      cycle: 'Q4-2025',
      startDate: '',
      dueDate: '',
      assignedTo: [],
      priority: 'medium'
    });
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      off_track: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.in_progress;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Goals Management" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Goals Management
            </h1>
            <p className="mt-2 text-gray-600">Create and manage organization-wide goals and OKRs</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Goal
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cycle</label>
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {goalCycles.map((cycle) => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-6">
          {goals
            .filter((goal) => goal.cycle === selectedCycle)
            .map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                    <p className="mt-2 text-gray-600">{goal.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{goal.level}</span>
                  </div>
                  {goal.progress !== undefined && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{goal.progress}% complete</span>
                    </div>
                  )}
                </div>

                {goal.assignedTo.length > 0 && (
                  <div className="mt-4">
                    <div className="flex -space-x-2">
                      {goal.assignedTo.slice(0, 3).map((userId) => {
                        const user = employees.find((emp) => emp.id === userId);
                        return user ? (
                          <div
                            key={userId}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold border-2 border-white"
                            title={user.name}
                          >
                            {user.name.charAt(0)}
                          </div>
                        ) : null;
                      })}
                      {goal.assignedTo.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm font-bold border-2 border-white">
                          +{goal.assignedTo.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </main>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Goal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter goal title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter goal description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="objective">Objective</option>
                    <option value="key_result">Key Result</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={newGoal.level}
                    onChange={(e) => setNewGoal({ ...newGoal, level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="company">Company</option>
                    <option value="team">Team</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newGoal.specificCategory}
                    onChange={(e) => setNewGoal({ ...newGoal, specificCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {goalCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <select
                  multiple
                  value={newGoal.assignedTo}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setNewGoal({ ...newGoal, assignedTo: selected });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGoalsPage;