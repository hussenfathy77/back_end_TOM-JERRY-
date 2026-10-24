const prisma = require('../config/database');

// ─── GET ALL CLASSROOMS (with filters) ───────────────────────────────────────
const getAllClassrooms = async (req, res, next) => {
  try {
    const { status, academicYear, teacherFilter, search } = req.query;

    const where = {};

    // Filter by status
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    // Filter by academic year
    if (academicYear) {
      where.academicYear = academicYear;
    }

    // Filter by teacher assignment
    if (teacherFilter === 'ASSIGNED') {
      where.teacherId = { not: null };
    } else if (teacherFilter === 'UNASSIGNED') {
      where.teacherId = null;
    }

    // Search by name or room number
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { roomNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const classrooms = await prisma.classroom.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: { children: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Format response with computed fields
    const formatted = classrooms.map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: c.subtitle,
      description: c.description,
      ageGroup: c.ageGroup,
      ageFrom: c.ageFrom,
      ageTo: c.ageTo,
      roomNumber: c.roomNumber,
      capacity: c.capacity,
      enrolled: c._count.children,
      availability: c.capacity - c._count.children,
      status: c.status,
      teacherId: c.teacherId,
      teacher: c.teacher,
      academicYear: c.academicYear,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// ─── GET CLASSROOM BY ID ─────────────────────────────────────────────────────
const getClassroomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            parent: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { firstName: 'asc' }
        },
        sessions: {
          orderBy: { date: 'desc' },
          take: 20
        },
        _count: {
          select: { children: true }
        }
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const formatted = {
      ...classroom,
      enrolled: classroom._count.children,
      availability: classroom.capacity - classroom._count.children
    };
    delete formatted._count;

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// ─── CREATE CLASSROOM ────────────────────────────────────────────────────────
const createClassroom = async (req, res, next) => {
  try {
    const {
      name,
      subtitle,
      description,
      ageGroup,
      ageFrom,
      ageTo,
      roomNumber,
      capacity,
      status,
      teacherId,
      academicYear
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Class Name is required' });
    }

    // Validate teacher exists and is a TEACHER if teacherId provided
    if (teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId }
      });
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      if (teacher.role !== 'TEACHER') {
        return res.status(400).json({ error: 'Assigned user must have TEACHER role' });
      }
    }

    const classroom = await prisma.classroom.create({
      data: {
        name,
        subtitle: subtitle || null,
        description: description || null,
        ageGroup: ageGroup || 'General Nursery',
        ageFrom: ageFrom ? parseFloat(ageFrom) : null,
        ageTo: ageTo ? parseFloat(ageTo) : null,
        roomNumber: roomNumber || null,
        capacity: capacity ? parseInt(capacity) : 15,
        status: status ? status.toUpperCase() : 'ACTIVE',
        teacherId: teacherId || null,
        academicYear: academicYear || '2026/2027 • Term 1'
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: { children: true }
        }
      }
    });

    res.status(201).json({
      ...classroom,
      enrolled: classroom._count.children,
      availability: classroom.capacity - classroom._count.children
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE CLASSROOM ────────────────────────────────────────────────────────
const updateClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      subtitle,
      description,
      ageGroup,
      ageFrom,
      ageTo,
      roomNumber,
      capacity,
      status,
      teacherId,
      academicYear
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (description !== undefined) updateData.description = description;
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup;
    if (ageFrom !== undefined) updateData.ageFrom = ageFrom ? parseFloat(ageFrom) : null;
    if (ageTo !== undefined) updateData.ageTo = ageTo ? parseFloat(ageTo) : null;
    if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (status !== undefined) updateData.status = status.toUpperCase();
    if (academicYear !== undefined) updateData.academicYear = academicYear;

    // Handle teacherId (allow null to unassign)
    if (teacherId !== undefined) {
      if (teacherId === null || teacherId === '') {
        updateData.teacherId = null;
      } else {
        const teacher = await prisma.user.findUnique({
          where: { id: teacherId }
        });
        if (!teacher) {
          return res.status(404).json({ error: 'Teacher not found' });
        }
        if (teacher.role !== 'TEACHER') {
          return res.status(400).json({ error: 'Assigned user must have TEACHER role' });
        }
        updateData.teacherId = teacherId;
      }
    }

    const classroom = await prisma.classroom.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: { children: true }
        }
      }
    });

    res.json({
      ...classroom,
      enrolled: classroom._count.children,
      availability: classroom.capacity - classroom._count.children
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE CLASSROOM ────────────────────────────────────────────────────────
const deleteClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First unassign all children from this classroom
    await prisma.child.updateMany({
      where: { classroomId: id },
      data: { classroomId: null }
    });

    await prisma.classroom.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ─── ASSIGN TEACHER TO CLASSROOM ─────────────────────────────────────────────
const assignTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (teacher.role !== 'TEACHER') {
      return res.status(400).json({ error: 'User must have TEACHER role' });
    }

    const classroom = await prisma.classroom.update({
      where: { id },
      data: { teacherId },
      include: {
        teacher: {
          select: { id: true, name: true, email: true, role: true }
        },
        _count: { select: { children: true } }
      }
    });

    res.json({
      ...classroom,
      enrolled: classroom._count.children,
      availability: classroom.capacity - classroom._count.children
    });
  } catch (error) {
    next(error);
  }
};

// ─── UNASSIGN TEACHER FROM CLASSROOM ─────────────────────────────────────────
const unassignTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classroom = await prisma.classroom.update({
      where: { id },
      data: { teacherId: null },
      include: {
        teacher: {
          select: { id: true, name: true, email: true, role: true }
        },
        _count: { select: { children: true } }
      }
    });

    res.json({
      ...classroom,
      enrolled: classroom._count.children,
      availability: classroom.capacity - classroom._count.children
    });
  } catch (error) {
    next(error);
  }
};

// ─── ENROLL CHILD IN CLASSROOM ───────────────────────────────────────────────
const enrollChild = async (req, res, next) => {
  try {
    const { id } = req.params; // classroom id
    const { childId } = req.body;

    if (!childId) {
      return res.status(400).json({ error: 'childId is required' });
    }

    // Check classroom exists and has capacity
    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: { _count: { select: { children: true } } }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (classroom._count.children >= classroom.capacity) {
      return res.status(400).json({ error: 'Classroom is at full capacity' });
    }

    // Check child exists
    const child = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Enroll the child
    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: { classroomId: id },
      include: {
        classroom: {
          select: { id: true, name: true, roomNumber: true }
        },
        parent: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(updatedChild);
  } catch (error) {
    next(error);
  }
};

// ─── BULK ENROLL CHILDREN ────────────────────────────────────────────────────
const bulkEnrollChildren = async (req, res, next) => {
  try {
    const { id } = req.params; // classroom id
    const { childIds } = req.body;

    if (!Array.isArray(childIds) || childIds.length === 0) {
      return res.status(400).json({ error: 'childIds array is required' });
    }

    // Check classroom exists and has capacity
    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: { _count: { select: { children: true } } }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const availableSeats = classroom.capacity - classroom._count.children;
    if (childIds.length > availableSeats) {
      return res.status(400).json({
        error: `Not enough capacity. Available seats: ${availableSeats}, requested: ${childIds.length}`
      });
    }

    // Bulk update
    const result = await prisma.child.updateMany({
      where: { id: { in: childIds } },
      data: { classroomId: id }
    });

    res.json({
      message: `${result.count} children enrolled successfully`,
      classroomId: id,
      enrolledCount: result.count
    });
  } catch (error) {
    next(error);
  }
};

// ─── UNENROLL CHILD FROM CLASSROOM ──────────────────────────────────────────
const unenrollChild = async (req, res, next) => {
  try {
    const { id } = req.params; // classroom id
    const { childId } = req.body;

    if (!childId) {
      return res.status(400).json({ error: 'childId is required' });
    }

    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: { classroomId: null }
    });

    res.json({ message: 'Child unenrolled successfully', child: updatedChild });
  } catch (error) {
    next(error);
  }
};

// ─── GET CLASSROOM CHILDREN ─────────────────────────────────────────────────
const getClassroomChildren = async (req, res, next) => {
  try {
    const { id } = req.params;

    const children = await prisma.child.findMany({
      where: { classroomId: id },
      include: {
        parent: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    res.json(children);
  } catch (error) {
    next(error);
  }
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
const getClassroomStats = async (req, res, next) => {
  try {
    const { academicYear } = req.query;

    const where = {};
    if (academicYear) {
      where.academicYear = academicYear;
    }

    // Get all classrooms with counts
    const classrooms = await prisma.classroom.findMany({
      where,
      include: {
        _count: { select: { children: true } }
      }
    });

    const totalClasses = classrooms.length;
    const activeClasses = classrooms.filter((c) => c.status === 'ACTIVE').length;

    // Count unique assigned teachers
    const assignedTeacherIds = new Set(
      classrooms.filter((c) => c.teacherId).map((c) => c.teacherId)
    );
    const assignedTeachers = assignedTeacherIds.size;

    // Without a teacher
    const withoutTeacher = classrooms.filter((c) => !c.teacherId).length;

    // Children stats
    const totalChildren = classrooms.reduce((sum, c) => sum + c._count.children, 0);
    const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);

    // Age group distribution
    const ageGroups = {};
    classrooms.forEach((c) => {
      if (!ageGroups[c.ageGroup]) {
        ageGroups[c.ageGroup] = { count: 0, enrolled: 0, capacity: 0 };
      }
      ageGroups[c.ageGroup].count++;
      ageGroups[c.ageGroup].enrolled += c._count.children;
      ageGroups[c.ageGroup].capacity += c.capacity;
    });

    // Capacity distribution per classroom (for chart)
    const capacityDistribution = classrooms.map((c) => ({
      id: c.id,
      name: c.name,
      enrolled: c._count.children,
      capacity: c.capacity,
      percentage: c.capacity > 0
        ? Math.round((c._count.children / c.capacity) * 100)
        : 0
    }));

    res.json({
      totalClasses,
      activeClasses,
      assignedTeachers,
      withoutTeacher,
      totalChildren,
      totalCapacity,
      seatsFilled: totalChildren,
      ageGroups,
      capacityDistribution
    });
  } catch (error) {
    next(error);
  }
};

// ─── CLASSROOM SESSIONS (Schedule) ──────────────────────────────────────────

// Get today's sessions across all classrooms
const getTodaySessions = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await prisma.classroomSession.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            roomNumber: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// Get sessions for a specific classroom
const getClassroomSessions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startDate, endDate } = req.query;

    const where = { classroomId: id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const sessions = await prisma.classroomSession.findMany({
      where,
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }]
    });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// Create a session for a classroom
const createSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, status } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: 'title, startTime, and endTime are required' });
    }

    // Check classroom exists
    const classroom = await prisma.classroom.findUnique({ where: { id } });
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const session = await prisma.classroomSession.create({
      data: {
        classroomId: id,
        title,
        description,
        date: date ? new Date(date) : new Date(),
        startTime,
        endTime,
        status: status ? status.toUpperCase() : 'SCHEDULED'
      },
      include: {
        classroom: {
          select: { id: true, name: true, roomNumber: true }
        }
      }
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// Update a session
const updateSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { title, description, date, startTime, endTime, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (status !== undefined) updateData.status = status.toUpperCase();

    const session = await prisma.classroomSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        classroom: {
          select: { id: true, name: true, roomNumber: true }
        }
      }
    });

    res.json(session);
  } catch (error) {
    next(error);
  }
};

// Delete a session
const deleteSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    await prisma.classroomSession.delete({
      where: { id: sessionId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ─── GET AVAILABLE TEACHERS (not assigned to any classroom) ──────────────────
const getAvailableTeachers = async (req, res, next) => {
  try {
    const { includeAssigned } = req.query;

    const where = {
      role: 'TEACHER',
      isActive: true
    };

    // If not including assigned, only show teachers without classrooms
    if (includeAssigned !== 'true') {
      where.assignedClassrooms = { none: {} };
    }

    const teachers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        assignedClassrooms: {
          select: {
            id: true,
            name: true,
            roomNumber: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(teachers);
  } catch (error) {
    next(error);
  }
};

// ─── GET UNASSIGNED CHILDREN (not in any classroom) ──────────────────────────
const getUnassignedChildren = async (req, res, next) => {
  try {
    const children = await prisma.child.findMany({
      where: { classroomId: null },
      include: {
        parent: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    res.json(children);
  } catch (error) {
    next(error);
  }
};

// ─── EXPORT ROSTER ───────────────────────────────────────────────────────────
const exportRoster = async (req, res, next) => {
  try {
    const { academicYear } = req.query;

    const where = {};
    if (academicYear) where.academicYear = academicYear;

    const classrooms = await prisma.classroom.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        },
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            parent: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { firstName: 'asc' }
        },
        _count: { select: { children: true } }
      },
      orderBy: { name: 'asc' }
    });

    const roster = classrooms.map((c) => ({
      classroom: {
        id: c.id,
        name: c.name,
        subtitle: c.subtitle,
        ageGroup: c.ageGroup,
        roomNumber: c.roomNumber,
        capacity: c.capacity,
        enrolled: c._count.children,
        status: c.status,
        academicYear: c.academicYear
      },
      teacher: c.teacher || null,
      children: c.children
    }));

    res.json({
      exportDate: new Date().toISOString(),
      academicYear: academicYear || 'All',
      totalClassrooms: classrooms.length,
      roster
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  assignTeacher,
  unassignTeacher,
  enrollChild,
  bulkEnrollChildren,
  unenrollChild,
  getClassroomChildren,
  getClassroomStats,
  getTodaySessions,
  getClassroomSessions,
  createSession,
  updateSession,
  deleteSession,
  getAvailableTeachers,
  getUnassignedChildren,
  exportRoster
};
