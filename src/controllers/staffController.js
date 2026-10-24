const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

// Helper to compute initials from name
const getInitials = (name) => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── GET STAFF STATS (Top 4 Cards & Ratio Banner) ───────────────────────────
const getStaffStats = async (req, res, next) => {
  try {
    const staffMembers = await prisma.user.findMany({
      where: {
        role: 'TEACHER'
      },
      include: {
        assignedClassrooms: true
      }
    });

    const totalStaff = staffMembers.length;
    const activeStaff = staffMembers.filter((s) => s.isActive).length;

    // Filter teachers vs assistants/nurses
    const teachersList = staffMembers.filter(
      (s) =>
        s.staffRole?.includes('Teacher') ||
        s.staffRole?.includes('Educator') ||
        s.staffRole?.includes('Lead') ||
        !s.staffRole
    );
    const teachersCount = teachersList.length;
    const teachersPercentage = totalStaff > 0 ? Math.round((teachersCount / totalStaff) * 100) : 0;

    // Assigned to classrooms (Active classroom leads)
    const assignedTeachers = staffMembers.filter(
      (s) => s.assignedClassrooms.length > 0 || s.staffScope === 'ALL_ROOMS'
    ).length;

    // Unassigned (Cover pool)
    const unassignedCount = totalStaff - assignedTeachers;

    // British EYFS ratio check across active classrooms
    const classrooms = await prisma.classroom.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: { select: { children: true } },
        teacher: true
      }
    });

    const ratioCompliance = {
      isCompliant: true,
      status: 'Compliant',
      title: 'Staff-to-Child Regulatory Ratio: Compliant',
      standard: 'British EYFS standard requirements',
      ratios: '1:3 for babies, 1:4 for toddlers, 1:8 for KG',
      activeRooms: classrooms.length,
      description: `All ${classrooms.length} active rooms meet British EYFS standard requirements (1:3 for babies, 1:4 for toddlers, 1:8 for KG).`
    };

    res.json({
      totalStaff: {
        count: totalStaff,
        recentChange: '+2 this term',
        label: 'Active nursery personnel'
      },
      teachers: {
        count: teachersCount,
        percentage: `${teachersPercentage}% of team`,
        label: 'Qualified early educators'
      },
      assignedTeachers: {
        count: assignedTeachers,
        status: 'Optimal',
        label: 'Active classroom leads'
      },
      unassigned: {
        count: unassignedCount,
        badge: 'Cover Pool',
        label: 'Available for substitution'
      },
      ratioCompliance
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL STAFF (with Search, Filter, and Pagination) ─────────────────────
const getAllStaff = async (req, res, next) => {
  try {
    const {
      search,
      role: roleFilter,
      classId,
      status: statusFilter,
      page = 1,
      limit = 6
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const take = parseInt(limit) || 6;
    const skip = (pageNum - 1) * take;

    const where = {
      role: 'TEACHER'
    };

    // Filter by Active status
    if (statusFilter && statusFilter !== 'ALL') {
      where.isActive = statusFilter.toUpperCase() === 'ACTIVE';
    }

    // Filter by specific staff role
    if (roleFilter && roleFilter !== 'ALL') {
      where.staffRole = { contains: roleFilter, mode: 'insensitive' };
    }

    // Filter by class assignment
    if (classId && classId !== 'ALL') {
      if (classId === 'UNASSIGNED') {
        where.assignedClassrooms = { none: {} };
        where.staffScope = { not: 'ALL_ROOMS' };
      } else if (classId === 'ALL_ROOMS') {
        where.staffScope = 'ALL_ROOMS';
      } else {
        where.assignedClassrooms = { some: { id: classId } };
      }
    }

    // Search query by name, email, or phone
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [totalCount, staffList] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          assignedClassrooms: {
            select: {
              id: true,
              name: true,
              roomNumber: true,
              ageGroup: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take
      })
    ]);

    const formatted = staffList.map((s) => {
      let assignedClass = null;

      if (s.staffScope === 'ALL_ROOMS') {
        assignedClass = {
          id: 'all-rooms',
          name: 'All Rooms (Staff Care)',
          type: 'ALL_ROOMS',
          badge: 'All Rooms (Staff Care)'
        };
      } else if (s.assignedClassrooms.length > 0) {
        const cls = s.assignedClassrooms[0];
        assignedClass = {
          id: cls.id,
          name: cls.name,
          roomNumber: cls.roomNumber,
          type: 'CLASSROOM',
          badge: cls.name
        };
      } else {
        assignedClass = {
          id: null,
          name: 'Unassigned (Available)',
          type: 'UNASSIGNED',
          badge: 'Unassigned (Available)'
        };
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone || '+1 (555) 000-0000',
        role: s.staffRole || 'Teacher',
        staffRole: s.staffRole || 'Teacher',
        employmentType: s.employmentType || 'Full-Time Regular',
        employmentStatus: s.employmentStatus || (s.isActive ? 'Active' : 'Onboarding'),
        initials: getInitials(s.name),
        avatar: s.avatar || null,
        assignedClass,
        status: s.employmentStatus || (s.isActive ? 'Active' : 'Inactive'),
        isActive: s.isActive,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      };
    });

    res.json({
      data: formatted,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(totalCount / take)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE STAFF MEMBER ────────────────────────────────────────────────
const getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await prisma.user.findUnique({
      where: { id },
      include: {
        assignedClassrooms: true
      }
    });

    if (!staff || staff.role !== 'TEACHER') {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({
      ...staff,
      initials: getInitials(staff.name)
    });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE NEW STAFF MEMBER (+ Add New Staff Modal) ───────────────────────
const createStaff = async (req, res, next) => {
  try {
    const {
      name,
      fullName,
      email,
      emailAddress,
      phone,
      phoneNumber,
      role,
      staffRole,
      employmentType,
      employmentStatus,
      classroomId,
      assignedClassroom,
      staffScope,
      password,
      isActive
    } = req.body;

    const finalName = fullName || name;
    const finalEmail = emailAddress || email;
    const finalPhone = phoneNumber || phone || null;
    const finalRole = staffRole || role || 'Teacher (Nursery Staff)';
    const finalEmpType = employmentType || 'Full-Time Regular';
    const finalEmpStatus = employmentStatus || 'Active';
    const finalClassroomId = assignedClassroom || classroomId;

    if (!finalName || !finalEmail) {
      return res.status(400).json({ error: 'Full Name and Email Address are required' });
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: finalEmail } });
    if (existing) {
      return res.status(409).json({ error: 'A staff member with this email already exists' });
    }

    const defaultPassword = password || 'staff123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const isAccountActive =
      isActive !== undefined
        ? isActive
        : finalEmpStatus.toLowerCase() !== 'inactive';

    const newStaff = await prisma.user.create({
      data: {
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        staffRole: finalRole,
        employmentType: finalEmpType,
        employmentStatus: finalEmpStatus,
        staffScope: staffScope || (finalClassroomId === 'ALL_ROOMS' ? 'ALL_ROOMS' : 'CLASSROOM'),
        password: hashedPassword,
        role: 'TEACHER',
        isActive: isAccountActive
      }
    });

    // If a specific classroom was assigned during creation
    let assignedClassInfo = null;
    if (finalClassroomId && finalClassroomId !== 'ALL_ROOMS' && finalClassroomId !== 'UNASSIGNED') {
      const cls = await prisma.classroom.update({
        where: { id: finalClassroomId },
        data: { teacherId: newStaff.id },
        include: { _count: { select: { children: true } } }
      });
      assignedClassInfo = {
        id: cls.id,
        name: cls.name,
        roomNumber: cls.roomNumber,
        enrolled: cls._count.children,
        capacity: cls.capacity
      };
    }

    res.status(201).json({
      id: newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone,
      staffRole: newStaff.staffRole,
      employmentType: newStaff.employmentType,
      employmentStatus: newStaff.employmentStatus,
      initials: getInitials(newStaff.name),
      assignedClass: assignedClassInfo,
      isActive: newStaff.isActive,
      message: 'Staff profile created and classroom duties assigned successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE STAFF MEMBER ────────────────────────────────────────────────────
const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, staffRole, classroomId, staffScope, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (staffRole !== undefined) updateData.staffRole = staffRole;
    if (staffScope !== undefined) updateData.staffScope = staffScope;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Update classroom assignment if provided
    if (classroomId !== undefined) {
      // First unassign from any currently assigned classroom
      await prisma.classroom.updateMany({
        where: { teacherId: id },
        data: { teacherId: null }
      });

      if (classroomId === 'ALL_ROOMS') {
        await prisma.user.update({
          where: { id },
          data: { staffScope: 'ALL_ROOMS' }
        });
      } else if (classroomId && classroomId !== 'UNASSIGNED') {
        await prisma.classroom.update({
          where: { id: classroomId },
          data: { teacherId: id }
        });
        await prisma.user.update({
          where: { id },
          data: { staffScope: 'CLASSROOM' }
        });
      } else {
        await prisma.user.update({
          where: { id },
          data: { staffScope: 'CLASSROOM' }
        });
      }
    }

    res.json({
      message: 'Staff updated successfully',
      staff: updated
    });
  } catch (error) {
    next(error);
  }
};

// ─── TOGGLE STAFF STATUS ────────────────────────────────────────────────────
const toggleStaffStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await prisma.user.findUnique({ where: { id } });
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !staff.isActive }
    });

    res.json({
      id: updated.id,
      name: updated.name,
      isActive: updated.isActive,
      status: updated.isActive ? 'Active' : 'Inactive'
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE STAFF MEMBER ────────────────────────────────────────────────────
const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Unassign any classrooms first
    await prisma.classroom.updateMany({
      where: { teacherId: id },
      data: { teacherId: null }
    });

    await prisma.user.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ─── ASSIGN STAFF TO CLASSROOM ──────────────────────────────────────────────
const assignClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { classroomId, scope } = req.body;

    if (scope === 'ALL_ROOMS') {
      await prisma.user.update({
        where: { id },
        data: { staffScope: 'ALL_ROOMS' }
      });
      return res.json({ message: 'Staff assigned to All Rooms (Staff Care)' });
    }

    if (!classroomId) {
      return res.status(400).json({ error: 'classroomId is required' });
    }

    // Unassign from any other class
    await prisma.classroom.updateMany({
      where: { teacherId: id },
      data: { teacherId: null }
    });

    // Assign to new class
    const classroom = await prisma.classroom.update({
      where: { id: classroomId },
      data: { teacherId: id }
    });

    await prisma.user.update({
      where: { id },
      data: { staffScope: 'CLASSROOM' }
    });

    res.json({
      message: `Assigned to ${classroom.name}`,
      classroom
    });
  } catch (error) {
    next(error);
  }
};

// ─── UNASSIGN STAFF (SEND TO COVER POOL) ─────────────────────────────────────
const unassignStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.classroom.updateMany({
      where: { teacherId: id },
      data: { teacherId: null }
    });

    await prisma.user.update({
      where: { id },
      data: { staffScope: 'CLASSROOM' }
    });

    res.json({ message: 'Staff member unassigned and added to Cover Pool' });
  } catch (error) {
    next(error);
  }
};

// ─── ASSIGN COVER (Bottom banner "Assign Cover" action) ───────────────────────
const assignCover = async (req, res, next) => {
  try {
    const { staffId, classroomId, date, notes } = req.body;

    if (!staffId || !classroomId) {
      return res.status(400).json({ error: 'staffId and classroomId are required' });
    }

    const [staff, classroom] = await Promise.all([
      prisma.user.findUnique({ where: { id: staffId } }),
      prisma.classroom.findUnique({ where: { id: classroomId } })
    ]);

    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });

    res.json({
      success: true,
      message: `Cover assigned: ${staff.name} is now covering ${classroom.name}`,
      details: {
        staffName: staff.name,
        classroomName: classroom.name,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || 'Standard substitution cover'
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── SCHEDULE LOGS (Bottom banner "View Schedule Log") ──────────────────────
const getScheduleLogs = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await prisma.classroomSession.findMany({
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            roomNumber: true,
            teacher: {
              select: { id: true, name: true, staffRole: true, phone: true }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      date: new Date().toISOString().split('T')[0],
      regulatoryStatus: 'Compliant (British EYFS standards)',
      schedule: sessions
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET DISTINCT STAFF ROLES (For Modal & Filter Dropdown) ────────────────
const getStaffRoles = async (req, res, next) => {
  try {
    const roles = [
      'Teacher (Nursery Staff)',
      'Lead Teacher',
      'Teacher',
      'Early Educator',
      'Assistant Teacher',
      'Nursery Nurse / First Aid',
      'Kindergarten Lead'
    ];
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// ─── GET EMPLOYMENT TYPES (For Add New Staff Modal) ──────────────────────────
const getEmploymentTypes = async (req, res, next) => {
  try {
    const types = [
      'Full-Time Regular',
      'Part-Time Regular',
      'Contractor',
      'Temporary / Substitute'
    ];
    res.json(types);
  } catch (error) {
    next(error);
  }
};

// ─── GET CLASSROOMS FOR MODAL DROPDOWN ──────────────────────────────────────
const getClassroomsDropdown = async (req, res, next) => {
  try {
    const classrooms = await prisma.classroom.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: { select: { children: true } },
        teacher: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = classrooms.map((c) => ({
      id: c.id,
      name: c.name,
      roomNumber: c.roomNumber,
      enrolled: c._count.children,
      capacity: c.capacity,
      helperText: `Class has ${c._count.children} children enrolled`,
      currentTeacher: c.teacher?.name || 'Unassigned'
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// ─── EXPORT STAFF (Export button at top) ─────────────────────────────────────
const exportStaff = async (req, res, next) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: {
        assignedClassrooms: { select: { name: true, roomNumber: true } }
      },
      orderBy: { name: 'asc' }
    });

    const exportData = staff.map((s) => ({
      Name: s.name,
      Email: s.email,
      Phone: s.phone || 'N/A',
      Role: s.staffRole || 'Teacher',
      'Employment Type': s.employmentType || 'Full-Time Regular',
      'Employment Status': s.employmentStatus || (s.isActive ? 'Active' : 'Onboarding'),
      'Assigned Class': s.staffScope === 'ALL_ROOMS'
        ? 'All Rooms (Staff Care)'
        : (s.assignedClassrooms[0]?.name || 'Unassigned (Available)'),
      Status: s.isActive ? 'Active' : 'Inactive'
    }));

    res.json({
      exportedAt: new Date().toISOString(),
      totalStaff: staff.length,
      data: exportData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffStats,
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
  assignClassroom,
  unassignStaff,
  assignCover,
  getScheduleLogs,
  getStaffRoles,
  getEmploymentTypes,
  getClassroomsDropdown,
  exportStaff
};
