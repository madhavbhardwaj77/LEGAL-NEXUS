const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nyaya-setu';

async function showUsers() {
  try {
    await mongoose.connect(mongoUri);
    console.log(`\nConnected to MongoDB: ${mongoUri}\n`);

    const users = await mongoose.connection.db.collection('users').find({}, { projection: { passwordHash: 0 } }).toArray();
    
    if (users.length === 0) {
      console.log('No users found in database yet. Sign up on the frontend to create a user!\n');
    } else {
      console.log(`Found ${users.length} registered user(s):\n`);
      console.table(users.map(u => ({
        ID: u._id.toString(),
        Email: u.email,
        Role: u.role,
        Active: u.isActive,
        Verified: u.isVerified,
        Created: u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'
      })));
    }
  } catch (err) {
    console.error('Error fetching users:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

showUsers();
