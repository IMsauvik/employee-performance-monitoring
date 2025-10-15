import { useState, useEffect } from 'react';
import { Users, Search, TrendingUp, CheckCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import Header from '../common/Header';
import { LayoutDashboard, ListTodo, Users as UsersIcon } from 'lucide-react';
import { db } from '../../services/databaseService';
import { useTasks } from '../../hooks/useTasks';
import { calculatePerformanceMetrics } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/manager/tasks', icon: ListTodo },
    { name: 'Employees', path: '/manager/employees', icon: UsersIcon },
    { name: 'Analytics', path: '/manager/analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const allUsers = await db.getUsers();
        const employeeList = allUsers.filter(u => u.role === 'employee');
        setEmployees(employeeList);
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]);
      }
    };
    loadEmployees();
  }, []);

  const getEmployeeTasks = (employeeId) => {
    return tasks.filter(t => t.assignedTo === employeeId);
  };

  const getEmployeeMetrics = (employeeId) => {
    const employeeTasks = getEmployeeTasks(employeeId);
    return calculatePerformanceMetrics(employeeTasks);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Employees" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Team Members
          </h1>
          <p className="mt-2 text-gray-600">View and manage your team's performance</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => {
            const metrics = getEmployeeMetrics(employee.id);
            return (
              <div key={employee.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 border border-gray-100">
                {/* Employee Header */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {employee.name.charAt(0)}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.department}</p>
                    <p className="text-xs text-gray-500">{employee.email}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-900">{metrics.totalTasks}</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">Total Tasks</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-900">{metrics.completedTasks}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">Completed</p>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-2xl font-bold text-yellow-900">{metrics.inProgressTasks}</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">In Progress</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-900">{metrics.completionRate}%</span>
                    </div>
                    <p className="text-xs text-purple-700 mt-1">Completion</p>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => navigate('/manager/dashboard')}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
                >
                  View Tasks
                </button>
              </div>
            );
          })}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Users className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No employees found</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeesList;
