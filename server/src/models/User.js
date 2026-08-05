const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Minimal user schema - this backend exists ONLY to mock authentication,
 * per the assignment spec ("used only to mock authentication"). Character
 * data is never stored here.
 */
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

/**
 * Ensures the hardcoded demo user (e.g. admin/password123) exists in Mongo
 * on server boot. Idempotent - safe to call every startup. Passwords are
 * bcrypt-hashed before storage; they are never persisted in plaintext even
 * though they originate from a hardcoded .env value for this demo.
 */
async function ensureSeedUser({ username, password }) {
  const existing = await User.findOne({ username });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await User.create({ username, passwordHash });
  // eslint-disable-next-line no-console
  console.log(`[seed] Created demo user "${username}"`);
  return created;
}

module.exports = { User, ensureSeedUser };
