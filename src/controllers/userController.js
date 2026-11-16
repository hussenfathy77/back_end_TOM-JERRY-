const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    // If a specific role is asked (e.g. TEACHER, PARENT), filter by it.
    // Otherwise, show only TEACHER and PARENT accounts so ADMIN is never listed in User Management.
    const where = role
      ? { role: role.toUpperCase() }
      : { role: { in: ['TEACHER', 'PARENT'] } };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { children: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const validRoles = ['ADMIN', 'TEACHER', 'PARENT'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const upperRole = role.toUpperCase();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: upperRole,
        staffRole: upperRole === 'TEACHER' ? 'Teacher' : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) {
      const validRoles = ['ADMIN', 'TEACHER', 'PARENT'];
      if (!validRoles.includes(role.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      const upperRole = role.toUpperCase();
      updateData.role = upperRole;
      if (upperRole === 'TEACHER') {
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing?.staffRole) {
          updateData.staffRole = 'Teacher';
        }
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Protection: Prevent admin from deactivating their own account
    if (req.user && req.user.id === user.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own admin account' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Protection: Prevent admin from deleting their own account
    if (req.user && req.user.id === user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};
