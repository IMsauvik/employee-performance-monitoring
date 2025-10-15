const bcrypt = require('bcrypt');

// Demo user passwords
const passwords = {
  'admin@demo.com': 'admin123',
  'manager@demo.com': 'manager123',
  'alice@demo.com': 'employee123',
  'bob@demo.com': 'employee123',
};

// Function to hash all passwords
async function hashPasswords() {
  console.log('🔐 Hashing passwords for demo users...\n');
  console.log('Copy and paste these SQL commands into Supabase SQL Editor:\n');
  console.log('-- ========================================');
  console.log('-- Update Demo User Passwords (Hashed)');
  console.log('-- ========================================\n');

  for (const [email, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`-- ${email} (password: ${password})`);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${email}';\n`);
  }

  console.log('-- ========================================');
  console.log('✅ Done! Run these SQL commands in Supabase.');
}

// Run the script
hashPasswords().catch(console.error);
