import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Shield, Bell, Lock, Globe, Database, Mail, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { exportAllData, backupData, restoreFromBackup, getBackupsList, startAutoBackup, stopAutoBackup } from '../../utils/dataManagement';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const defaultSettings = {
    siteName: 'Amwoodo Performance Monitoring',
    emailNotifications: {
      enabled: true,
      taskUpdates: true,
      performanceReports: true,
      deadlineReminders: true,
      systemAnnouncements: true,
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: true,
        user: '',
        password: ''
      }
    },
    pushNotifications: {
      enabled: true,
      taskUpdates: true,
      performanceReports: true,
      deadlineReminders: true,
      systemAnnouncements: true,
      webPush: {
        vapidKey: '',
        publicKey: '',
        privateKey: ''
      }
    },
    weeklyReports: true,
    autoBackup: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    notificationScheduling: {
      deadlineReminder: 24,
      reportGeneration: '00:00',
      backupTime: '02:00'
    }
  };

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Performance', path: '/admin/performance', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Shield }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="System Settings" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ffde59] to-yellow-500 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="mt-2 text-gray-600">Configure system-wide preferences and security settings</p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-[#ffde59]" />
            Notification Settings
          </h2>

          {/* Email Notifications */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Enable Email Notifications</label>
                  <p className="text-sm text-gray-500">Send notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.emailNotifications.enabled}
                    onChange={(e) => handleSettingChange('emailNotifications', {
                      ...settings.emailNotifications,
                      enabled: e.target.checked
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ffde59]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffde59]"></div>
                </label>
              </div>

              {settings.emailNotifications.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffde59] focus:border-transparent"
                        value={settings.emailNotifications.smtp.host}
                        onChange={(e) => handleSettingChange('emailNotifications', {
                          ...settings.emailNotifications,
                          smtp: { ...settings.emailNotifications.smtp, host: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffde59] focus:border-transparent"
                        value={settings.emailNotifications.smtp.port}
                        onChange={(e) => handleSettingChange('emailNotifications', {
                          ...settings.emailNotifications,
                          smtp: { ...settings.emailNotifications.smtp, port: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#ffde59] focus:ring-[#ffde59] border-gray-300 rounded"
                        checked={settings.emailNotifications.taskUpdates}
                        onChange={(e) => handleSettingChange('emailNotifications', {
                          ...settings.emailNotifications,
                          taskUpdates: e.target.checked
                        })}
                      />
                      <label className="ml-2 text-gray-700">Task Updates</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#ffde59] focus:ring-[#ffde59] border-gray-300 rounded"
                        checked={settings.emailNotifications.performanceReports}
                        onChange={(e) => handleSettingChange('emailNotifications', {
                          ...settings.emailNotifications,
                          performanceReports: e.target.checked
                        })}
                      />
                      <label className="ml-2 text-gray-700">Performance Reports</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#ffde59] focus:ring-[#ffde59] border-gray-300 rounded"
                        checked={settings.emailNotifications.deadlineReminders}
                        onChange={(e) => handleSettingChange('emailNotifications', {
                          ...settings.emailNotifications,
                          deadlineReminders: e.target.checked
                        })}
                      />
                      <label className="ml-2 text-gray-700">Deadline Reminders</label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Enable Push Notifications</label>
                  <p className="text-sm text-gray-500">Send browser push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.pushNotifications.enabled}
                    onChange={(e) => handleSettingChange('pushNotifications', {
                      ...settings.pushNotifications,
                      enabled: e.target.checked
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ffde59]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffde59]"></div>
                </label>
              </div>

              {settings.pushNotifications.enabled && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#ffde59] focus:ring-[#ffde59] border-gray-300 rounded"
                      checked={settings.pushNotifications.taskUpdates}
                      onChange={(e) => handleSettingChange('pushNotifications', {
                        ...settings.pushNotifications,
                        taskUpdates: e.target.checked
                      })}
                    />
                    <label className="ml-2 text-gray-700">Task Updates</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#ffde59] focus:ring-[#ffde59] border-gray-300 rounded"
                      checked={settings.pushNotifications.performanceReports}
                      onChange={(e) => handleSettingChange('pushNotifications', {
                        ...settings.pushNotifications,
                        performanceReports: e.target.checked
                      })}
                    />
                    <label className="ml-2 text-gray-700">Performance Reports</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#ffde59] focus:ring-[#ffde59] border-gray-300 rounded"
                      checked={settings.pushNotifications.deadlineReminders}
                      onChange={(e) => handleSettingChange('pushNotifications', {
                        ...settings.pushNotifications,
                        deadlineReminders: e.target.checked
                      })}
                    />
                    <label className="ml-2 text-gray-700">Deadline Reminders</label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <Globe className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <Bell className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email alerts for important events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Enable browser push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Weekly Reports</p>
                  <p className="text-sm text-gray-600">Receive weekly performance summaries</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.weeklyReports}
                    onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <Lock className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="5"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="30"
                  max="365"
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <Database className="w-6 h-6 text-[#ffde59] mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Automatic Backup</p>
                  <p className="text-sm text-gray-600">Daily automatic data backups</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => {
                      handleSettingChange('autoBackup', e.target.checked);
                      if (e.target.checked) {
                        startAutoBackup(24); // Daily backup
                        toast.success('Automatic daily backups enabled');
                      } else {
                        stopAutoBackup();
                        toast.success('Automatic backups disabled');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ffde59]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffde59]"></div>
                </label>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Recent Backups</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getBackupsList().map((backup, index) => (
                    <div key={backup.timestamp} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(backup.timestamp).toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          if (restoreFromBackup(index)) {
                            toast.success('Backup restored successfully');
                          } else {
                            toast.error('Failed to restore backup');
                          }
                        }}
                        className="text-[#ffde59] hover:text-[#e5c850] font-medium"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (exportAllData()) {
                      toast.success('Data exported successfully');
                    } else {
                      toast.error('Failed to export data');
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-[#ffde59] hover:bg-[#e5c850] text-gray-900 font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Database className="w-5 h-5" />
                  Export All Data
                </button>
                <button
                  onClick={() => {
                    if (backupData()) {
                      toast.success('Backup created successfully');
                    } else {
                      toast.error('Failed to create backup');
                    }
                  }}
                  className="flex-1 px-6 py-3 border-2 border-[#ffde59] hover:bg-[#ffde59]/10 text-gray-900 font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Database className="w-5 h-5" />
                  Backup Now
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>• Backups are stored locally in your browser</p>
                <p>• Only the last 5 backups are kept</p>
                <p>• Export your data regularly for safekeeping</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="fixed bottom-8 right-8">
            <button
              onClick={() => {
                localStorage.setItem('appSettings', JSON.stringify(settings));
                toast.success('Settings saved successfully!');
              }}
              className="px-8 py-3 text-gray-900 font-semibold bg-[#ffde59] hover:bg-[#e5c850] rounded-2xl shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#ffde59]/30 flex items-center"
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
