# Password Hashing Setup

This directory contains scripts to help you setup secure passwords for your demo users.

## Usage

1. **Make sure bcrypt is installed**:

   ```bash
   cd server
   npm install
   ```

2. **Run the password hashing script**:

   ```bash
   node scripts/hash-passwords.js
   ```

3. **Copy the output SQL commands**

4. **Run them in Supabase**:

   - Go to your Supabase project
   - Click "SQL Editor"
   - Click "New query"
   - Paste the SQL commands
   - Click "Run"

5. **Done!** Your demo users now have properly hashed passwords.

## Demo Accounts

After running the script, you can login with:

- **Admin**: admin@demo.com / admin123
- **Manager**: manager@demo.com / manager123
- **Employee 1**: alice@demo.com / employee123
- **Employee 2**: bob@demo.com / employee123

## Security Note

In production, always:

- Use strong, unique passwords
- Never store plain text passwords
- Use bcrypt or similar for hashing
- Implement password reset functionality
