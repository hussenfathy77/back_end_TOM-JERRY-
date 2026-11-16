const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Parent only: GET /api/parent/profile
router.get('/profile', authenticateToken, requireRole('PARENT'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { children: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
});

// Parent only: GET /api/parent/children
// Returns all children of the logged-in parent (both enrolled children and submitted admission applications)
router.get('/children', authenticateToken, requireRole('PARENT'), async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const parentEmail = req.user.email;

    // 1. Enrolled children
    const children = await prisma.child.findMany({
      where: { parentId },
      include: {
        classroom: {
          select: { id: true, name: true, roomNumber: true, ageGroup: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Admission requests submitted by this parent
    const admissions = await prisma.admissionRequest.findMany({
      where: {
        OR: [
          { parentId },
          { parentEmail: parentEmail ? parentEmail.toLowerCase().trim() : undefined }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Merge: include admission children if they don't already match an enrolled child
    const result = [...children];
    for (const adm of admissions) {
      const rawName = (adm.childName || '').trim();
      const parts = rawName.split(/\s+/);
      const firstName = parts[0] || 'Child';
      const lastName = parts.slice(1).join(' ') || '';

      const alreadyEnrolled = children.some(c =>
        c.studentId === adm.applicationNumber ||
        (c.firstName.toLowerCase() === firstName.toLowerCase() && c.lastName.toLowerCase() === lastName.toLowerCase())
      );

      if (!alreadyEnrolled) {
        result.push({
          id: adm.id,
          isAdmission: true,
          status: adm.status, // PENDING, REVIEWING, APPROVED, REJECTED
          applicationNumber: adm.applicationNumber,
          studentId: adm.applicationNumber,
          firstName,
          lastName,
          dateOfBirth: adm.childDob,
          gender: adm.gender,
          classroom: {
            id: null,
            name: adm.requestedClass || 'Intake Requested',
            roomNumber: adm.status === 'APPROVED' ? 'Enrollment Approved' : 'Review in Progress'
          }
        });
      }
    }

    res.json(result);
  } catch (error) { next(error); }
});

// Parent only: GET /api/parent/attendance?childId=...&month=1-12&year=YYYY
// Returns attendance records for a specific child (must belong to parent)
router.get('/attendance', authenticateToken, requireRole('PARENT'), async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { childId, month, year } = req.query;

    // Build date filter
    const now = new Date();
    const targetYear  = parseInt(year)  || now.getFullYear();
    const targetMonth = parseInt(month) || (now.getMonth() + 1); // 1-12

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate   = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Build child filter — only children that belong to this parent
    const childFilter = childId
      ? { id: childId, parentId }
      : { parentId };

    // Verify the child belongs to this parent
    const targetChildren = await prisma.child.findMany({
      where: childFilter,
      include: {
        classroom: {
          select: { id: true, name: true, roomNumber: true, ageGroup: true, subtitle: true }
        }
      }
    });

    if (targetChildren.length === 0) {
      // Find matching admission request for this parent
      const parentEmail = req.user.email ? req.user.email.toLowerCase().trim() : undefined;
      const admissionWhere = {
        OR: [
          { parentId },
          ...(parentEmail ? [{ parentEmail }] : [])
        ]
      };

      if (childId && childId !== 'undefined' && childId !== 'null') {
        admissionWhere.AND = [
          {
            OR: [
              { id: childId },
              { applicationNumber: childId }
            ]
          }
        ];
      }

      const admission = await prisma.admissionRequest.findFirst({
        where: admissionWhere,
        orderBy: { createdAt: 'desc' }
      });

      if (admission) {
        const rawName = (admission.childName || '').trim();
        const parts = rawName.split(/\s+/);
        return res.json({
          child: {
            id: admission.id,
            firstName: parts[0] || 'Child',
            lastName: parts.slice(1).join(' ') || '',
            dateOfBirth: admission.childDob,
            gender: admission.gender,
            studentId: admission.applicationNumber,
            classroom: {
              name: admission.requestedClass || 'Intake Requested',
              roomNumber: admission.status === 'APPROVED' ? 'Enrollment Approved' : 'Review in Progress'
            }
          },
          isAdmission: true,
          admissionStatus: admission.status,
          period: {
            month: targetMonth,
            year:  targetYear,
            monthName: startDate.toLocaleString('en-US', { month: 'long' }),
            startDate: startDate.toISOString(),
            endDate:   endDate.toISOString()
          },
          stats: { total: 0, present: 0, late: 0, absent: 0, excused: 0, attendanceRate: 0 },
          records: [],
          calendarMap: {}
        });
      }
      return res.status(404).json({ error: 'Child not found or not associated with this parent' });
    }

    const child = targetChildren[0];
    const childIds = targetChildren.map(c => c.id);

    // Fetch attendance records
    const attendances = await prisma.attendance.findMany({
      where: {
        childId: { in: childIds },
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate stats
    const total     = attendances.length;
    const present   = attendances.filter(a => a.status === 'PRESENT').length;
    const late      = attendances.filter(a => a.status === 'LATE').length;
    const absent    = attendances.filter(a => a.status === 'ABSENT').length;
    const excused   = attendances.filter(a => a.status === 'EXCUSED').length;
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100 * 10) / 10 : 0;

    // Build calendar map: day -> status
    const calendarMap = {};
    attendances.forEach(a => {
      const d = new Date(a.date).getDate();
      calendarMap[d] = a.status.toLowerCase();
    });

    res.json({
      child: {
        id:          child.id,
        firstName:   child.firstName,
        lastName:    child.lastName,
        dateOfBirth: child.dateOfBirth,
        gender:      child.gender,
        studentId:   child.studentId,
        classroom:   child.classroom
      },
      parent: { id: parentId },
      period: {
        month: targetMonth,
        year:  targetYear,
        monthName: startDate.toLocaleString('en-US', { month: 'long' }),
        startDate: startDate.toISOString(),
        endDate:   endDate.toISOString()
      },
      stats: {
        total,
        present,
        late,
        absent,
        excused,
        attendanceRate
      },
      records: attendances.map(a => ({
        id:              a.id,
        date:            a.date,
        status:          a.status,
        arrivalTime:     a.arrivalTime     || null,
        guardianName:    a.guardianName    || null,
        guardianRelation:a.guardianRelation|| null,
        isExcused:       a.isExcused,
        session:         a.session         || 'Morning Session',
        notes:           a.notes           || null,
        specialCareNote: a.specialCareNote || null
      })),
      calendarMap
    });
  } catch (error) { next(error); }
});

// Parent only: GET /api/parent/daily-activities?childId=...&date=YYYY-MM-DD
// Returns daily activity logs for a child (meals, naps, teacher notes, mood, activities)
router.get('/daily-activities', authenticateToken, requireRole('PARENT'), async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { childId, date } = req.query;

    // Target date (default today)
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find the child (must belong to parent)
    const childFilter = childId
      ? { id: childId, parentId }
      : { parentId };

    const children = await prisma.child.findMany({
      where: childFilter,
      include: {
        classroom: { select: { id: true, name: true, roomNumber: true, teacher: { select: { name: true, staffRole: true } } } }
      },
      take: 1
    });

    if (children.length === 0) {
      const parentEmail = req.user.email ? req.user.email.toLowerCase().trim() : undefined;
      const admissionWhere = {
        OR: [
          { parentId },
          ...(parentEmail ? [{ parentEmail }] : [])
        ]
      };
      if (childId && childId !== 'undefined' && childId !== 'null') {
        admissionWhere.AND = [
          {
            OR: [
              { id: childId },
              { applicationNumber: childId }
            ]
          }
        ];
      }
      const admission = await prisma.admissionRequest.findFirst({
        where: admissionWhere,
        orderBy: { createdAt: 'desc' }
      });
      if (admission) {
        const rawName = (admission.childName || '').trim();
        const parts = rawName.split(/\s+/);
        return res.json({
          child: {
            id: admission.id,
            firstName: parts[0] || 'Child',
            lastName: parts.slice(1).join(' ') || '',
            dateOfBirth: admission.childDob,
            gender: admission.gender,
            studentId: admission.applicationNumber,
            classroom: {
              name: admission.requestedClass || 'Intake Requested',
              roomNumber: admission.status === 'APPROVED' ? 'Enrollment Approved' : 'Review in Progress'
            }
          },
          isAdmission: true,
          admissionStatus: admission.status,
          date: targetDate.toISOString().split('T')[0],
          activities: [],
          napLogs: [],
          teacherNotes: [],
          moodLogs: [],
          attendance: null
        });
      }
      return res.status(404).json({ error: 'Child not found or not associated with this parent' });
    }

    const child = children[0];

    // Fetch daily activities
    const [activities, napLogs, teacherNotes, moodLogs, attendance, developmentalObservation] = await Promise.all([
      prisma.dailyActivity.findMany({
        where: {
          childId: child.id,
          OR: [
            { date: { gte: startOfDay, lte: endOfDay } },
            { createdAt: { gte: startOfDay, lte: endOfDay } }
          ]
        },
        include: { loggedBy: { select: { name: true, staffRole: true } } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.napLog.findMany({
        where: {
          childId: child.id,
          OR: [
            { date: { gte: startOfDay, lte: endOfDay } },
            { createdAt: { gte: startOfDay, lte: endOfDay } }
          ]
        },
        include: { loggedBy: { select: { name: true, staffRole: true } } },
        orderBy: { startTime: 'asc' }
      }),
      prisma.teacherNote.findMany({
        where: {
          childId: child.id,
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        include: { teacher: { select: { name: true, staffRole: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.childMoodLog.findMany({
        where: {
          childId: child.id,
          OR: [
            { date: { gte: startOfDay, lte: endOfDay } },
            { createdAt: { gte: startOfDay, lte: endOfDay } }
          ]
        },
        include: { loggedBy: { select: { name: true, staffRole: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.attendance.findFirst({
        where: { childId: child.id, date: { gte: startOfDay, lte: endOfDay } }
      }),
      prisma.developmentalObservation.findFirst({
        where: {
          childId: child.id,
          OR: [
            { date: { gte: startOfDay, lte: endOfDay } },
            { createdAt: { gte: startOfDay, lte: endOfDay } }
          ]
        },
        include: { loggedBy: { select: { name: true, staffRole: true } } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      child: {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        dateOfBirth: child.dateOfBirth,
        classroom: child.classroom
      },
      date: targetDate.toISOString().split('T')[0],
      attendance: attendance ? {
        status:      attendance.status,
        arrivalTime: attendance.arrivalTime,
        session:     attendance.session,
        isExcused:   attendance.isExcused
      } : null,
      activities,
      napLogs,
      teacherNotes,
      moodLogs,
      developmentalObservation,
      hasData: activities.length > 0 || napLogs.length > 0 || teacherNotes.length > 0 || !!developmentalObservation
    });
  } catch (error) { next(error); }
});

module.exports = router;
