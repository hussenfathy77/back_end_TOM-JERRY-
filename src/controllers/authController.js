const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const login = async (req, res, next) => {
  try {
    const { email, emailAddress, password, rememberMe } = req.body;
    const finalEmail = emailAddress || email;

    // ─── 1. Required Fields Validation ──────────────────────────────────────
    const fieldErrors = {};
    if (!finalEmail || !finalEmail.trim()) {
      fieldErrors.emailAddress = 'Please enter your email address';
    }
    if (!password || !password.trim()) {
      fieldErrors.password = 'Please enter your password';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        error: 'Please enter your email and password.',
        code: 'REQUIRED_FIELDS_ERROR',
        scenario: 'Required Fields Error',
        errors: fieldErrors
      });
    }

    // ─── 2. Find User by Email ──────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: finalEmail.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid Email or Password',
        code: 'INVALID_CREDENTIALS',
        scenario: 'Invalid Credentials',
        alert: {
          title: 'Invalid Email or Password',
          message: 'The credentials you entered do not match our records. Please double check and try again.'
        },
        errors: {
          emailAddress: 'Incorrect email or password'
        }
      });
    }

    // ─── 3. Check Account Status ────────────────────────────────────────────
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED',
        alert: {
          title: 'Account Deactivated',
          message: 'This account has been deactivated. Please contact our admissions desk for assistance.'
        }
      });
    }

    // ─── 4. Verify Password ─────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Email or Password',
        code: 'INVALID_CREDENTIALS',
        scenario: 'Invalid Credentials',
        alert: {
          title: 'Invalid Email or Password',
          message: 'The credentials you entered do not match our records. Please double check and try again.'
        },
        errors: {
          emailAddress: 'Incorrect email or password'
        }
      });
    }

    // ─── 5. Generate JWT Token ──────────────────────────────────────────────
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Determine dashboard redirect based on role
    const redirectUrl =
      user.role === 'ADMIN'
        ? '/admin/dashboard'
        : user.role === 'TEACHER'
        ? '/teacher/dashboard'
        : '/parent/dashboard';

    // ─── 6. Return Success State (Matching UI) ──────────────────────────────
    res.json({
      success: true,
      scenario: 'Success State',
      title: 'Login Successful!',
      message: 'Welcome back to Tom & Jerry Nursery. Redirecting to your dashboard...',
      dashboard: {
        title: 'Parent Portal Access Ready',
        details: 'You can now review your active enrollment status, daily schedule updates, and communication logs.',
        redirectUrl
      },
      actions: {
        continueToDashboard: {
          label: 'Continue to Dashboard',
          href: redirectUrl
        },
        switchAccount: {
          label: 'Switch Account',
          href: '/login'
        }
      },
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      fullName,
      email,
      emailAddress,
      phone,
      phoneNumber,
      password,
      confirmPassword
    } = req.body;

    const finalName = fullName || name;
    const finalEmail = emailAddress || email;
    const finalPhone = phoneNumber || phone;

    // ─── 1. Check Required Fields ──────────────────────────────────────────
    const fieldErrors = {};

    if (!finalName || !finalName.trim()) {
      fieldErrors.fullName = 'Please enter your full name';
    }
    if (!finalEmail || !finalEmail.trim()) {
      fieldErrors.emailAddress = 'Please enter your email address';
    }
    if (!finalPhone || !finalPhone.trim()) {
      fieldErrors.phoneNumber = 'Please enter your phone number';
    }
    if (!password || !password.trim()) {
      fieldErrors.password = 'Please enter a password';
    }
    if (!confirmPassword || !confirmPassword.trim()) {
      fieldErrors.confirmPassword = 'Please confirm your password';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        error: 'Please fill in all required fields.',
        code: 'REQUIRED_FIELDS_ERROR',
        scenario: 'Required Fields Error',
        errors: fieldErrors
      });
    }

    // ─── 2. Validate Email Format ──────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalEmail.trim())) {
      return res.status(400).json({
        error: 'Please enter a valid email address.',
        code: 'INVALID_EMAIL',
        scenario: 'Invalid Email',
        errors: {
          emailAddress: 'Please enter a valid email address.'
        }
      });
    }

    // ─── 3. Validate Password Mismatch ─────────────────────────────────────
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match.',
        code: 'PASSWORD_MISMATCH',
        scenario: 'Password Mismatch',
        errors: {
          confirmPassword: 'Passwords do not match'
        }
      });
    }

    // ─── 4. Validate Password Strength (min 8 chars, letter & number) ──────
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (password.length < 8 || !hasLetter || !hasNumber) {
      return res.status(400).json({
        error: 'Must be at least 8 characters with a letter & number',
        code: 'WEAK_PASSWORD',
        scenario: 'Weak Password',
        errors: {
          password: 'Must be at least 8 characters with a letter & number'
        }
      });
    }

    // ─── 5. Check if Email Already Registered ──────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: finalEmail.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'This email is already registered',
        code: 'EMAIL_ALREADY_REGISTERED',
        scenario: 'Email Already Registered',
        alert: {
          title: 'This email is already registered',
          message: 'An account with this email already exists. Please log in or reset your password.',
          action: {
            label: 'Log In here',
            link: '/login'
          }
        },
        errors: {
          emailAddress: 'This email address is already registered. Please log in.'
        }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: finalName.trim(),
        email: finalEmail.toLowerCase().trim(),
        phone: finalPhone ? finalPhone.trim() : null,
        password: hashedPassword,
        role: 'PARENT',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      scenario: 'Success State',
      title: 'Account Created Successfully!',
      message: 'Your parent account has been created successfully. You can now log in to continue.',
      nextSteps: {
        title: 'Next Steps for Families',
        description: "Log in to begin or track your child's nursery application, schedule nursery garden tours, and connect with our care coordinators.",
        note: 'Please note: Creating an account establishes your parent portal profile and does not mean admission has been approved.'
      },
      actions: {
        continueToLogin: {
          label: 'Continue to Login',
          href: '/login'
        },
        backToHome: {
          label: 'Back to Home',
          href: '/'
        }
      },
      support: {
        email: 'admissions@tomjerrynursery.com',
        phone: '+1 (555) 019-8230',
        text: 'Need assistance? Contact our Admissions Office at admissions@tomjerrynursery.com or +1 (555) 019-8230.'
      },
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            classroom: {
              select: { id: true, name: true, roomNumber: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe };
