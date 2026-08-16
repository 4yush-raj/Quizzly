const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { store, nextId } = require('../store/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'quizzly_super_secret_jwt_key_2026';

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// REGISTER STUDENT
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check Prisma DB first if available
    let existingUser = null;
    if (prisma) {
      try {
        existingUser = await prisma.user.findUnique({ where: { email: emailLower } });
      } catch (e) {
        console.error('Prisma findUnique check error:', e);
      }
    }

    if (!existingUser) {
      existingUser = store.users.find((u) => u.email.toLowerCase() === emailLower);
    }

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = null;

    if (prisma) {
      try {
        newUser = await prisma.user.create({
          data: {
            name,
            email: emailLower,
            password: hashedPassword,
            role: 'STUDENT',
            status: 'ACTIVE'
          }
        });
      } catch (e) {
        console.error('Prisma User Create Error:', e);
      }
    }

    if (!newUser) {
      newUser = {
        id: nextId.users++,
        name,
        email: emailLower,
        password: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      store.users.push(newUser);
    }

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

// LOGIN USER (Admin or Student)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const emailLower = email.toLowerCase().trim();
    let user = null;

    if (prisma) {
      try {
        user = await prisma.user.findUnique({ where: { email: emailLower } });
      } catch (e) {
        console.error('Prisma login error:', e);
      }
    }

    if (!user) {
      user = store.users.find((u) => u.email.toLowerCase() === emailLower);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'DEACTIVATED') {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// GET CURRENT LOGGED IN USER
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    let user = null;

    if (prisma) {
      try {
        if (userId) {
          user = await prisma.user.findUnique({ where: { id: userId } });
        }
        if (!user && userEmail) {
          user = await prisma.user.findUnique({ where: { email: userEmail.toLowerCase() } });
        }
      } catch (e) {
        console.error('Prisma getMe Error:', e);
      }
    }

    if (!user) {
      user = store.users.find((u) => u.id === userId || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase()));
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
};

// FORGOT / RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Please provide email and new password.' });
    }

    const emailLower = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let updated = false;

    if (prisma) {
      try {
        await prisma.user.update({
          where: { email: emailLower },
          data: { password: hashedPassword }
        });
        updated = true;
      } catch (e) {
        console.error('Prisma resetPassword Error:', e);
      }
    }

    if (!updated) {
      const u = store.users.find((user) => user.email.toLowerCase() === emailLower);
      if (u) {
        u.password = hashedPassword;
        updated = true;
      }
    }

    if (!updated) {
      return res.status(404).json({ error: 'No user account found with that email.' });
    }

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  resetPassword
};
