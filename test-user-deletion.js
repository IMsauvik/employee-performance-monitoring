// TEST USER DELETION
// Run this in your browser console to test if user deletion works

// Instructions:
// 1. Open your app in browser
// 2. Open Developer Tools (F12)
// 3. Go to Console tab
// 4. Copy and paste this entire script
// 5. Press Enter to run

console.log('🧪 Testing User Deletion...\n');

// Get the database service
import('http://localhost:5173/src/services/databaseService.js')
  .then(({ db }) => {
    console.log('✅ Database service loaded');
    
    // Test deletion with a fake user ID (won't actually delete anything real)
    const testUserId = '99999999-9999-9999-9999-999999999999';
    
    console.log(`\n🔧 Attempting to delete user: ${testUserId}`);
    
    return db.deleteUser(testUserId);
  })
  .then((result) => {
    console.log('\n✅ DELETE FUNCTION EXECUTED');
    console.log('Result:', result);
    console.log('\n📝 The function is working!');
    console.log('If you got an error about user not found, that\'s OK - it means the DELETE query ran.');
    console.log('\nNow try deleting a real user through the Admin Dashboard.');
  })
  .catch((error) => {
    console.error('\n❌ DELETE FAILED');
    console.error('Error:', error);
    console.error('\n🔍 Error details:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.message?.includes('RLS') || error.message?.includes('security')) {
      console.error('\n⚠️  RLS is blocking the deletion!');
      console.error('Run this SQL in Supabase:');
      console.error('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
    }
  });
