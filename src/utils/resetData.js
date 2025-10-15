import { demoUsers, demoTasks } from '../data/demoData';

export const resetDemoData = () => {
  // Clear existing data
  localStorage.removeItem('users');
  localStorage.removeItem('tasks');
  localStorage.removeItem('currentUser');

  // Reinitialize with fresh data
  localStorage.setItem('users', JSON.stringify(demoUsers));
  localStorage.setItem('tasks', JSON.stringify(demoTasks));

  console.log('Demo data has been reset successfully!');
  console.log('Available users:', demoUsers.map(u => ({ email: u.email, role: u.role })));
};

// Auto-run on import in development
if (import.meta.env.DEV) {
  window.resetDemoData = resetDemoData;
  console.log('💡 Tip: Run resetDemoData() in console to reset demo data');
}
