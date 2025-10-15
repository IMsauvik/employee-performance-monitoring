import { useState, useEffect } from 'react';
import { LayoutDashboard, ListTodo, Users as UsersIcon, Plus, BarChart3 } from 'lucide-react';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { db } from '../../services/databaseService';
import TasksTable from './TasksTable';
import AssignTaskModal from './AssignTaskModal';
import LoadingSpinner from '../common/LoadingSpinner';
import { SkeletonTable } from '../common/SkeletonCard';
import ExportMenu from '../common/ExportMenu';
import { exportTasks } from '../../utils/exportUtils';

const TasksListPage = () => {
  const { currentUser } = useAuth();
  const { tasks, addTask, updateTask, deleteTask, refreshTasks } = useTasks();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    employee: 'all',
    project: 'all',
    vertical: 'all'
  });
  const [showAssignModal, setShowAssignModal] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/manager/tasks', icon: ListTodo },
    { name: 'Employees', path: '/manager/employees', icon: UsersIcon },
    { name: 'Analytics', path: '/manager/analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allUsers = await db.getUsers();
        const employeeList = allUsers.filter(u => u.role === 'employee');
        setEmployees(employeeList);
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.employee !== 'all' && task.assignedTo !== filters.employee) return false;
    if (filters.project !== 'all' && task.project !== filters.project) return false;
    if (filters.vertical !== 'all' && task.vertical !== filters.vertical) return false;
    return true;
  });

  const uniqueProjects = [...new Set(tasks.map(t => t.project))];
  const uniqueVerticals = [...new Set(tasks.map(t => t.vertical))];

  const handleAssignTask = async (taskData) => {
    try {
      const createdTask = await addTask(taskData);
      setShowAssignModal(false);
      await refreshTasks();
      return createdTask; // Return the created task so AssignTaskModal can use the ID
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error; // Re-throw so AssignTaskModal can handle it
    }
  };

  const handleExport = (format) => {
    exportTasks(filteredTasks, format);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="All Tasks" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent hover-lift">
            Task Management
          </h1>
          <p className="mt-2 text-gray-600 animate-slideIn">View and manage all tasks across your team</p>
        </div>

        {/* Filters and Assign Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="blocked">Blocked</option>
              </select>

              <select
                value={filters.employee}
                onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>

              <select
                value={filters.vertical}
                onChange={(e) => setFilters({ ...filters, vertical: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                <option value="all">All Verticals</option>
                {uniqueVerticals.map(vertical => (
                  <option key={vertical} value={vertical}>{vertical}</option>
                ))}
              </select>

              <select
                value={filters.project}
                onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              >
                <option value="all">All Projects</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <ExportMenu
                data={filteredTasks}
                onExport={handleExport}
                type="tasks"
              />
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center justify-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap transform hover:-translate-y-1 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Assign New Task
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        {loading ? (
          <SkeletonTable rows={8} />
        ) : (
          <TasksTable
            tasks={filteredTasks}
            employees={employees}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}
      </main>

      {/* Assign Task Modal */}
      {showAssignModal && (
        <AssignTaskModal
          employees={employees}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignTask}
        />
      )}
    </div>
  );
};

export default TasksListPage;
