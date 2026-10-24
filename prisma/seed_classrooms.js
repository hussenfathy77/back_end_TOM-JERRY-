const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedClassrooms() {
  console.log('Starting classroom seed...');

  // ─── Create Teacher Users ────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('teacher123', 10);

  const teachersData = [
    { name: 'Elena Rostova', email: 'elena.rostova@school.com' },
    { name: 'Sarah Ahmed', email: 'sarah.ahmed@school.com' },
    { name: 'Kanya Patel', email: 'kanya.patel@school.com' },
    { name: 'Marcus Vance', email: 'marcus.vance@school.com' },
    { name: 'Lina Hassan', email: 'lina.hassan@school.com' },
    { name: 'David Kim', email: 'david.kim@school.com' }
  ];

  const teachers = [];
  for (const t of teachersData) {
    const existing = await prisma.user.findUnique({ where: { email: t.email } });
    if (existing) {
      teachers.push(existing);
      console.log(`Teacher "${t.name}" already exists, skipping.`);
    } else {
      const created = await prisma.user.create({
        data: {
          name: t.name,
          email: t.email,
          password: hashedPassword,
          role: 'TEACHER',
          isActive: true
        }
      });
      teachers.push(created);
      console.log(`Created teacher: ${t.name}`);
    }
  }

  // ─── Create Classrooms ──────────────────────────────────────────────────
  const classroomsData = [
    {
      name: 'Nursery A - Little Seedlings',
      subtitle: 'Little Seedlings',
      ageGroup: 'Toddler',
      ageFrom: 1.5,
      ageTo: 3,
      roomNumber: 'Room 101',
      capacity: 15,
      status: 'ACTIVE',
      teacherEmail: 'elena.rostova@school.com',
      academicYear: '2024/2027'
    },
    {
      name: 'Nursery B - Tiny Blossoms',
      subtitle: 'Tiny Blossoms',
      ageGroup: 'Infant',
      ageFrom: 0,
      ageTo: 1.5,
      roomNumber: 'Room 102',
      capacity: 15,
      status: 'ACTIVE',
      teacherEmail: 'sarah.ahmed@school.com',
      academicYear: '2024/2027'
    },
    {
      name: 'Toddler Room 1 - Little Explorers',
      subtitle: 'Little Explorers',
      ageGroup: 'Toddler',
      ageFrom: 1.5,
      ageTo: 3,
      roomNumber: 'Room 104',
      capacity: 12,
      status: 'ACTIVE',
      teacherEmail: 'kanya.patel@school.com',
      academicYear: '2024/2027'
    },
    {
      name: 'Toddler Room 2 - Busy Bees',
      subtitle: 'Busy Bees',
      ageGroup: 'Toddler',
      ageFrom: 1.5,
      ageTo: 3.5,
      roomNumber: 'Room 105',
      capacity: 10,
      status: 'ACTIVE',
      teacherEmail: 'marcus.vance@school.com',
      academicYear: '2024/2027'
    },
    {
      name: 'Pre-KG - Sunshine Sprouts',
      subtitle: 'Sunshine Sprouts',
      ageGroup: 'Preschool',
      ageFrom: 3,
      ageTo: 4,
      roomNumber: 'Room 106',
      capacity: 12,
      status: 'ACTIVE',
      teacherEmail: null, // Unassigned
      academicYear: '2024/2027'
    },
    {
      name: 'KG 1 - Little Adventurers',
      subtitle: 'Little Adventurers',
      ageGroup: 'Kindergarten',
      ageFrom: 4,
      ageTo: 5,
      roomNumber: 'Room 108',
      capacity: 14,
      status: 'PLANNING',
      teacherEmail: null, // Unassigned
      academicYear: '2024/2027'
    }
  ];

  const classrooms = [];
  for (const c of classroomsData) {
    // Check if classroom already exists
    const existing = await prisma.classroom.findFirst({
      where: { name: c.name }
    });
    if (existing) {
      classrooms.push(existing);
      console.log(`Classroom "${c.name}" already exists, skipping.`);
      continue;
    }

    let teacherId = null;
    if (c.teacherEmail) {
      const teacher = teachers.find((t) => t.email === c.teacherEmail);
      if (teacher) teacherId = teacher.id;
    }

    const created = await prisma.classroom.create({
      data: {
        name: c.name,
        subtitle: c.subtitle,
        ageGroup: c.ageGroup,
        ageFrom: c.ageFrom,
        ageTo: c.ageTo,
        roomNumber: c.roomNumber,
        capacity: c.capacity,
        status: c.status,
        teacherId,
        academicYear: c.academicYear
      }
    });
    classrooms.push(created);
    console.log(`Created classroom: ${c.name}`);
  }

  // ─── Create Parent Users ──────────────────────────────────────────────────
  const parentPassword = await bcrypt.hash('parent123', 10);
  const parentsData = [
    { name: 'Omar Farid', email: 'omar.farid@parent.com' },
    { name: 'Mona El-Said', email: 'mona.elsaid@parent.com' },
    { name: 'Ahmed Hassan', email: 'ahmed.hassan@parent.com' },
    { name: 'Fatima Ali', email: 'fatima.ali@parent.com' },
    { name: 'Khaled Nour', email: 'khaled.nour@parent.com' }
  ];

  const parents = [];
  for (const p of parentsData) {
    const existing = await prisma.user.findUnique({ where: { email: p.email } });
    if (existing) {
      parents.push(existing);
    } else {
      const created = await prisma.user.create({
        data: {
          name: p.name,
          email: p.email,
          password: parentPassword,
          role: 'PARENT',
          isActive: true
        }
      });
      parents.push(created);
      console.log(`Created parent: ${p.name}`);
    }
  }

  // ─── Create Children and Enroll in Classrooms ────────────────────────────
  const childrenData = [
    // Nursery A children (12 enrolled)
    { firstName: 'Yusuf', lastName: 'Farid', gender: 'Male', dob: '2023-03-15', parentIdx: 0, classroomIdx: 0 },
    { firstName: 'Layla', lastName: 'Farid', gender: 'Female', dob: '2023-06-20', parentIdx: 0, classroomIdx: 0 },
    { firstName: 'Nadia', lastName: 'El-Said', gender: 'Female', dob: '2023-01-10', parentIdx: 1, classroomIdx: 0 },
    { firstName: 'Karim', lastName: 'El-Said', gender: 'Male', dob: '2023-09-05', parentIdx: 1, classroomIdx: 0 },
    { firstName: 'Amira', lastName: 'Hassan', gender: 'Female', dob: '2023-04-12', parentIdx: 2, classroomIdx: 0 },
    { firstName: 'Tariq', lastName: 'Hassan', gender: 'Male', dob: '2023-07-18', parentIdx: 2, classroomIdx: 0 },
    { firstName: 'Salma', lastName: 'Ali', gender: 'Female', dob: '2023-02-25', parentIdx: 3, classroomIdx: 0 },
    { firstName: 'Zain', lastName: 'Ali', gender: 'Male', dob: '2023-08-30', parentIdx: 3, classroomIdx: 0 },
    { firstName: 'Hana', lastName: 'Nour', gender: 'Female', dob: '2023-05-14', parentIdx: 4, classroomIdx: 0 },
    { firstName: 'Bilal', lastName: 'Nour', gender: 'Male', dob: '2023-11-22', parentIdx: 4, classroomIdx: 0 },
    { firstName: 'Sara', lastName: 'Farid', gender: 'Female', dob: '2023-10-01', parentIdx: 0, classroomIdx: 0 },
    { firstName: 'Rami', lastName: 'El-Said', gender: 'Male', dob: '2023-12-08', parentIdx: 1, classroomIdx: 0 },
    // Nursery B children (14 enrolled)
    { firstName: 'Dina', lastName: 'Hassan', gender: 'Female', dob: '2025-01-15', parentIdx: 2, classroomIdx: 1 },
    { firstName: 'Amir', lastName: 'Ali', gender: 'Male', dob: '2025-03-20', parentIdx: 3, classroomIdx: 1 },
    { firstName: 'Lina', lastName: 'Nour', gender: 'Female', dob: '2025-02-10', parentIdx: 4, classroomIdx: 1 },
    { firstName: 'Fadi', lastName: 'Farid', gender: 'Male', dob: '2025-05-05', parentIdx: 0, classroomIdx: 1 },
    { firstName: 'Jana', lastName: 'El-Said', gender: 'Female', dob: '2025-04-12', parentIdx: 1, classroomIdx: 1 },
    { firstName: 'Sami', lastName: 'Hassan', gender: 'Male', dob: '2025-06-18', parentIdx: 2, classroomIdx: 1 },
    { firstName: 'Rana', lastName: 'Ali', gender: 'Female', dob: '2025-07-25', parentIdx: 3, classroomIdx: 1 },
    { firstName: 'Tamer', lastName: 'Nour', gender: 'Male', dob: '2025-08-30', parentIdx: 4, classroomIdx: 1 },
    { firstName: 'Noor', lastName: 'Farid', gender: 'Female', dob: '2025-01-14', parentIdx: 0, classroomIdx: 1 },
    { firstName: 'Hazem', lastName: 'El-Said', gender: 'Male', dob: '2025-03-22', parentIdx: 1, classroomIdx: 1 },
    { firstName: 'Maha', lastName: 'Hassan', gender: 'Female', dob: '2025-09-01', parentIdx: 2, classroomIdx: 1 },
    { firstName: 'Walid', lastName: 'Ali', gender: 'Male', dob: '2025-02-08', parentIdx: 3, classroomIdx: 1 },
    { firstName: 'Reem', lastName: 'Nour', gender: 'Female', dob: '2025-04-16', parentIdx: 4, classroomIdx: 1 },
    { firstName: 'Mostafa', lastName: 'Farid', gender: 'Male', dob: '2025-05-20', parentIdx: 0, classroomIdx: 1 },
    // Toddler Room 1 (12 enrolled - full)
    { firstName: 'Yasmin', lastName: 'Hassan', gender: 'Female', dob: '2023-06-01', parentIdx: 2, classroomIdx: 2 },
    { firstName: 'Ali', lastName: 'Ali', gender: 'Male', dob: '2023-07-15', parentIdx: 3, classroomIdx: 2 },
    { firstName: 'Malak', lastName: 'Nour', gender: 'Female', dob: '2023-08-20', parentIdx: 4, classroomIdx: 2 },
    { firstName: 'Hassan', lastName: 'Farid', gender: 'Male', dob: '2023-09-10', parentIdx: 0, classroomIdx: 2 },
    { firstName: 'Farida', lastName: 'El-Said', gender: 'Female', dob: '2023-10-05', parentIdx: 1, classroomIdx: 2 },
    { firstName: 'Mahmoud', lastName: 'Hassan', gender: 'Male', dob: '2023-11-12', parentIdx: 2, classroomIdx: 2 },
    { firstName: 'Noha', lastName: 'Ali', gender: 'Female', dob: '2023-12-18', parentIdx: 3, classroomIdx: 2 },
    { firstName: 'Adel', lastName: 'Nour', gender: 'Male', dob: '2023-01-25', parentIdx: 4, classroomIdx: 2 },
    { firstName: 'Rania', lastName: 'Farid', gender: 'Female', dob: '2023-02-14', parentIdx: 0, classroomIdx: 2 },
    { firstName: 'Khaled', lastName: 'El-Said', gender: 'Male', dob: '2023-03-22', parentIdx: 1, classroomIdx: 2 },
    { firstName: 'Dalia', lastName: 'Hassan', gender: 'Female', dob: '2023-04-30', parentIdx: 2, classroomIdx: 2 },
    { firstName: 'Tarek', lastName: 'Ali', gender: 'Male', dob: '2023-05-08', parentIdx: 3, classroomIdx: 2 },
    // Toddler Room 2 (8 enrolled)
    { firstName: 'Mariam', lastName: 'Nour', gender: 'Female', dob: '2023-06-15', parentIdx: 4, classroomIdx: 3 },
    { firstName: 'Youssef', lastName: 'Farid', gender: 'Male', dob: '2023-07-20', parentIdx: 0, classroomIdx: 3 },
    { firstName: 'Shadia', lastName: 'El-Said', gender: 'Female', dob: '2023-08-10', parentIdx: 1, classroomIdx: 3 },
    { firstName: 'Seif', lastName: 'Hassan', gender: 'Male', dob: '2023-09-05', parentIdx: 2, classroomIdx: 3 },
    { firstName: 'Leila', lastName: 'Ali', gender: 'Female', dob: '2023-10-12', parentIdx: 3, classroomIdx: 3 },
    { firstName: 'Hamza', lastName: 'Nour', gender: 'Male', dob: '2023-11-18', parentIdx: 4, classroomIdx: 3 },
    { firstName: 'Aisha', lastName: 'Farid', gender: 'Female', dob: '2023-12-25', parentIdx: 0, classroomIdx: 3 },
    { firstName: 'Imad', lastName: 'El-Said', gender: 'Male', dob: '2023-01-30', parentIdx: 1, classroomIdx: 3 },
    // Pre-KG (4 enrolled)
    { firstName: 'Lamia', lastName: 'Hassan', gender: 'Female', dob: '2022-06-14', parentIdx: 2, classroomIdx: 4 },
    { firstName: 'Samir', lastName: 'Ali', gender: 'Male', dob: '2022-09-22', parentIdx: 3, classroomIdx: 4 },
    { firstName: 'Nadine', lastName: 'Nour', gender: 'Female', dob: '2022-11-01', parentIdx: 4, classroomIdx: 4 },
    { firstName: 'Riad', lastName: 'Farid', gender: 'Male', dob: '2022-03-08', parentIdx: 0, classroomIdx: 4 }
  ];

  let childCount = 0;
  for (const ch of childrenData) {
    const existing = await prisma.child.findFirst({
      where: {
        firstName: ch.firstName,
        lastName: ch.lastName,
        parentId: parents[ch.parentIdx].id
      }
    });
    if (existing) {
      // Update classroom if needed
      if (existing.classroomId !== classrooms[ch.classroomIdx].id) {
        await prisma.child.update({
          where: { id: existing.id },
          data: { classroomId: classrooms[ch.classroomIdx].id }
        });
      }
      continue;
    }

    await prisma.child.create({
      data: {
        firstName: ch.firstName,
        lastName: ch.lastName,
        dateOfBirth: new Date(ch.dob),
        gender: ch.gender,
        parentId: parents[ch.parentIdx].id,
        classroomId: classrooms[ch.classroomIdx].id
      }
    });
    childCount++;
  }
  console.log(`Created ${childCount} children and enrolled them in classrooms.`);

  // ─── Create Today's Classroom Sessions ──────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionsData = [
    {
      classroomIdx: 0,
      title: 'Sensory Water & Sand Play',
      description: 'Hands-on sensory exploration with water and sand stations',
      startTime: '10:00',
      endTime: '11:15',
      status: 'IN_PROGRESS'
    },
    {
      classroomIdx: 2,
      title: 'Nursery Rhymes & Movement',
      description: 'Interactive music and movement session with classic nursery rhymes',
      startTime: '10:30',
      endTime: '11:30',
      status: 'IN_PROGRESS'
    },
    {
      classroomIdx: null, // All rooms
      title: 'Wholesome Lunch Service',
      description: 'Nutritious lunch prepared fresh daily',
      startTime: '11:45',
      endTime: '12:45',
      status: 'SCHEDULED'
    },
    {
      classroomIdx: 1,
      title: 'Quiet Slumber & Soft Lullabies',
      description: 'Gentle nap time with calming music',
      startTime: '13:00',
      endTime: '14:30',
      status: 'SCHEDULED'
    }
  ];

  let sessionCount = 0;
  for (const s of sessionsData) {
    // Use first classroom if null (representing all rooms)
    const classroomId = s.classroomIdx !== null
      ? classrooms[s.classroomIdx].id
      : classrooms[0].id;

    const existing = await prisma.classroomSession.findFirst({
      where: {
        classroomId,
        title: s.title,
        date: { gte: today }
      }
    });
    if (existing) continue;

    await prisma.classroomSession.create({
      data: {
        classroomId,
        title: s.title,
        description: s.description,
        date: today,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status
      }
    });
    sessionCount++;
  }
  console.log(`Created ${sessionCount} classroom sessions.`);

  console.log('\n✅ Classroom seed completed successfully!');
  console.log('─────────────────────────────────────────');
  console.log(`Teachers: ${teachers.length}`);
  console.log(`Classrooms: ${classrooms.length}`);
  console.log(`Children enrolled: ${childCount}`);
  console.log(`Sessions: ${sessionCount}`);
}

seedClassrooms()
  .catch((e) => {
    console.error('Error seeding classrooms:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
