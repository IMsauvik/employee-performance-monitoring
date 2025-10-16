import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, LogOut, Menu, X, Bell, User } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNotifications } from '../../hooks/useTaskComments';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/amwoodo-logo.png';
import BlockerTaskModal from './BlockerTaskModal';
import DependencyTaskDetailModal from './DependencyTaskDetailModal';
import { db } from '../../services/databaseService';

const Header = ({ title, navigation }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [selectedDependencyTaskId, setSelectedDependencyTaskId] = useState(null);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(currentUser?.id);

  const activeNav = useMemo(() => {
    return navigation?.find(item => location.pathname === item.path);
  }, [navigation, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 bg-white">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white border-2 border-yellow-400 rounded-lg shadow-lg">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="ml-3 flex items-center">
                <img src={logo} alt="Amwoodo Logo" className="h-8 w-auto object-contain" />
              </span>
            </div>

            {/* Desktop Navigation */}
            {navigation && (
              <nav className="hidden md:ml-10 md:flex md:space-x-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-yellow-50 text-yellow-700 font-semibold'
                        : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                      {item.name}
                    </div>
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.slice(0, 10).map(notif => (
                        <div
                          key={notif.id}
                          onClick={async () => {
                            markAsRead(notif.id);
                            if (notif.type === 'dependency_assigned' || notif.type === 'dependency_status_change') {
                              // This is a dependency task notification
                              setSelectedDependencyTaskId(notif.taskId);
                              setShowDependencyModal(true);
                              setShowNotifications(false);
                            } else if (notif.taskId) {
                              // Check if it's a dependency task ID or regular task ID
                              try {
                                const isDependencyTask = await db.getDependencyTask(notif.taskId);
                                if (isDependencyTask) {
                                  setSelectedDependencyTaskId(notif.taskId);
                                  setShowDependencyModal(true);
                                } else {
                                  setSelectedTaskId(notif.taskId);
                                  setShowBlockerModal(true);
                                }
                              } catch (error) {
                                console.error('Error checking task type:', error);
                                setSelectedTaskId(notif.taskId);
                                setShowBlockerModal(true);
                              }
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                            !notif.read ? 'bg-accent-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              !notif.read ? 'bg-accent-600' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1">
                              <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                              {notif.taskId && (
                                <p className="text-xs text-yellow-600 mt-1 font-medium">
                                  Click to view task and respond
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <span className="text-gray-900 font-bold text-lg">
                  {currentUser?.name?.charAt(0)}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="ml-4 p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
              title="Edit Profile"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navigation && (
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-yellow-50 text-gray-900 font-semibold'
                        : 'text-gray-700 hover:bg-yellow-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                      {item.name}
                    </div>
                  </button>
                ))}
              </nav>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Blocker Task Modal */}
      {showBlockerModal && selectedTaskId && (
        <BlockerTaskModal
          taskId={selectedTaskId}
          onClose={() => {
            setShowBlockerModal(false);
            setSelectedTaskId(null);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Dependency Task Modal */}
      {showDependencyModal && selectedDependencyTaskId && (
        <DependencyTaskDetailModal
          dependencyTaskId={selectedDependencyTaskId}
          onClose={() => {
            setShowDependencyModal(false);
            setSelectedDependencyTaskId(null);
          }}
          currentUser={currentUser}
        />
      )}
    </header>
  );
};

export default Header;
