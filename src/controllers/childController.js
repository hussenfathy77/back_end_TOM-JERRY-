const prisma = require('../config/database');
const { resolveAgeRange, ageMatches } = require('../utils/ageGroups');

async function findMatchingClassroom(dateOfBirth) {
  const classrooms = await prisma.classroom.findMany({
    where: { status: 'ACTIVE' },
    include: { _count: { select: { children: true } } },
    orderBy: { createdAt: 'asc' }
  });

  return classrooms.find((cls) => {
    if (cls._count.children >= cls.capacity) return false;
    const { from, to } = resolveAgeRange(cls);
    return ageMatches(dateOfBirth, from, to);
  }) || null;
}

const classroomSelect = {
  id: true,
  name: true,
  ageGroup: true,
  roomNumber: true,
  teacherId: true
};

const getAllChildren = async (req, res, next) => {
  try {
    const children = await prisma.child.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        classroom: { select: classroomSelect }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(children);
  } catch (error) {
    next(error);
  }
};

const getChildById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        classroom: { select: classroomSelect }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json(child);
  } catch (error) {
    next(error);
  }
};

const createChild = async (req, res, next) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, parentId, classroomId } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !gender || !parentId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    let assignedClassroomId = null;
    if (classroomId !== undefined) {
      assignedClassroomId = (classroomId && classroomId !== 'UNASSIGNED') ? classroomId : null;
    } else {
      const match = await findMatchingClassroom(dateOfBirth);
      assignedClassroomId = match?.id || null;
    }

    const child = await prisma.child.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        parentId,
        classroomId: assignedClassroomId
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        classroom: { select: classroomSelect }
      }
    });

    res.status(201).json(child);
  } catch (error) {
    next(error);
  }
};

const updateChild = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, gender, parentId, classroomId } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (parentId) updateData.parentId = parentId;
    if (classroomId !== undefined) updateData.classroomId = classroomId || null;

    const child = await prisma.child.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        classroom: { select: classroomSelect }
      }
    });

    res.json(child);
  } catch (error) {
    next(error);
  }
};

const deleteChild = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.child.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild
};
