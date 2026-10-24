const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedStaff() {
  console.log('Seeding Staff Management data...');

  const hashedPassword = await bcrypt.hash('staff123', 10);

  // 1. Fetch classrooms to associate
  const classrooms = await prisma.classroom.findMany();
  const classMap = {};
  classrooms.forEach((c) => {
    classMap[c.name] = c.id;
  });

  const staffMembersData = [
    {
      name: 'Sarah Ahmed',
      email: 'sarah.ahmed@tomjerrynursery.com',
      staffRole: 'Lead Teacher',
      phone: '+1 (555) 234-8901',
      className: 'Nursery A - Little Seedlings',
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Marcus Vance',
      email: 'm.vance@tomjerrynursery.com',
      staffRole: 'Teacher',
      phone: '+1 (555) 876-1234',
      className: 'Toddler Room 2 - Busy Bees',
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@tomjerrynursery.com',
      staffRole: 'Early Educator',
      phone: '+1 (555) 345-6789',
      className: 'Nursery B - Tiny Blossoms',
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'David Miller',
      email: 'david.miller@tomjerrynursery.com',
      staffRole: 'Assistant Teacher',
      phone: '+1 (555) 981-2345',
      className: null, // Unassigned (Cover Pool)
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Aanaya Patel',
      email: 'aanaya.patel@tomjerrynursery.com',
      staffRole: 'Nursery Nurse / First Aid',
      phone: '+1 (555) 492-1898',
      className: null,
      staffScope: 'ALL_ROOMS', // All Rooms (Staff Care)
      isActive: true
    },
    {
      name: 'Tariq Al-Mansoor',
      email: 'tariq.m@tomjerrynursery.com',
      staffRole: 'Kindergarten Lead',
      phone: '+1 (555) 678-9912',
      className: 'KG 1 - Little Adventurers',
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Lina Hassan',
      email: 'lina.hassan@tomjerrynursery.com',
      staffRole: 'Teacher',
      phone: '+1 (555) 112-3344',
      className: 'Toddler Room 1 - Little Explorers',
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'David Kim',
      email: 'david.kim@tomjerrynursery.com',
      staffRole: 'Early Educator',
      phone: '+1 (555) 223-4455',
      className: 'Pre-KG - Sunshine Sprouts',
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Fatima Zahra',
      email: 'fatima.z@tomjerrynursery.com',
      staffRole: 'Assistant Teacher',
      phone: '+1 (555) 334-5566',
      className: null, // Cover Pool
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Nour Ibrahim',
      email: 'nour.i@tomjerrynursery.com',
      staffRole: 'Teacher',
      phone: '+1 (555) 445-6677',
      className: null,
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Layla Mahmoud',
      email: 'layla.m@tomjerrynursery.com',
      staffRole: 'Early Educator',
      phone: '+1 (555) 556-7788',
      className: null,
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Kareem Mostafa',
      email: 'kareem.m@tomjerrynursery.com',
      staffRole: 'Assistant Teacher',
      phone: '+1 (555) 667-8899',
      className: null,
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Yara Mansour',
      email: 'yara.m@tomjerrynursery.com',
      staffRole: 'Teacher',
      phone: '+1 (555) 778-9900',
      className: null,
      staffScope: 'CLASSROOM',
      isActive: true
    },
    {
      name: 'Hani Adel',
      email: 'hani.a@tomjerrynursery.com',
      staffRole: 'Assistant Teacher',
      phone: '+1 (555) 889-0011',
      className: null,
      staffScope: 'CLASSROOM',
      isActive: false
    }
  ];

  let count = 0;
  for (const s of staffMembersData) {
    const existing = await prisma.user.findUnique({ where: { email: s.email } });
    let staffUser;
    if (existing) {
      staffUser = await prisma.user.update({
        where: { id: existing.id },
        data: {
          phone: s.phone,
          staffRole: s.staffRole,
          staffScope: s.staffScope,
          isActive: s.isActive
        }
      });
      console.log(`Updated staff member: ${s.name}`);
    } else {
      staffUser = await prisma.user.create({
        data: {
          name: s.name,
          email: s.email,
          phone: s.phone,
          staffRole: s.staffRole,
          staffScope: s.staffScope,
          role: 'TEACHER',
          password: hashedPassword,
          isActive: s.isActive
        }
      });
      console.log(`Created staff member: ${s.name}`);
    }

    // Assign to classroom if specified
    if (s.className && classMap[s.className]) {
      await prisma.classroom.update({
        where: { id: classMap[s.className] },
        data: { teacherId: staffUser.id }
      });
    }

    count++;
  }

  console.log(`\n✅ Finished seeding ${count} staff members!`);
}

seedStaff()
  .catch((e) => {
    console.error('Error seeding staff:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
