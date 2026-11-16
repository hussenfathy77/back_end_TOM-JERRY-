const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Teacher Portal & Daily Attendance with exact UI screenshot data...');

  const hashedPassword = await bcrypt.hash('staff123', 10);
  const parentHashedPassword = await bcrypt.hash('parent123', 10);

  // 1. Teacher: Ms. Claire Bennett
  const teacher = await prisma.user.upsert({
    where: { email: 'claire.bennett@tomjerrynursery.com' },
    update: {
      name: 'Claire Bennett',
      staffRole: 'Lead Educator (Nursery Staff)',
      staffScope: 'CLASSROOM',
      employmentType: 'Full-Time Regular',
      employmentStatus: 'Active',
      isActive: true
    },
    create: {
      name: 'Claire Bennett',
      email: 'claire.bennett@tomjerrynursery.com',
      password: hashedPassword,
      phone: '+1 (555) 914-7720',
      role: 'TEACHER',
      staffRole: 'Lead Educator (Nursery Staff)',
      staffScope: 'CLASSROOM',
      employmentType: 'Full-Time Regular',
      employmentStatus: 'Active',
      isActive: true
    }
  });

  console.log('Teacher ready:', teacher.name, teacher.email);

  // 2. Parents
  const parent = await prisma.user.upsert({
    where: { email: 'parent.portal@example.com' },
    update: {},
    create: {
      name: 'Sofia Torres',
      email: 'parent.portal@example.com',
      password: parentHashedPassword,
      phone: '+1 (555) 019-8230',
      role: 'PARENT',
      isActive: true
    }
  });

  // 3. Classrooms: KG1 - Class A (Butterflies) & KG2 - Class B (Robins)
  const classA = await prisma.classroom.upsert({
    where: { id: 'class-k01-room102' },
    update: {
      name: 'KG1 - Class A',
      badge: 'Butterflies',
      subtitle: 'Studio Classroom Room 102',
      description: 'Morning toddler playgroup focusing on sensory development and creative play.',
      ageGroup: 'Early Years',
      ageFrom: 2,
      ageTo: 3,
      roomNumber: 'Room 102',
      capacity: 18,
      assistantTeacherName: 'Emma Watson',
      status: 'ACTIVE',
      academicYear: '2026/2027',
      teacherId: teacher.id
    },
    create: {
      id: 'class-k01-room102',
      name: 'KG1 - Class A',
      badge: 'Butterflies',
      subtitle: 'Studio Classroom Room 102',
      description: 'Morning toddler playgroup focusing on sensory development and creative play.',
      ageGroup: 'Early Years',
      ageFrom: 2,
      ageTo: 3,
      roomNumber: 'Room 102',
      capacity: 18,
      assistantTeacherName: 'Emma Watson',
      status: 'ACTIVE',
      academicYear: '2026/2027',
      teacherId: teacher.id
    }
  });

  const classB = await prisma.classroom.upsert({
    where: { id: 'class-k02-room102' },
    update: {
      name: 'KG2 - Class B',
      badge: 'Robins',
      subtitle: 'Preschool & Theatre Studio',
      description: 'Afternoon foundation stage discovery studio focusing on storytelling, outdoor play and motor skills.',
      ageGroup: 'Foundation Stage',
      ageFrom: 4,
      ageTo: 5,
      roomNumber: 'Room 105',
      capacity: 20,
      assistantTeacherName: 'Liam Gallagher',
      status: 'ACTIVE',
      academicYear: '2026/2027',
      teacherId: teacher.id
    },
    create: {
      id: 'class-k02-room102',
      name: 'KG2 - Class B',
      badge: 'Robins',
      subtitle: 'Preschool & Theatre Studio',
      description: 'Afternoon foundation stage discovery studio focusing on storytelling, outdoor play and motor skills.',
      ageGroup: 'Foundation Stage',
      ageFrom: 4,
      ageTo: 5,
      roomNumber: 'Room 105',
      capacity: 20,
      assistantTeacherName: 'Liam Gallagher',
      status: 'ACTIVE',
      academicYear: '2026/2027',
      teacherId: teacher.id
    }
  });

  console.log('Classrooms ready:', classA.name, classB.name);

  // 4. Exact 16 Children for KG1 - Class A (Butterflies)
  // Matching screenshot rows (Page 1 has 8, Page 2 has 8):
  // 14 Present, 1 Absent (Noah Klein), 1 Late (Theo Robinson) = 16 Enrolled (Capacity: 18)
  const rosterData = [
    {
      studentId: '#TJN-2024-041',
      firstName: 'Maya',
      lastName: 'Torres',
      dob: '2022-07-15',
      gender: 'Female',
      status: 'PRESENT',
      arrivalTime: '08:45 AM',
      guardianName: 'Grandma Elena',
      guardianRelation: 'Grandmother',
      pickupNote: 'Pickup: Grandma Elena',
      specialCareNote: 'Pickup: Grandma Elena',
      isAllergy: true,
      isMedical: false,
      isUrgent: false
    },
    {
      studentId: '#TJN-2024-058',
      firstName: 'Leo',
      lastName: 'Davies',
      dob: '2022-09-10',
      gender: 'Male',
      status: 'PRESENT',
      arrivalTime: '08:32 AM',
      guardianName: 'Elena W.',
      guardianRelation: 'Grandma',
      pickupNote: 'Inhaler on file',
      specialCareNote: '⚠️ Peanut Allergy Alert • Inhaler on file',
      isAllergy: true,
      isMedical: true,
      isUrgent: true
    },
    {
      studentId: '#TJN-2024-019',
      firstName: 'Noah',
      lastName: 'Klein',
      dob: '2022-10-15',
      gender: 'Male',
      status: 'ABSENT',
      arrivalTime: 'Notified 07:45 AM',
      guardianName: 'Parents',
      guardianRelation: 'Parent',
      pickupNote: 'Doctor note verified: Mild fever',
      specialCareNote: 'Noah Klein (Illness)',
      isExcused: true,
      isMedical: true,
      isUrgent: true
    },
    {
      studentId: '#TJN-2024-042',
      firstName: 'Theo',
      lastName: 'Robinson',
      dob: '2022-06-20',
      gender: 'Male',
      status: 'LATE',
      arrivalTime: '09:35 AM',
      guardianName: 'Mark R.',
      guardianRelation: 'Dad',
      pickupNote: 'Dentist appointment: Arrived 09:35',
      specialCareNote: 'Dentist appointment: Arrived 09:35',
      isAllergy: false,
      isMedical: false,
      isUrgent: false
    },
    {
      studentId: '#TJN-2024-033',
      firstName: 'Chloe',
      lastName: 'Bennett-Smith',
      dob: '2022-11-18',
      gender: 'Female',
      status: 'PRESENT',
      arrivalTime: '08:40 AM',
      guardianName: 'Rachel B.',
      guardianRelation: 'Mom',
      pickupNote: 'Authorized pickup',
      specialCareNote: 'Dairy intolerance (oat milk only)',
      isAllergy: false,
      isMedical: false,
      isUrgent: false
    },
    {
      studentId: '#TJN-2024-077',
      firstName: 'Oliver',
      lastName: 'Wong',
      dob: '2022-08-05',
      gender: 'Male',
      status: 'PRESENT',
      arrivalTime: '08:39 AM',
      guardianName: 'David W.',
      guardianRelation: 'Father',
      pickupNote: 'Carpool with Sophia Chen',
      specialCareNote: 'Carpool with Sophia Chen',
      isAllergy: false,
      isMedical: false,
      isUrgent: false
    },
    {
      studentId: '#TJN-2024-073',
      firstName: 'Lucas',
      lastName: 'Miller',
      dob: '2022-05-12',
      gender: 'Male',
      status: 'PRESENT',
      arrivalTime: '08:35 AM',
      guardianName: 'Aunt Sarah',
      guardianRelation: 'Guardian',
      pickupNote: 'After-school craft club (until 4:30 PM)',
      specialCareNote: 'After-school craft club (until 4:30 PM)',
      isAllergy: false,
      isMedical: false,
      isUrgent: false
    },
    {
      studentId: '#TJN-2024-381',
      firstName: 'Sophia',
      lastName: 'Chen',
      dob: '2022-08-28',
      gender: 'Female',
      status: 'PRESENT',
      arrivalTime: '08:36 AM',
      guardianName: 'David Chen',
      guardianRelation: 'Dad',
      pickupNote: 'Authorized pickup: Father (David Chen)',
      specialCareNote: 'Authorized pickup: Father (David Chen)',
      isAllergy: false,
      isMedical: false,
      isUrgent: false
    },
    {
      studentId: '#TJN-2024-015',
      firstName: 'Adam',
      lastName: 'Ahmed',
      dob: '2022-10-01',
      gender: 'Male',
      status: 'PRESENT',
      arrivalTime: '08:42 AM',
      guardianName: 'Sara A.',
      guardianRelation: 'Mom',
      pickupNote: 'Regular pickup',
      specialCareNote: 'Standard morning check completed'
    },
    {
      studentId: '#TJN-2024-012',
      firstName: 'Emma',
      lastName: 'Johnson',
      dob: '2022-07-28',
      gender: 'Female',
      status: 'PRESENT',
      arrivalTime: '08:48 AM',
      guardianName: 'Claire J.',
      guardianRelation: 'Mom',
      pickupNote: 'Regular pickup',
      specialCareNote: 'Standard morning check completed'
    },
    {
      studentId: '#TJN-2024-025',
      firstName: 'Ethan',
      lastName: 'Davis',
      dob: '2022-08-14',
      gender: 'Male',
      status: 'PRESENT',
      arrivalTime: '08:50 AM',
      guardianName: 'Lisa D.',
      guardianRelation: 'Mom',
      pickupNote: 'Regular pickup',
      specialCareNote: 'Standard morning check completed'
    },
    {
      studentId: '#TJN-2024-030',
      firstName: 'Ava',
      lastName: 'Taylor',
      dob: '2022-09-20',
      gender: 'Female',
      status: 'PRESENT',
      arrivalTime: '08:38 AM',
      guardianName: 'James T.',
      guardianRelation: 'Dad',
      pickupNote: 'Regular pickup',
      specialCareNote: 'Standard morning check completed'
    },
    {
      studentId: '#TJN-2024-036',
      firstName: 'Liam',
      lastName: 'Wilson',
      dob: '2022-06-30',
      gender: 'Male',
      status: 'PRESENT',
      arrivalTime: '08:52 AM',
      guardianName: 'Emily W.',
      guardianRelation: 'Mom',
      pickupNote: 'Regular pickup',
      specialCareNote: 'Standard morning check completed'
    },
    {
      studentId: '#TJN-2024-048',
      firstName: 'Mia',
      lastName: 'Anderson',
      dob: '2022-08-12',
      gender: 'Female',
      status: 'PRESENT',
      arrivalTime: '08:44 AM',
      guardianName: 'Paul A.',
      guardianRelation: 'Dad',
      pickupNote: 'Regular pickup',
      specialCareNote: 'Standard morning check completed'
    },
    {
      studentId: '#TJN-2024-052',
      firstName: 'Henry',
      lastName: 'Thomas',
      dob: '2022-09-08',
      gender: 'Male',
      status: 'PRESENT',
      arrivalTime: '08:46 AM',
      guardianName: 'Grace T.',
      guardianRelation: 'Mom',
      pickupNote: 'Regular pickup',
      specialCareNote: 'Standard morning check completed'
    },
    {
      studentId: '#TJN-2024-061',
      firstName: 'Isabella',
      lastName: 'White',
      dob: '2022-07-04',
      gender: 'Female',
      status: 'PRESENT',
      arrivalTime: '08:40 AM',
      guardianName: 'Thomas W.',
      guardianRelation: 'Dad',
      pickupNote: 'Regular pickup',
      specialCareNote: 'Standard morning check completed'
    }
  ];

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  for (const item of rosterData) {
    let child = await prisma.child.findFirst({
      where: { firstName: item.firstName, lastName: item.lastName, classroomId: classA.id }
    });

    if (!child) {
      child = await prisma.child.create({
        data: {
          studentId: item.studentId,
          firstName: item.firstName,
          lastName: item.lastName,
          dateOfBirth: new Date(item.dob),
          gender: item.gender,
          parentId: parent.id,
          classroomId: classA.id
        }
      });
    } else {
      await prisma.child.update({
        where: { id: child.id },
        data: { studentId: item.studentId }
      });
    }

    if (item.specialCareNote) {
      const existingCare = await prisma.childCareNote.findFirst({ where: { childId: child.id } });
      if (!existingCare) {
        await prisma.childCareNote.create({
          data: {
            childId: child.id,
            note: item.specialCareNote,
            isAllergy: Boolean(item.isAllergy),
            isMedical: Boolean(item.isMedical),
            isUrgent: Boolean(item.isUrgent),
            createdById: teacher.id
          }
        });
      }
    }

    // Attendance record
    const existingAtt = await prisma.attendance.findFirst({
      where: { childId: child.id, date: { gte: todayStart } }
    });

    if (!existingAtt) {
      await prisma.attendance.create({
        data: {
          childId: child.id,
          status: item.status,
          arrivalTime: item.arrivalTime,
          guardianName: item.guardianName,
          guardianRelation: item.guardianRelation,
          pickupNote: item.pickupNote,
          specialCareNote: item.specialCareNote,
          isExcused: Boolean(item.isExcused),
          session: 'Morning Session',
          date: new Date()
        }
      });
    } else {
      await prisma.attendance.update({
        where: { id: existingAtt.id },
        data: {
          status: item.status,
          arrivalTime: item.arrivalTime,
          guardianName: item.guardianName,
          guardianRelation: item.guardianRelation,
          pickupNote: item.pickupNote,
          specialCareNote: item.specialCareNote,
          isExcused: Boolean(item.isExcused),
          session: 'Morning Session'
        }
      });
    }
  }

  // 4b. Exact 18 Children for KG2 - Class B (Robins)
  // Matching screenshot rows:
  // 17 Present, 1 Late Arrival = 18 Enrolled (Capacity: 20)
  // Total across 2 classes: 16 + 18 = 34 Children Today ("34 In Care")
  // Total Checked-In: 15 (KG1) + 17 (KG2) = 32 ("32 / 34 Checked-in (94%)")
  const rosterDataKG2 = [
    { studentId: '#TJN-2024-101', firstName: 'Benjamin', lastName: 'Taylor', dob: '2021-05-14', gender: 'Male', status: 'PRESENT', arrivalTime: '08:30 AM', guardianName: 'Sarah T.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-102', firstName: 'Charlotte', lastName: 'Brown', dob: '2021-08-20', gender: 'Female', status: 'PRESENT', arrivalTime: '08:35 AM', guardianName: 'David B.', guardianRelation: 'Dad', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-103', firstName: 'Daniel', lastName: 'Harris', dob: '2021-06-11', gender: 'Male', status: 'PRESENT', arrivalTime: '08:40 AM', guardianName: 'Laura H.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-104', firstName: 'Ella', lastName: 'Martinez', dob: '2021-09-03', gender: 'Female', status: 'PRESENT', arrivalTime: '08:42 AM', guardianName: 'Carlos M.', guardianRelation: 'Dad', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-105', firstName: 'Felix', lastName: 'Clark', dob: '2021-04-18', gender: 'Male', status: 'PRESENT', arrivalTime: '08:45 AM', guardianName: 'Anna C.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-106', firstName: 'Grace', lastName: 'Lewis', dob: '2021-11-25', gender: 'Female', status: 'PRESENT', arrivalTime: '08:38 AM', guardianName: 'Mark L.', guardianRelation: 'Dad', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-107', firstName: 'Harper', lastName: 'Robinson', dob: '2021-07-09', gender: 'Female', status: 'PRESENT', arrivalTime: '08:44 AM', guardianName: 'Jessica R.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-108', firstName: 'Isaac', lastName: 'Walker', dob: '2021-03-30', gender: 'Male', status: 'PRESENT', arrivalTime: '08:46 AM', guardianName: 'Brian W.', guardianRelation: 'Dad', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-109', firstName: 'Jack', lastName: 'Hall', dob: '2021-10-15', gender: 'Male', status: 'PRESENT', arrivalTime: '08:48 AM', guardianName: 'Rachel H.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-110', firstName: 'Lily', lastName: 'Young', dob: '2021-05-22', gender: 'Female', status: 'PRESENT', arrivalTime: '08:32 AM', guardianName: 'Steven Y.', guardianRelation: 'Dad', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-111', firstName: 'Mason', lastName: 'King', dob: '2021-12-05', gender: 'Male', status: 'PRESENT', arrivalTime: '08:50 AM', guardianName: 'Amanda K.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-112', firstName: 'Nora', lastName: 'Scott', dob: '2021-08-17', gender: 'Female', status: 'PRESENT', arrivalTime: '08:52 AM', guardianName: 'Kevin S.', guardianRelation: 'Dad', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-113', firstName: 'Owen', lastName: 'Green', dob: '2021-06-28', gender: 'Male', status: 'PRESENT', arrivalTime: '08:36 AM', guardianName: 'Megan G.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-114', firstName: 'Penelope', lastName: 'Baker', dob: '2021-02-14', gender: 'Female', status: 'PRESENT', arrivalTime: '08:41 AM', guardianName: 'Justin B.', guardianRelation: 'Dad', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-115', firstName: 'Ryan', lastName: 'Adams', dob: '2021-09-19', gender: 'Male', status: 'PRESENT', arrivalTime: '08:43 AM', guardianName: 'Nicole A.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-116', firstName: 'Sophia', lastName: 'Nelson', dob: '2021-04-02', gender: 'Female', status: 'PRESENT', arrivalTime: '08:47 AM', guardianName: 'Andrew N.', guardianRelation: 'Dad', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-117', firstName: 'Thomas', lastName: 'Carter', dob: '2021-10-31', gender: 'Male', status: 'PRESENT', arrivalTime: '08:49 AM', guardianName: 'Stephanie C.', guardianRelation: 'Mom', pickupNote: 'Regular pickup' },
    { studentId: '#TJN-2024-118', firstName: 'Zoe', lastName: 'Mitchell', dob: '2021-07-27', gender: 'Female', status: 'LATE', arrivalTime: '09:10 AM', guardianName: 'Peter M.', guardianRelation: 'Dad', pickupNote: 'Late arrival note on file', specialCareNote: '1 Late Arrival' }
  ];

  for (const item of rosterDataKG2) {
    let child = await prisma.child.findFirst({
      where: { firstName: item.firstName, lastName: item.lastName, classroomId: classB.id }
    });

    if (!child) {
      child = await prisma.child.create({
        data: {
          studentId: item.studentId,
          firstName: item.firstName,
          lastName: item.lastName,
          dateOfBirth: new Date(item.dob),
          gender: item.gender,
          parentId: parent.id,
          classroomId: classB.id
        }
      });
    } else {
      await prisma.child.update({
        where: { id: child.id },
        data: { studentId: item.studentId }
      });
    }

    if (item.specialCareNote) {
      const existingCare = await prisma.childCareNote.findFirst({ where: { childId: child.id } });
      if (!existingCare) {
        await prisma.childCareNote.create({
          data: {
            childId: child.id,
            note: item.specialCareNote,
            isAllergy: Boolean(item.isAllergy),
            isMedical: Boolean(item.isMedical),
            isUrgent: Boolean(item.isUrgent),
            createdById: teacher.id
          }
        });
      }
    }

    const existingAtt = await prisma.attendance.findFirst({
      where: { childId: child.id, date: { gte: todayStart } }
    });

    if (!existingAtt) {
      await prisma.attendance.create({
        data: {
          childId: child.id,
          status: item.status,
          arrivalTime: item.arrivalTime,
          guardianName: item.guardianName,
          guardianRelation: item.guardianRelation,
          pickupNote: item.pickupNote,
          specialCareNote: item.specialCareNote,
          isExcused: Boolean(item.isExcused),
          session: 'Morning Session',
          date: new Date()
        }
      });
    } else {
      await prisma.attendance.update({
        where: { id: existingAtt.id },
        data: {
          status: item.status,
          arrivalTime: item.arrivalTime,
          guardianName: item.guardianName,
          guardianRelation: item.guardianRelation,
          pickupNote: item.pickupNote,
          specialCareNote: item.specialCareNote,
          isExcused: Boolean(item.isExcused),
          session: 'Morning Session'
        }
      });
    }
  }

  // 5. Today's Theme & Weather
  const existingTheme = await prisma.dailyTheme.findFirst({
    where: { classroomId: classA.id, date: { gte: todayStart } }
  });

  if (!existingTheme) {
    await prisma.dailyTheme.create({
      data: {
        classroomId: classA.id,
        theme: 'Happy & Energetic',
        weeklyTheme: 'Spring Sensory Garden',
        weeklyProgress: 'Day 3 of 4 Complete',
        weather: 'Sunny 21°C',
        mood: 'Positive & Playful',
        color: '#10B981',
        emoji: '🌟',
        notes: 'Children explore outdoor soil, petals, and water textures during afternoon session.',
        createdById: teacher.id
      }
    });
  }

  // 6. Routine Items (Matching Daily Schedule Timeline)
  const sampleRoutines = [
    {
      title: 'Morning Circle & Sensory Play',
      description: 'Sing-along welcome, nursery rhymes, and soft textured block building (KG1 & KG2).',
      category: 'MORNING_CIRCLE',
      location: 'Room 101 Playroom',
      startTime: '09:00 AM',
      endTime: '10:15 AM',
      status: 'Completed',
      isCompleted: true,
      tags: ['Sing-along', 'Sensory Play']
    },
    {
      title: 'Healthy Lunch & Handwashing',
      description: 'Steamed sweet peas, whole grain pasta with mild marinara. Foster self-feeding habits.',
      category: 'MEAL_NAP',
      location: 'Main Dining Area',
      startTime: '11:30 AM',
      endTime: '12:30 PM',
      status: 'Up Next',
      isCompleted: false,
      tags: ['Nutrition', 'Self-Feeding']
    },
    {
      title: 'Quiet Nap & Storytime',
      description: "Soft lulling music, fairy lights dimming, and reading 'The Little Blue House'.",
      category: 'STORYTIME',
      location: 'Nap Studio R1 & R2',
      startTime: '12:45 PM',
      endTime: '02:15 PM',
      status: 'Scheduled',
      isCompleted: false,
      tags: ['Rest', 'Storytime']
    },
    {
      title: 'Outdoor Garden & Creative Crafts',
      description: 'Leaf stamping, fresh air sandbox, and preparing children for guardian pickup.',
      category: 'OUTDOOR_CREATIVE',
      location: 'Nursery Garden Studio',
      startTime: '02:30 PM',
      endTime: '03:30 PM',
      status: 'Scheduled',
      isCompleted: false,
      tags: ['Outdoor Play', 'Motor Skills']
    }
  ];

  for (const r of sampleRoutines) {
    const existingRoutine = await prisma.classRoutine.findFirst({
      where: { classroomId: classA.id, title: r.title, date: { gte: todayStart } }
    });

    if (!existingRoutine) {
      await prisma.classRoutine.create({
        data: {
          classroomId: classA.id,
          teacherId: teacher.id,
          title: r.title,
          description: r.description,
          category: r.category,
          location: r.location,
          startTime: r.startTime,
          endTime: r.endTime,
          status: r.status,
          isCompleted: r.isCompleted,
          tags: r.tags,
          date: new Date()
        }
      });
    }
  }

  // 7. Teacher's Note
  const existingNote = await prisma.teacherNote.findFirst({
    where: { teacherId: teacher.id, title: "Teacher's Note Pad" }
  });

  if (!existingNote) {
    await prisma.teacherNote.create({
      data: {
        teacherId: teacher.id,
        classroomId: classA.id,
        type: 'CLASSROOM_NOTE',
        title: "Teacher's Note Pad",
        content: "Remember to ask parents from group K01 to send back consent forms for next week's botanical garden trip. Check on Emma's finger paint sensory worksheet catalog.",
        isPinned: true
      }
    });
  }

  // 8. Notices
  const sampleNotices = [
    {
      title: 'Botanical Garden Field Trip',
      content: 'Next Tuesday, 10/14 permission slips signed.',
      icon: 'garden'
    },
    {
      title: 'Art Smocks Restocked',
      content: 'Fresh washed aprons available in Storage Cubicle B.',
      icon: 'check'
    }
  ];

  for (const n of sampleNotices) {
    const existingNotice = await prisma.classroomNotice.findFirst({
      where: { title: n.title }
    });

    if (!existingNotice) {
      await prisma.classroomNotice.create({
        data: {
          classroomId: classA.id,
          title: n.title,
          content: n.content,
          icon: n.icon,
          createdById: teacher.id
        }
      });
    }
  }

  // 9. Daily Activities for Maya Torres (Matching Daily Activities Management UI)
  const maya = await prisma.child.findFirst({
    where: { firstName: 'Maya', lastName: 'Torres', classroomId: classA.id }
  });

  if (maya) {
    // 9a. Food & Nutrition: Breakfast, Lunch, Afternoon Snack
    const meals = [
      {
        mealType: 'BREAKFAST',
        time: '08:45 AM',
        menuDescription: 'Oatmeal with sliced strawberries & whole milk',
        portion: 'All',
        mealStatus: 'ALL_EATEN'
      },
      {
        mealType: 'LUNCH',
        time: '11:30 AM',
        menuDescription: 'Warm sweet potato soup & wholewheat soft roll',
        portion: 'Most',
        mealStatus: 'SOME_EATEN'
      },
      {
        mealType: 'SNACK',
        time: '02:40 PM',
        menuDescription: 'Sliced organic honeycrisp apples & oat crackers (peanut-free)',
        portion: 'All',
        mealStatus: 'ALL_EATEN'
      }
    ];

    for (const m of meals) {
      const existingMeal = await prisma.dailyActivity.findFirst({
        where: { childId: maya.id, mealType: m.mealType, date: { gte: todayStart } }
      });

      if (!existingMeal) {
        await prisma.dailyActivity.create({
          data: {
            childId: maya.id,
            mealType: m.mealType,
            mealStatus: m.mealStatus,
            menuDescription: m.menuDescription,
            portion: m.portion,
            time: m.time,
            waterCups: 4,
            dietaryNotes: 'Drank plenty of water; asked for seconds of crisp apple slices. Finished all oatmeal happily.',
            dietaryStatus: 'Dietary Normal',
            loggedById: teacher.id,
            date: new Date()
          }
        });
      }
    }

    // 9b. Sleep & Rest Routine
    const existingNap = await prisma.napLog.findFirst({
      where: { childId: maya.id, date: { gte: todayStart } }
    });

    if (!existingNap) {
      await prisma.napLog.create({
        data: {
          childId: maya.id,
          startTime: '12:45 PM',
          endTime: '02:15 PM',
          durationMin: 90,
          status: 'SLEEPING',
          restQuality: 'Took Nap',
          cotNumber: 'Cot #12 Assigned',
          notes: 'Fell asleep gently after soft storytime hums. Woke up cheerful and refreshed.',
          loggedById: teacher.id,
          date: new Date()
        }
      });
    }

    // 9c. Mood & Wellbeing
    const existingMood = await prisma.childMoodLog.findFirst({
      where: { childId: maya.id, date: { gte: todayStart } }
    });

    if (!existingMood) {
      await prisma.childMoodLog.create({
        data: {
          childId: maya.id,
          mood: 'HAPPY',
          overallStatus: 'Excellent',
          behavioralHighlights: [
            'Eager to share',
            'Comfortable with peers',
            'Enjoyed circle time'
          ],
          notes: 'Happy & smiling throughout circle time activities.',
          loggedById: teacher.id,
          date: new Date()
        }
      });
    }

    // 9d. Learning & Developmental Notes
    const existingDev = await prisma.developmentalObservation.findFirst({
      where: { childId: maya.id, date: { gte: todayStart } }
    });

    if (!existingDev) {
      await prisma.developmentalObservation.create({
        data: {
          childId: maya.id,
          curriculumCategory: 'Montessori Sensory',
          curriculumNotes: 'Practiced recognizing letters A, B, and C with textured sandpaper cards. Counted 5 wooden acorn blocks independently.',
          outdoorCategory: 'Art & Nature',
          outdoorNotes: 'Participated enthusiastically in group coloring and outdoor autumn leaf rubbing activity with classmates in the garden classroom.',
          teacherObservation: 'Maya showed great empathy today by helping Leo share sensory clay. She was attentive during circle time story session.',
          isSyncedToParent: true,
          loggedById: teacher.id,
          date: new Date()
        }
      });
    }
  }

  console.log('✅ Daily Attendance, Activities & Teacher Portal seeded with 100% exact UI data!');
}

main()
  .catch((e) => {
    console.error('Error seeding Daily Attendance:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
