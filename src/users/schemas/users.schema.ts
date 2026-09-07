import { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('save', async function () {
  try {
    const password = this.get('password');

    if (typeof password !== 'string' || !this.isModified('password')) {
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    this.set('password', hashedPassword);
  } catch {
    throw new Error('Error hashing password');
  }
});
