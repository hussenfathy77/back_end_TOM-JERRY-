const prisma = require('../config/database');

// ─── GET COMPLETE LANDING PAGE DATA (Public) ────────────────────────────────
const getLandingPageData = async (req, res, next) => {
  try {
    // 1. Fetch active announcements for the top banner
    const latestAnnouncement = await prisma.announcement.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch active curriculum programs from DB
    const dbPrograms = await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    // Fallback/Default programs matching the screenshot if DB has few
    const defaultPrograms = [
      {
        id: 'prog-1',
        title: 'Caring Environment',
        description: 'A gentle, safe introduction to the world outside home, focused on emotional security, sensory discoveries, self-help routines, and responsive nurturing.',
        ageGroup: 'Ages 1 - 2.5 yrs',
        schedule: 'Daily 8h-4pm',
        category: 'Infant & Toddler'
      },
      {
        id: 'prog-2',
        title: 'Learning Through Play',
        description: 'Hands-on sensory exploration, motor skills and guided play sessions designed to build confidence, early language, fine motor skills, and foundational social skills.',
        ageGroup: 'Toddlers 2 - 3.5 yrs',
        schedule: 'Daily 8h-4pm',
        category: 'Toddlers'
      },
      {
        id: 'prog-3',
        title: 'Creativity & Exploration',
        description: 'Early STEAM activities, pre-literacy storytelling, rhythm and creative music, outdoor nature discovery, and early kindergarten transition skills.',
        ageGroup: 'Preschool 3 - 5 yrs',
        schedule: 'Half / Full Day',
        category: 'Preschool & KG'
      }
    ];

    const programs = dbPrograms.length > 0 ? dbPrograms : defaultPrograms;

    // 3. Count total active classrooms and available seats for live stats
    const classrooms = await prisma.classroom.findMany({
      where: { status: 'ACTIVE' },
      include: { _count: { select: { children: true } } }
    });
    const totalCapacity = classrooms.reduce((acc, c) => acc + c.capacity, 0);
    const totalEnrolled = classrooms.reduce((acc, c) => acc + c._count.children, 0);
    const availableSeats = Math.max(0, totalCapacity - totalEnrolled);

    // 4. Construct complete response matching screenshot
    const landingData = {
      nursery: {
        name: 'Tom & Jerry Nursery',
        badge: 'Gentle Early Learning & Childcare',
        tagline: 'A happy, caring, and engaging environment where little learners explore, play, and grow with confidence, safety, and joy every single day.',
        topAnnouncement: latestAnnouncement?.title || 'Now enrolling for 2026/2027 academic term! Early bird registration available.',
        operatingHours: 'Mon - Fri, 7:30 AM - 6:00 PM',
        location: 'Brookville Center • 123 Nursery Lane',
        phone: '+1 (555) 234-8901',
        email: 'contact@tomjerrynursery.com',
        academicYear: '2026/2027'
      },

      heroStats: {
        familiesCount: '200+',
        familiesLabel: 'Trusted by 200+ local families',
        rating: '4.9/5',
        standardsBadge: 'British EYFS Framework Compliant',
        availableSeats,
        activeClassrooms: classrooms.length
      },

      corePillars: {
        heading: 'A Little Place for Big Dreams',
        description: 'At Tom & Jerry Nursery, we nurture lifelong learning journeys with warm care, dedicated qualified educators, and modern learning spaces.',
        pillars: [
          {
            id: 'pillar-warm-care',
            title: 'Warm Care',
            description: 'Every child is greeted with open arms in a nurturing, safe environment where physical comfort, emotional reassurance, and individual attention come first.',
            icon: 'heart'
          },
          {
            id: 'pillar-early-discovery',
            title: 'Early Discovery',
            description: 'Inspiring curious minds in the heart of early childhood. We spark curiosity through engaging pretend play, sensory tactile stations, and creative music.',
            icon: 'sparkles'
          },
          {
            id: 'pillar-safe-community',
            title: 'Safe Community',
            description: 'A dedicated team that supports, respects, and celebrates everyone. Clean, hygienic facilities, secure check-in, and loving staff that treat children like family.',
            icon: 'shield-check'
          }
        ]
      },

      curriculum: {
        badge: 'OUR GUIDING PRINCIPLES',
        heading: 'What Makes Us Special',
        description: 'Carefully balanced holistic approach to social, emotional, physical, and cognitive growth.',
        programs
      },

      facilities: {
        badge: 'SPACES & ENVIRONMENT',
        heading: 'Thoughtfully Designed for Little Explorers',
        description: 'A glance into spaces carefully crafted where creativity meets safety and joy.',
        spaces: [
          {
            id: 'facility-studios',
            title: 'Bright Play Studios',
            description: 'Spacious, sunlit play rooms designed for toddler exploration, safe developmental wooden toys, reading corners, and circle time areas.',
            icon: 'sun',
            tag: 'Ages 1 - 3 yrs'
          },
          {
            id: 'facility-garden',
            title: 'Outdoor Garden & Discovery',
            description: 'Secure, green outdoor play space for gross motor development, splash water play stations, shaded sandbox, and gentle nature sensory walks.',
            icon: 'tree',
            tag: 'All Age Groups'
          },
          {
            id: 'facility-quiet',
            title: 'Cozy Rest & Quiet Zones',
            description: 'Calm, sound-dampened sleep rooms with individual sanitized cots, soothing white noise machines, soft lullabies, and constant teacher monitoring.',
            icon: 'moon',
            tag: 'Nap & Sensory Break'
          }
        ]
      },

      ctaBanner: {
        heading: "Ready to Begin Your Child's Journey?",
        description: 'Schedule a nursery tour or submit an admission application today. We welcome families with open hearts, guidance, and transparent care every step.',
        buttonText: 'Apply for Admission',
        trustBadges: [
          'Personalized Care Sessions',
          'Flexible Program Schedules',
          'Open Facility Tours'
        ]
      },

      footer: {
        copyright: '© 2026 Tom & Jerry Nursery. All Rights Reserved.',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '#about' },
          { label: 'Curriculum', href: '#curriculum' },
          { label: 'Contact', href: '#contact' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Use', href: '/terms' }
        ]
      }
    };

    res.json(landingData);
  } catch (error) {
    next(error);
  }
};

// ─── SUBMIT ADMISSION APPLICATION (Public: Apply for Admission Button) ───────
const applyForAdmission = async (req, res, next) => {
  try {
    const {
      parentName,
      parentEmail,
      parentPhone,
      childName,
      childDob,
      childAge,
      programInterested,
      preferredStartDate,
      notes
    } = req.body;

    if (!parentName || !parentEmail || !parentPhone || !childName) {
      return res.status(400).json({
        error: 'Parent Name, Parent Email, Parent Phone, and Child Name are required'
      });
    }

    const application = await prisma.admissionRequest.create({
      data: {
        parentName,
        parentEmail,
        parentPhone,
        childName,
        childDob: childDob ? new Date(childDob) : null,
        childAge: childAge || null,
        programInterested: programInterested || 'General Nursery',
        preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : null,
        notes: notes || null,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Admission application received successfully! Our admissions team will contact you shortly.',
      applicationNumber: application.id,
      application
    });
  } catch (error) {
    next(error);
  }
};

// ─── SUBMIT CONTACT MESSAGE (Public: Contact Form) ──────────────────────────
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || 'General Inquiry',
        message
      }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We will get back to you within 24 hours.',
      inquiryId: contact.id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandingPageData,
  applyForAdmission,
  submitContactMessage
};
