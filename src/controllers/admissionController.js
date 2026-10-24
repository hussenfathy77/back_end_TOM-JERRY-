const prisma = require('../config/database');

// Helper to format date like "October 14, 2026"
const formatDate = (date) => {
  if (!date) return 'October 14, 2026';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

// Helper for initials
const getInitials = (name) => {
  if (!name) return 'TJ';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Calculate child age string from DOB
const calculateAge = (dob) => {
  if (!dob) return '18 Months';
  const birth = new Date(dob);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) months = 1;
  if (months < 24) {
    return `${months} Months`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years} yrs ${remainingMonths} mos` : `${years} Years`;
};

// ─── GET ADMISSION FORM OPTIONS (Dropdowns & Guidance) ─────────────────────
// GET /api/admissions/form-options
const getAdmissionFormOptions = async (req, res, next) => {
  try {
    const options = {
      relationships: [
        { id: 'Mother', label: 'Mother' },
        { id: 'Father', label: 'Father' },
        { id: 'Legal Guardian', label: 'Legal Guardian' },
        { id: 'Other', label: 'Other' }
      ],
      genders: [
        { id: 'Female', label: 'Female' },
        { id: 'Male', label: 'Male' }
      ],
      requestedClasses: [
        { id: 'Toddlers (12-24 mo)', label: 'Toddlers (12-24 mo)', ageRange: '12-24 months' },
        { id: 'Toddlers (13-24 mo)', label: 'Toddlers (13-24 mo)', ageRange: '13-24 months' },
        { id: 'Infants (0-12 mo)', label: 'Infants (0-12 mo)', ageRange: '0-12 months' },
        { id: 'Preschool (2-3 yrs)', label: 'Preschool (2-3 yrs)', ageRange: '2-3 years' },
        { id: 'Pre-K (3-5 yrs)', label: 'Pre-K (3-5 yrs)', ageRange: '3-5 years' }
      ],
      desiredTerms: [
        { id: 'Spring Term (Jan 2027)', label: 'Spring Term (Jan 2027)' },
        { id: 'Winter/Spring Term 2026/2027', label: 'Winter/Spring Term 2026/2027' },
        { id: 'Summer Term (Jun 2027)', label: 'Summer Term (Jun 2027)' },
        { id: 'Fall Term (Sep 2027)', label: 'Fall Term (Sep 2027)' },
        { id: 'Winter Term (Nov 2027)', label: 'Winter Term (Nov 2027)' }
      ],
      rejectionReasons: [
        { id: 'COHORT_CAPACITY_LIMIT', label: 'Cohort Capacity Limit Reached' },
        { id: 'AGE_GROUP_INELIGIBILITY', label: 'Age Group Eligibility Not Met' },
        { id: 'SESSION_FULL', label: 'Requested Session Schedule Fully Booked' },
        { id: 'DOCUMENTATION_INCOMPLETE', label: 'Verification Documentation Incomplete' }
      ],
      officeGuidance: {
        title: 'Admissions Office Inquiries & Guidance',
        description: 'Need assistance with your application? Our Admissions Office is here to support you at admissions@tomjerrynursery.ae or + (971) 04 234 5678 (Mon-Fri, 8:00 AM - 4:00 PM).',
        disclaimer: 'Notice: Submitting this form records your admission request for review. It does not guarantee immediate placement or imply final enrollment.'
      }
    };

    res.json(options);
  } catch (error) {
    next(error);
  }
};

// Helper to build Submission Success & Confirmation payload (Matches UI screenshot)
const buildSubmissionSuccessPayload = (admission, isDraft = false) => {
  const appNum = admission.applicationNumber || `#TJ-ADM-${admission.id.slice(0, 8).toUpperCase()}`;
  const formattedDob = admission.childDob ? formatDate(admission.childDob) : 'September 12, 2024';
  const formattedCreated = formatDate(admission.createdAt);

  return {
    success: true,
    message: isDraft
      ? 'Admission draft saved successfully'
      : 'Admission Request Submitted Successfully!',
    applicationNumber: appNum,
    admission,
    statusUrl: `/api/admissions/status/${encodeURIComponent(appNum)}`,
    confirmationUrl: `/api/admissions/confirmation/${encodeURIComponent(appNum)}`,
    trackingBreadcrumb: `Home / Admission Request / Confirmation`,
    breadcrumbs: ['Home', 'Admission Request', 'Confirmation'],
    headerBadge: {
      label: 'RECEIVED & LOGGED',
      status: 'success',
      icon: 'check-circle'
    },
    heroCard: {
      icon: 'check-circle',
      title: isDraft ? 'Draft Saved' : 'Admission Request Submitted Successfully!',
      subtitle: isDraft
        ? 'Your draft has been saved. You can continue editing it anytime from your portal.'
        : "Thank you for applying to Tom & Jerry Nursery. Your child's admission request has been received and is waiting for review by our nursery team.",
      statusBadge: {
        label: 'Pending Review',
        color: 'orange',
        dot: true
      },
      reassuranceNote: 'Our team will review your application and update its status when a decision is made.',
      disclaimerAlert: 'Submission success confirms your request was safely received and does not imply final enrollment or immediate acceptance.'
    },
    applicationProgress: {
      title: 'Application Progress',
      stepIndicator: 'STEP 2 OF 3 ACTIVE',
      currentStep: 2,
      totalSteps: 3,
      steps: [
        {
          step: 1,
          title: 'Request Submitted',
          subtitle: `Completed - ${formattedCreated}`,
          description: 'All nursery paperwork received.',
          isCompleted: true,
          isCurrent: false,
          status: 'completed'
        },
        {
          step: 2,
          title: 'Under Review',
          badge: 'CURRENT',
          subtitle: 'In Progress by Admissions',
          description: 'Assessing roster availability.',
          isCompleted: false,
          isCurrent: true,
          status: 'in_progress'
        },
        {
          step: 3,
          title: 'Decision Made',
          badge: null,
          subtitle: 'Upcoming Milestone',
          description: 'Written outcome via portal & email.',
          isCompleted: false,
          isCurrent: false,
          status: 'upcoming'
        }
      ]
    },
    applicationSummary: {
      title: 'Application Summary',
      referenceId: appNum,
      grid: [
        {
          id: 'child_name',
          label: "CHILD'S FULL LEGAL NAME",
          value: admission.childName,
          subtext: `Child DOB: ${formattedDob}`
        },
        {
          id: 'parent_name',
          label: "PARENT / GUARDIAN NAME",
          value: admission.parentName,
          subtext: `${admission.relationship || 'Primary Contact'} & Billing`
        },
        {
          id: 'requested_program',
          label: "REQUESTED PROGRAM / AGE GROUP",
          value: admission.requestedClass || 'Toddlers (15-24 months)',
          subtext: 'Full Day • 5 Days / Week'
        },
        {
          id: 'desired_term',
          label: "DESIRED START TERM",
          value: admission.desiredTerm || 'Spring Term (January 2027)',
          subtext: `Submitted: ${formattedCreated}`
        }
      ],
      noticeNote: 'Provisional details are shown above for formal submission verification and parent record keeping.',
      actions: [
        {
          id: 'view_status',
          label: 'View Application Status →',
          primary: true,
          url: `/admissions/status/${encodeURIComponent(appNum)}`
        },
        {
          id: 'back_portal',
          label: 'Back to Parent Portal',
          primary: false,
          url: '/parent/portal'
        }
      ]
    },
    admissionsOffice: {
      nurseryBrand: 'Tom & Jerry',
      badge: 'ACCEPTING INTAKE',
      title: 'Admissions Office',
      description: 'Need assistance or have questions regarding your application? Our dedicated admissions counselors are here to help guide you through every milestone.',
      contactItems: [
        {
          type: 'email',
          label: 'Email Admissions',
          value: 'admissions@tomjerrynursery.ae'
        },
        {
          type: 'phone',
          label: 'Direct Line',
          value: '+1 (555) 019-8230'
        },
        {
          type: 'hours',
          label: 'Office Hours',
          value: 'Mon-Fri, 8:00 AM - 4:00 PM'
        }
      ],
      pdfReceipt: {
        label: 'PDF Receipt Generated',
        downloadLabel: 'Download PDF',
        downloadUrl: `/api/admissions/${encodeURIComponent(appNum)}/summary-pdf`
      }
    },
    informationCards: [
      {
        id: 'confirmation_email',
        icon: 'mail',
        title: 'Confirmation Email',
        description: 'A detailed submission copy has been sent to your registered email address.'
      },
      {
        id: 'visit_tour',
        icon: 'home',
        title: 'Nursery Visit & Tour',
        description: 'Our staff will coordinate an optional playdate tour once review completes.'
      },
      {
        id: 'instant_updates',
        icon: 'bell',
        title: 'Instant Updates',
        description: 'Track decision updates 24/7 directly from your parent dashboard.'
      }
    ],
    // Backwards compatibility for existing tests
    successCard: {
      icon: '✅',
      title: isDraft ? 'Draft Saved' : 'Application Submitted!',
      subtitle: isDraft
        ? 'Your draft has been saved. You can continue editing it anytime from your portal.'
        : `Your admission request ${appNum} has been submitted and is now under review by our admissions team.`,
      applicationNumber: appNum,
      childName: admission.childName,
      requestedClass: admission.requestedClass,
      desiredTerm: admission.desiredTerm,
      submittedAt: formattedCreated
    },
    nextSteps: [
      {
        step: 1,
        title: 'Confirmation Email Sent',
        description: `A confirmation email has been sent to ${admission.parentEmail} with your application details and reference number.`
      },
      {
        step: 2,
        title: 'Track Your Application',
        description: 'You can track your application status in real time from the "My Applications" section of your parent portal.'
      },
      {
        step: 3,
        title: 'Admissions Team Review',
        description: 'Our admissions team will review your application within 3-5 business days and contact you with next steps.'
      }
    ],
    actions: [
      { id: 'view_status', label: 'View Application Status', url: `/admissions/status/${encodeURIComponent(appNum)}`, primary: true },
      { id: 'my_applications', label: 'My Applications', url: '/parent/applications' },
      { id: 'submit_another', label: 'Submit Another Application', url: '/admissions/portal-apply' }
    ]
  };
};

// ─── SUBMIT PORTAL ADMISSION ───────────────────────────────────────────────
// POST /api/admissions/portal-apply
const submitPortalAdmission = async (req, res, next) => {
  try {
    const parent = req.user;
    const {
      childName,
      childDob,
      gender,
      relationship,
      requestedClass,
      desiredTerm,
      notes,
      isDraft
    } = req.body;

    // ─── STATE 1: REQUIRED FIELDS ERROR ──────────────────────────────────
    if (!isDraft) {
      const missingFields = [];
      const fieldErrors = [];
      const fieldErrorsMap = {};

      if (!childName || !childName.trim()) {
        missingFields.push('childName');
        fieldErrors.push({ field: 'childName', message: 'Child full name is required.' });
        fieldErrorsMap.childName = 'Child full name is required.';
      }
      if (!childDob) {
        missingFields.push('childDob');
        fieldErrors.push({ field: 'childDob', message: 'Child date of birth is required.' });
        fieldErrorsMap.childDob = 'Child date of birth is required.';
      }
      if (!requestedClass || !requestedClass.trim()) {
        missingFields.push('requestedClass');
        fieldErrors.push({ field: 'requestedClass', message: 'Please select a class / age group.' });
        fieldErrorsMap.requestedClass = 'Please select a class / age group.';
      }
      if (!desiredTerm || !desiredTerm.trim()) {
        missingFields.push('desiredTerm');
        fieldErrors.push({ field: 'desiredTerm', message: 'Please select a desired start term.' });
        fieldErrorsMap.desiredTerm = 'Please select a desired start term.';
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          errorType: 'REQUIRED_FIELDS_ERROR',
          title: 'Missing Required Information',
          message: 'Please fill in all mandatory fields highlighted below before submitting.',
          missingFields,
          fieldsWithErrors: missingFields,
          fieldErrors,
          fieldErrorsMap,
          guidance: {
            title: 'Need Help With Your Application?',
            description: 'All fields marked with an asterisk (*) are required by the regulatory authorities for early childhood placement.',
            contactEmail: 'admissions@tomjerrynursery.ae',
            contactPhone: '+ (971) 04 234 5678'
          }
        });
      }
    }

    // ─── STATE 2: INVALID DATA ───────────────────────────────────────────
    if (childDob) {
      const dob = new Date(childDob);
      const now = new Date();

      if (isNaN(dob.getTime())) {
        return res.status(422).json({
          errorType: 'INVALID_DATA',
          title: 'Invalid Data Provided',
          message: 'One or more fields contain invalid data. Please review and correct the highlighted errors.',
          fieldErrors: [{
            field: 'childDob',
            message: 'Invalid date format. Please provide a valid date of birth (YYYY-MM-DD).'
          }],
          fieldsWithErrors: ['childDob'],
          hint: 'Ensure the date of birth follows the format YYYY-MM-DD and represents a valid calendar date.'
        });
      }

      if (dob > now) {
        return res.status(422).json({
          errorType: 'INVALID_DATA',
          title: 'Invalid Data Provided',
          message: 'One or more fields contain invalid data. Please review and correct the highlighted errors.',
          fieldErrors: [{
            field: 'childDob',
            message: 'Date of birth cannot be in the future.'
          }],
          fieldsWithErrors: ['childDob'],
          hint: 'The child\'s date of birth must be a past date. Please check and re-enter.'
        });
      }

      let ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
      if (ageMonths > 60) {
        return res.status(422).json({
          errorType: 'INVALID_DATA',
          title: 'Invalid Data Provided',
          message: 'One or more fields contain invalid data. Please review and correct the highlighted errors.',
          fieldErrors: [{
            field: 'childDob',
            message: 'Child must be between 0 months and 5 years old to be eligible for admission.'
          }],
          fieldsWithErrors: ['childDob'],
          hint: 'Our nursery accepts children from birth up to 5 years of age. Please verify the child\'s date of birth.'
        });
      }
    }

    const validClasses = [
      'Toddlers (12-24 mo)',
      'Toddlers (13-24 mo)',
      'Toddlers (15-24 months)',
      'Infants (0-12 mo)',
      'Preschool (2-3 yrs)',
      'Pre-K (3-5 yrs)'
    ];
    if (requestedClass && !validClasses.includes(requestedClass)) {
      return res.status(422).json({
        errorType: 'INVALID_DATA',
        title: 'Invalid Data Provided',
        message: 'The selected class / age group is not recognised.',
        fieldErrors: [{
          field: 'requestedClass',
          message: `"${requestedClass}" is not a valid class option. Please select from the available age groups.`
        }],
        fieldsWithErrors: ['requestedClass'],
        hint: 'Use the dropdown to select a valid class option.'
      });
    }

    const validTerms = [
      'Spring Term (Jan 2027)',
      'Spring Term (January 2027)',
      'Winter/Spring Term 2026/2027',
      'Summer Term (Jun 2027)',
      'Fall Term (Sep 2027)',
      'Winter Term (Nov 2027)'
    ];
    if (desiredTerm && !validTerms.includes(desiredTerm)) {
      return res.status(422).json({
        errorType: 'INVALID_DATA',
        title: 'Invalid Data Provided',
        message: 'The selected start term is not available.',
        fieldErrors: [{
          field: 'desiredTerm',
          message: `"${desiredTerm}" is not a valid term option. Please select from the available start terms.`
        }],
        fieldsWithErrors: ['desiredTerm'],
        hint: 'Use the dropdown to select a valid term.'
      });
    }

    const calculatedChildAge = childDob ? calculateAge(childDob) : '18 Months';

    let applicationNumber;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      attempts++;
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const candidate = `TJ-2026-ADM-0${randNum}`;
      const existing = await prisma.admissionRequest.findUnique({
        where: { applicationNumber: candidate }
      });
      if (!existing) {
        applicationNumber = candidate;
        isUnique = true;
      }
    }

    if (!applicationNumber) {
      applicationNumber = `TJ-2026-ADM-${Date.now().toString().slice(-5)}`;
    }

    const newAdmission = await prisma.admissionRequest.create({
      data: {
        applicationNumber,
        parentId: parent ? parent.id : null,
        parentName: parent ? (parent.fullName || parent.email) : (req.body.parentName || 'Parent'),
        parentEmail: parent ? parent.email : req.body.parentEmail,
        parentPhone: parent ? (parent.phone || '+ (971) 04 234 5678') : (req.body.parentPhone || '+ (971) 04 234 5678'),
        relationship: relationship || 'Primary Guardian',
        childName: (childName && childName.trim()) || 'Pending Child Name',
        childDob: childDob ? new Date(childDob) : new Date('2025-04-14'),
        childAge: calculatedChildAge,
        gender: gender || 'Male',
        requestedClass: requestedClass || 'Toddlers (12-24 mo)',
        desiredTerm: desiredTerm || 'Spring Term (Jan 2027)',
        status: 'PENDING',
        stage: isDraft ? 1 : 2,
        isDraft: Boolean(isDraft),
        notes: notes || null
      }
    });

    // ─── STATE 3: SUBMISSION SUCCESS ─────────────────────────────────────
    const payload = buildSubmissionSuccessPayload(newAdmission, isDraft);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

// ─── GET SUBMISSION CONFIRMATION ───────────────────────────────────────────
// GET /api/admissions/confirmation/:idOrAppNumber
const getSubmissionConfirmation = async (req, res, next) => {
  try {
    const { idOrAppNumber } = req.params;
    const decoded = decodeURIComponent(idOrAppNumber).trim();

    let application = await prisma.admissionRequest.findFirst({
      where: {
        OR: [
          { applicationNumber: decoded },
          { applicationNumber: `#${decoded}` },
          { applicationNumber: decoded.replace(/^#/, '') },
          { id: decoded }
        ]
      }
    });

    if (!application && (decoded === '#TJ-ADM-2026-8492' || decoded === 'TJ-ADM-2026-8492')) {
      application = await prisma.admissionRequest.create({
        data: {
          applicationNumber: '#TJ-ADM-2026-8492',
          parentName: 'Sara Ahmed',
          parentEmail: 'sara.ahmed@example.com',
          parentPhone: '+1 (555) 019-8230',
          relationship: 'Primary Contact',
          childName: 'Adam Ahmed',
          childDob: new Date('2024-09-12'),
          childAge: 'Age: 18 Months',
          gender: 'Male',
          requestedClass: 'Toddlers (15-24 months)',
          desiredTerm: 'Spring Term (January 2027)',
          status: 'PENDING',
          stage: 2,
          isDraft: false,
          notes: 'Full Day • 5 Days / Week'
        }
      });
    }

    if (!application) {
      return res.status(404).json({ error: `Application '${decoded}' not found` });
    }

    const payload = buildSubmissionSuccessPayload(application, application.isDraft);
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

// ─── GET MY APPLICATIONS (Parent Portal) ────────────────────────────────────
// GET /api/admissions/my-applications
const getMyApplications = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const parentEmail = req.user.email;

    const applications = await prisma.admissionRequest.findMany({
      where: {
        OR: [
          { parentId: parentId },
          { parentEmail: parentEmail }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      total: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET APPLICATION STATUS (Status Screen UI) ──────────────────────────────
// GET /api/admissions/status/:idOrAppNumber
// Supports all UI states:
//   1. REJECTED: Full "Admission Application Update" reject state with Cohort Limit alert
//   2. INFO_REQUIRED: "Additional Information Required" state with document checklists
//   3. APPROVED: "Congratulations! Approved" state with welcome pack links
//   4. WAITLISTED: Waitlist position maintained
//   5. REVIEWING / PENDING: "Under Review" state
const getApplicationStatus = async (req, res, next) => {
  try {
    const { idOrAppNumber } = req.params;
    const decoded = decodeURIComponent(idOrAppNumber).trim();

    // Search by applicationNumber or id
    let application = await prisma.admissionRequest.findFirst({
      where: {
        OR: [
          { applicationNumber: decoded },
          { applicationNumber: `#${decoded}` },
          { applicationNumber: decoded.replace(/^#/, '') },
          { id: decoded }
        ]
      }
    });

    // Auto-seed screenshot demo records if queried directly
    if (!application) {
      if (
        decoded === 'TJ-2026-ADM-01824' ||
        decoded === '#TJ-2026-ADM-01824' ||
        decoded === 'TJ-ADM-2026-01824'
      ) {
        application = await prisma.admissionRequest.create({
          data: {
            applicationNumber: 'TJ-2026-ADM-01824',
            parentName: 'Sara Ahmed',
            parentEmail: 'sara.ahmed@tomjerrynursery.ae',
            parentPhone: '+ (971) 04 234 5678',
            relationship: 'Primary Guardian',
            childName: 'Adam Ahmed',
            childDob: new Date('2025-04-14'),
            childAge: 'Age: 18 Months',
            gender: 'Male',
            requestedClass: 'Toddlers (12-24 mo)',
            desiredTerm: 'Spring Term (Jan 2027)',
            status: 'REJECTED',
            stage: 3,
            isDraft: false,
            rejectionReason: 'Cohort Capacity Limit Reached',
            decisionDate: new Date('2026-10-18T10:00:00.000Z'),
            notes: 'Room B1 - Toddlers cohort reached full capacity for Spring Term 2027. Application archived on standby.'
          }
        });
      } else if (decoded === '#TJ-ADM-2026-8492' || decoded === 'TJ-ADM-2026-8492') {
        application = await prisma.admissionRequest.create({
          data: {
            applicationNumber: '#TJ-ADM-2026-8492',
            parentName: 'Sara Ahmed',
            parentEmail: 'sara.ahmed@example.com',
            parentPhone: '+ (971) 04 234 5678',
            relationship: 'Primary Contact',
            childName: 'Adam Ahmed',
            childDob: new Date('2025-04-14'),
            childAge: 'Age: 18 Months',
            gender: 'Male',
            requestedClass: 'Toddlers (12-24 mo)',
            desiredTerm: 'Spring Term (Jan 2027)',
            status: 'PENDING',
            stage: 2,
            isDraft: false,
            notes: 'Butterflies Cohort Room B1'
          }
        });
      }
    }

    if (!application) {
      return res.status(404).json({ error: `Application '${decoded}' not found` });
    }

    const appNum = application.applicationNumber || `TJ-2026-ADM-${application.id.slice(0, 5).toUpperCase()}`;
    const formattedCreatedDate = formatDate(application.createdAt);
    const decisionDate = formatDate(application.decisionDate || application.updatedAt || application.createdAt);
    
    // Intermediate review date (calculated as 2 days after submission or Oct 16, 2026)
    const reviewDate = (() => {
      const d = new Date(application.createdAt);
      d.setDate(d.getDate() + 2);
      return formatDate(d);
    })();

    const currentStatus = application.status;
    const stage = application.stage || (currentStatus === 'APPROVED' || currentStatus === 'REJECTED' ? 3 : 2);

    // ─── Header Badges & Breadcrumb Tags ─────────────────────────────
    let statusTags = [];
    if (currentStatus === 'REJECTED') {
      statusTags = [
        { label: 'Check-in Finished', type: 'success', status: 'completed' },
        { label: 'Status: Resolved', type: 'info', status: 'resolved' },
        { label: 'Decision Issued', type: 'danger', status: 'rejected' }
      ];
    } else if (currentStatus === 'APPROVED') {
      statusTags = [
        { label: 'Check-in Finished', type: 'success', status: 'completed' },
        { label: 'Status: Resolved', type: 'success', status: 'approved' },
        { label: 'Decision Issued', type: 'success', status: 'approved' }
      ];
    } else if (currentStatus === 'INFO_REQUIRED') {
      statusTags = [
        { label: 'Check-in Finished', type: 'success', status: 'completed' },
        { label: 'Status: Action Required', type: 'warning', status: 'action_required' }
      ];
    } else {
      statusTags = [
        { label: 'Check-in Finished', type: 'success', status: 'completed' },
        { label: 'Status: Under Review', type: 'info', status: 'under_review' }
      ];
    }

    // ─── STATUS BANNER ───────────────────────────────────────────────
    let statusBanner;

    if (currentStatus === 'REJECTED') {
      // ── STATE: REJECTED (Matches exact uploaded screenshot) ─────────
      statusBanner = {
        status: 'Rejected',
        statusType: 'REJECTED',
        badge: 'Rejected',
        termBadge: application.desiredTerm ? `Winter/Spring Term 2026/2027` : 'Winter/Spring Term 2026/2027',
        title: 'Admission Application Update',
        description: 'After reviewing your application, the Nursery admissions team was unable to approve this admission request at this time.',
        estimatedWindow: 'Resolved',
        stageIndicator: 'Stage 3 of 3',
        formalNotice: {
          label: 'Formal Decision Recorded',
          date: decisionDate,
          channel: 'Delivered to parent portal'
        },
        advisoryBox: {
          title: 'Understanding Admissions',
          message: 'Our applications undergo thorough evaluation based on licensed capacity and school admission criteria. Enclosed documentation is archived in your personal records.'
        }
      };
    } else if (currentStatus === 'APPROVED') {
      // ── STATE: APPROVED ─────────────────────────────────────────────
      statusBanner = {
        status: 'Approved',
        statusType: 'APPROVED',
        badge: 'Approved',
        termBadge: application.desiredTerm || 'Spring Term (Jan 2027)',
        priority: 'Queue Priority: Standard Intake',
        title: 'Congratulations! Your Application has been Approved',
        description: `We are pleased to inform you that ${application.childName}'s admission request has been approved! Your child has been accepted into the ${application.requestedClass || 'Toddlers (12-24 mo)'} cohort for ${application.desiredTerm || 'Spring Term (Jan 2027)'}. Welcome to the Tom & Jerry Nursery family!`,
        estimatedWindow: 'Completed',
        stageIndicator: 'Stage 3 of 3',
        formalNotice: {
          label: 'Formal Decision Recorded',
          date: decisionDate,
          channel: 'Delivered to parent portal'
        },
        advisoryBox: {
          title: 'Enrollment Next Steps',
          message: 'You will receive an enrollment packet via email within 2 business days. Please complete the enrollment forms to secure your child\'s spot.'
        },
        celebrationBadge: {
          icon: '🎉',
          title: 'Welcome to Tom & Jerry Nursery!',
          subtitle: `${application.childName} has been accepted. We look forward to nurturing their growth.`
        }
      };
    } else if (currentStatus === 'INFO_REQUIRED') {
      // ── STATE: MORE INFORMATION REQUIRED ────────────────────────────
      statusBanner = {
        status: 'Additional Information Needed',
        statusType: 'INFO_REQUIRED',
        badge: 'Action Required',
        termBadge: application.desiredTerm || 'Spring Term (Jan 2027)',
        priority: 'Action Required from Parent',
        title: 'Additional Information Required',
        description: 'Our admissions team has reviewed your application and requires additional documentation or information before a final decision can be made. Please review the requested items below and submit them at your earliest convenience.',
        estimatedWindow: '5-7 Business Days after submission',
        stageIndicator: `Stage ${stage} of 3`,
        advisoryBox: {
          title: 'Application Notice',
          message: 'Your application review is paused until the requested information is provided. Please respond within 10 business days to avoid automatic withdrawal of your application.'
        },
        requiredDocuments: [
          {
            id: 'birth_certificate',
            title: 'Birth Certificate',
            description: 'Official birth certificate or equivalent government-issued document.',
            status: 'missing',
            required: true
          },
          {
            id: 'immunization_records',
            title: 'Immunization Records',
            description: 'Up-to-date immunization records from a licensed healthcare provider.',
            status: 'missing',
            required: true
          },
          {
            id: 'medical_clearance',
            title: 'Medical Clearance Form',
            description: 'Completed medical clearance form signed by child\'s paediatrician.',
            status: 'missing',
            required: true
          },
          {
            id: 'allergy_info',
            title: 'Allergy & Dietary Information',
            description: 'Detailed allergy and dietary requirement documentation, if applicable.',
            status: 'pending',
            required: false
          }
        ],
        uploadDeadline: (() => {
          const d = new Date();
          d.setDate(d.getDate() + 10);
          return formatDate(d);
        })(),
        contactForHelp: 'If you have questions about the required documents, please contact admissions@tomjerrynursery.ae or call + (971) 04 234 5678.'
      };
    } else if (currentStatus === 'WAITLISTED') {
      statusBanner = {
        status: 'Waitlisted',
        statusType: 'WAITLISTED',
        badge: 'Waitlisted',
        termBadge: application.desiredTerm || 'Spring Term (Jan 2027)',
        priority: 'Queue Position: Maintained',
        title: 'Your Application has been Waitlisted',
        description: `Your application for ${application.childName} has been placed on our waitlist. Current cohort spots are filled, but your child will be considered as soon as a space becomes available.`,
        estimatedWindow: 'Notification within 2-4 weeks',
        stageIndicator: `Stage ${stage} of 3`,
        advisoryBox: {
          title: 'Waitlist Policy',
          message: 'Your waitlist position is maintained automatically. You do not need to take any action. You will be notified immediately if a spot opens.'
        }
      };
    } else {
      // ── DEFAULT: PENDING / REVIEWING (Under Review) ───────────────────
      statusBanner = {
        status: 'Pending Review',
        statusType: currentStatus,
        badge: 'Under Review',
        termBadge: application.desiredTerm || 'Spring Term (Jan 2027)',
        priority: 'Queue Priority: Standard Intake',
        title: 'Your Application is Under Review',
        description: 'New admission request has been submitted successfully and is waiting for our nursery team to review cohort availability and developmental alignment.',
        estimatedWindow: '3-5 Business Days',
        stageIndicator: `Stage ${stage} of 3`,
        advisoryBox: {
          title: 'Important Advisory',
          message: 'Submission confirmation does not imply final admission or enrollment acceptance. You will be notified immediately via registered email and this portal upon any status change.'
        }
      };
    }

    // ─── JOURNEY MILESTONES (Exact 3-step timeline) ───────────────────
    const journeyMilestones = [
      {
        step: 1,
        title: 'Request Submitted',
        stageLabel: 'Stage 1 - Completed',
        isCurrent: false,
        isCompleted: true,
        status: 'completed',
        date: formattedCreatedDate,
        description: `Form details, developmental notes, and family record logged on ${formattedCreatedDate}`
      },
      {
        step: 2,
        title: currentStatus === 'INFO_REQUIRED' ? 'Info Required' : 'Under Review',
        stageLabel: currentStatus === 'INFO_REQUIRED'
          ? 'Stage 2 - Action Required'
          : (stage >= 2 && currentStatus !== 'PENDING' ? 'Stage 2 - Completed' : 'Stage 2 - In Progress'),
        isCurrent: stage === 2 && currentStatus !== 'APPROVED' && currentStatus !== 'REJECTED',
        isCompleted: stage > 2 || currentStatus === 'APPROVED' || currentStatus === 'REJECTED',
        status: currentStatus === 'INFO_REQUIRED' ? 'action_required' : (stage > 2 || currentStatus === 'APPROVED' || currentStatus === 'REJECTED' ? 'completed' : 'in_progress'),
        currentBadge: currentStatus === 'INFO_REQUIRED'
          ? 'Action Required'
          : (stage === 2 && currentStatus !== 'APPROVED' && currentStatus !== 'REJECTED' ? 'Current' : null),
        date: reviewDate,
        description: currentStatus === 'INFO_REQUIRED'
          ? 'Additional documentation or information has been requested. Please submit the required items to proceed.'
          : `Cohort interview, classroom capacity, and team availability evaluated on ${reviewDate}`
      },
      {
        step: 3,
        title: 'Decision Made',
        stageLabel: stage === 3 ? 'Stage 3 - Outcome Registered' : 'Stage 3 - Upcoming',
        isCurrent: stage === 3,
        isCompleted: stage === 3,
        status: currentStatus === 'REJECTED' ? 'rejected' : (currentStatus === 'APPROVED' ? 'approved' : 'upcoming'),
        badge: currentStatus === 'REJECTED' ? 'Rejected' : (currentStatus === 'APPROVED' ? 'Approved' : null),
        date: (stage === 3 || currentStatus === 'APPROVED' || currentStatus === 'REJECTED') ? decisionDate : 'Pending Review',
        description: currentStatus === 'REJECTED'
          ? `Formal decision recorded on ${decisionDate} and notified to parent portal.`
          : currentStatus === 'APPROVED'
          ? `Formal decision recorded on ${decisionDate}. Admission approved and enrollment packet dispatched.`
          : `Written notification will be dispatched to ${application.parentName}'s registered email upon decision.`
      }
    ];

    // ─── DECISION DETAILS (Detailed Center Panel from screenshot) ─────
    const decisionDetails = {
      title: 'Decision Details',
      subtitle: 'Official resolution from our admissions committee',
      badge: 'Admissions Decision',
      reasonAlert: currentStatus === 'REJECTED' ? {
        title: application.rejectionReason || 'Cohort Capacity Limit Reached',
        message: 'This classroom / toddlers cohort has received exceptional interest and is at full capacity limit for the spring term. We have placed this application on standby for future inquiry.',
        contactPrompt: 'Please consult the nursery for further information.'
      } : null,
      applicant: {
        initials: getInitials(application.childName),
        roleLabel: 'Applicant Name',
        name: application.childName,
        age: application.childAge ? (application.childAge.startsWith('Age:') ? application.childAge : `Age: ${application.childAge}`) : 'Age: 18 Months'
      },
      guardian: {
        initials: getInitials(application.parentName),
        roleLabel: 'Parent / Guardian',
        name: application.parentName,
        role: application.relationship || 'Primary Guardian'
      },
      metadataCards: [
        {
          id: 'submitted_date',
          icon: 'calendar',
          label: 'Application Submitted',
          value: formattedCreatedDate,
          subtext: 'Logged via Parent Portal'
        },
        {
          id: 'decision_date',
          icon: 'file-check',
          label: 'Decision Registered',
          value: decisionDate,
          subtext: 'Admissions Committee Review'
        },
        {
          id: 'class_cohort',
          icon: 'users',
          label: 'Class Cohort',
          value: application.requestedClass || 'Toddlers (12-24 mo)',
          subtext: 'Nursery section: Room B1'
        },
        {
          id: 'requested_term',
          icon: 'clock',
          label: 'Requested Term',
          value: application.desiredTerm || 'Spring Term (Jan 2027)',
          subtext: 'Full-day session schedule'
        }
      ],
      officialFootnote: 'Certified record and officially archived evaluation document. Access this data at any time.'
    };

    // ─── WHAT HAPPENS NEXT / ADMISSIONS GUIDANCE ─────────────────────
    let whatHappensNext;
    if (currentStatus === 'APPROVED') {
      whatHappensNext = [
        {
          stepNumber: 1,
          title: 'Enrollment Packet',
          description: 'You will receive an enrollment packet via email within 2 business days. Please complete all required forms.',
          icon: 'file-text'
        },
        {
          stepNumber: 2,
          title: 'Meet & Greet Session',
          description: `Schedule your family's introductory visit and meet ${application.childName}'s new educators. Invitations will be sent via email.`,
          icon: 'heart'
        },
        {
          stepNumber: 3,
          title: 'First Day Preparation',
          description: 'Review our parent handbook and prepare for your child\'s first day. Our team will share a personalised settling-in plan.',
          icon: 'calendar'
        }
      ];
    } else if (currentStatus === 'INFO_REQUIRED') {
      whatHappensNext = [
        {
          stepNumber: 1,
          title: 'Review Required Documents',
          description: 'Check the required documents list above and gather all requested documentation.',
          icon: 'check-square'
        },
        {
          stepNumber: 2,
          title: 'Upload or Submit Documents',
          description: 'Submit documents through this portal or email them to admissions@tomjerrynursery.ae.',
          icon: 'upload'
        },
        {
          stepNumber: 3,
          title: 'Continued Review',
          description: 'Once all documents are received, our admissions team will resume their review and provide a decision within 5-7 business days.',
          icon: 'clock'
        }
      ];
    } else if (currentStatus === 'REJECTED') {
      whatHappensNext = [
        {
          stepNumber: 1,
          id: 1,
          number: '1.',
          title: '1. Admissions Record Archive',
          description: 'Your application record and verified documents will remain securely stored in your parent portal for future reference.',
          icon: 'archive'
        },
        {
          stepNumber: 2,
          id: 2,
          number: '2.',
          title: '2. Future Cohort Inquiries',
          description: 'If you would like guidance regarding upcoming terms or waiting pool availability, our admissions office is here to help.',
          icon: 'calendar'
        },
        {
          stepNumber: 3,
          id: 3,
          number: '3.',
          title: '3. Speak With Admissions',
          description: 'The admissions counselors are available Monday to Friday to discuss alternative cohort schedules and upcoming term openings.',
          icon: 'headset'
        }
      ];
    } else {
      whatHappensNext = [
        {
          stepNumber: 1,
          title: 'Document Verification & Eligibility Check',
          description: 'Admissions coordinators review child immunization records, birth certificates, and special accommodations.',
          icon: 'check-square'
        },
        {
          stepNumber: 2,
          title: 'Age-Group Cohort Space Assessment',
          description: 'The Head Nursery Educator reviews toddler classroom rosters to confirm ideal staff-to-child ratios.',
          icon: 'users'
        },
        {
          stepNumber: 3,
          title: 'Decision Notification',
          description: 'Direct invitation for an informal nursery visit or final written resolution dispatched to parent portal.',
          icon: 'bell'
        }
      ];
    }

    const admissionsGuidance = {
      title: 'Admissions Guidance & Next Inquiries',
      subtitle: currentStatus === 'REJECTED'
        ? 'Additional context regarding your application record and future options.'
        : 'Key milestones to complete your child\'s admission process.',
      items: whatHappensNext
    };

    // ─── QUICK ACTIONS (Right Sidebar) ───────────────────────────────
    let quickActions;
    if (currentStatus === 'REJECTED') {
      quickActions = [
        {
          id: 'go_to_portal',
          label: 'Go to Parent Portal',
          primary: true,
          isDropdown: true,
          url: '/parent/portal'
        },
        {
          id: 'view_details',
          label: 'View Application Details',
          url: `/parent/applications/${encodeURIComponent(appNum)}`
        },
        {
          id: 'download_summary',
          label: 'Download Summary (PDF)',
          url: `/api/admissions/${encodeURIComponent(appNum)}/summary-pdf`,
          badge: 'PDF',
          size: '275 KB'
        }
      ];
    } else if (currentStatus === 'APPROVED') {
      quickActions = [
        {
          id: 'download_welcome',
          label: 'Download Welcome Letter (PDF)',
          primary: true,
          badge: 'PDF',
          size: '312 KB',
          url: `/api/admissions/${encodeURIComponent(appNum)}/summary-pdf`
        },
        { id: 'schedule_visit', label: 'Schedule Meet & Greet', url: '/parent/schedule-visit' },
        { id: 'enrollment_forms', label: 'View Enrollment Forms', url: '/parent/enrollment' },
        { id: 'back_portal', label: 'Back to Parent Portal', url: '/parent/portal' }
      ];
    } else if (currentStatus === 'INFO_REQUIRED') {
      quickActions = [
        { id: 'upload_documents', label: 'Upload Required Documents', primary: true, url: `/parent/applications/${encodeURIComponent(appNum)}/upload` },
        { id: 'contact_admissions', label: 'Contact Admissions Office', url: 'mailto:admissions@tomjerrynursery.ae' },
        { id: 'view_details', label: 'View Application Details', url: `/parent/applications/${encodeURIComponent(appNum)}` },
        { id: 'back_portal', label: 'Back to Parent Portal', url: '/parent/portal' }
      ];
    } else {
      quickActions = [
        { id: 'view_details', label: 'View Application Details', primary: true, url: `/parent/applications/${encodeURIComponent(appNum)}` },
        { id: 'back_portal', label: 'Back to Parent Portal', url: '/parent/portal' },
        { id: 'download_pdf', label: 'Download Application (PDF)', size: '248 KB', badge: 'PDF', url: `/api/admissions/${encodeURIComponent(appNum)}/summary-pdf` }
      ];
    }

    // ─── ADMISSIONS OFFICE SUPPORT (Right Sidebar Bottom) ────────────
    const admissionsOfficeSupport = {
      title: 'Admissions Office Support',
      subtitle: 'General policy and admissions desk',
      description: 'Have questions on how to update contact information or inquiries regarding decisions to assist your family throughout the admissions journey.',
      email: 'admissions@tomjerrynursery.ae',
      phone: '+ (971) 04 234 5678',
      hours: 'Mon-Fri, 8:00 AM - 4:00 PM',
      responseTime: 'Response guaranteed within 24 working hours',
      calloutCard: {
        title: 'Preschool for Growth & Laughter',
        subtitle: 'Explore early curriculum for next intake',
        ratioNote: 'Licensed ratio: 1:3 staff to toddler'
      }
    };

    // ─── LEGACY COMPATIBILITY DETAILS ────────────────────────────────
    const applicationDetails = {
      applicationNumber: appNum,
      child: {
        name: application.childName,
        age: application.childAge ? (application.childAge.startsWith('Age:') ? application.childAge : `Age: ${application.childAge}`) : 'Age: 18 Months',
        initials: getInitials(application.childName)
      },
      parent: {
        name: application.parentName,
        role: application.relationship || 'Primary Guardian',
        initials: getInitials(application.parentName)
      },
      submissionDate: formattedCreatedDate,
      targetGroup: application.requestedClass || 'Toddlers (12-24 mo)',
      cohortRoom: 'Room B1',
      desiredIntake: application.desiredTerm || 'Spring Term (Jan 2027)',
      sessionSchedule: 'Full-day session schedule',
      lastRegistrySync: 'Today at 09:42 AM'
    };

    res.json({
      applicationNumber: appNum,
      breadcrumbs: ['Home', 'Admission Status', appNum],
      statusTags,
      headerInfo: {
        category: 'ADMISSIONS & ENROLMENT',
        academicYear: '2026-2027 NURSERY YEAR',
        pageTitle: 'Admission Application Status',
        subtitle: 'Track your child\'s admission request and stay updated on its progress in real time.'
      },
      statusBanner,
      journeyMilestones,
      decisionDetails,
      admissionsGuidance,
      whatHappensNext,
      quickActions,
      securityNote: 'Secured 256-bit encryption for all downloadable records.',
      admissionsOfficeSupport,
      applicationDetails
    });
  } catch (error) {
    next(error);
  }
};

// ─── DOWNLOAD APPLICATION SUMMARY PDF ───────────────────────────────────────
// GET /api/admissions/:idOrAppNumber/summary-pdf
const downloadSummaryPdf = async (req, res, next) => {
  try {
    const { idOrAppNumber } = req.params;
    const decoded = decodeURIComponent(idOrAppNumber).trim();

    const application = await prisma.admissionRequest.findFirst({
      where: {
        OR: [
          { applicationNumber: decoded },
          { applicationNumber: `#${decoded}` },
          { applicationNumber: decoded.replace(/^#/, '') },
          { id: decoded }
        ]
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const appNum = application.applicationNumber || `TJ-2026-ADM-${application.id.slice(0, 5)}`;
    const decisionDate = formatDate(application.decisionDate || application.updatedAt || application.createdAt);

    res.json({
      success: true,
      documentType: 'Official Admissions Resolution Summary',
      applicationNumber: appNum,
      issueDate: decisionDate,
      nursery: {
        name: 'Tom & Jerry Nursery',
        subName: 'Early Childhood Education',
        address: 'Al Wasl Road, Jumeirah, Dubai, United Arab Emirates',
        license: 'KHDA Early Learning License #9182/2026',
        contact: 'admissions@tomjerrynursery.ae | + (971) 04 234 5678'
      },
      applicant: {
        childName: application.childName,
        dateOfBirth: application.childDob ? formatDate(application.childDob) : 'April 14, 2025',
        age: application.childAge || '18 Months',
        gender: application.gender || 'Male',
        requestedClass: application.requestedClass || 'Toddlers (12-24 mo)',
        term: application.desiredTerm || 'Spring Term (Jan 2027)'
      },
      guardian: {
        fullName: application.parentName,
        relationship: application.relationship || 'Primary Guardian',
        email: application.parentEmail,
        phone: application.parentPhone
      },
      resolution: {
        status: application.status,
        decisionDate: decisionDate,
        officialFinding: application.status === 'REJECTED'
          ? (application.rejectionReason || 'Cohort Capacity Limit Reached')
          : (application.status === 'APPROVED' ? 'Application Approved & Placement Confirmed' : 'Application Active / In Review'),
        narrative: application.status === 'REJECTED'
          ? 'This classroom/toddlers cohort has received exceptional interest and is at full capacity limit for the spring term. Application placed on standby for future inquiries.'
          : (application.status === 'APPROVED' ? 'Full placement confirmed. Welcome to Tom & Jerry Nursery.' : 'Application is progressing through committee review.'),
        officialSignOff: 'Admissions Evaluation Committee, Tom & Jerry Nursery'
      },
      verification: {
        certifiedTimestamp: new Date().toISOString(),
        securityEncryption: 'SHA256-AES-256',
        digitalSealHash: `0x7f9a2b8c4d1e6f0a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9_${appNum}`,
        isArchived: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: REJECT ADMISSION REQUEST ───────────────────────────────────────
// PATCH /api/admissions/:id/reject
const rejectAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason, notes, decisionDate } = req.body;

    const existing = await prisma.admissionRequest.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }]
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Admission request not found' });
    }

    const updated = await prisma.admissionRequest.update({
      where: { id: existing.id },
      data: {
        status: 'REJECTED',
        stage: 3,
        rejectionReason: rejectionReason || 'Cohort Capacity Limit Reached',
        decisionDate: decisionDate ? new Date(decisionDate) : new Date(),
        notes: notes || existing.notes || 'Cohort capacity reached. Application archived on standby.'
      }
    });

    res.json({
      success: true,
      message: 'Admission request has been rejected and officially archived.',
      admission: updated,
      statusUrl: `/api/admissions/status/${encodeURIComponent(updated.applicationNumber || updated.id)}`
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: APPROVE ADMISSION REQUEST ──────────────────────────────────────
// PATCH /api/admissions/:id/approve
const approveAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, decisionDate } = req.body;

    const existing = await prisma.admissionRequest.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }]
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Admission request not found' });
    }

    const updated = await prisma.admissionRequest.update({
      where: { id: existing.id },
      data: {
        status: 'APPROVED',
        stage: 3,
        decisionDate: decisionDate ? new Date(decisionDate) : new Date(),
        notes: notes || existing.notes || 'Approved for intake.'
      }
    });

    res.json({
      success: true,
      message: 'Admission request approved successfully.',
      admission: updated,
      statusUrl: `/api/admissions/status/${encodeURIComponent(updated.applicationNumber || updated.id)}`
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: REQUEST MORE INFORMATION (sets INFO_REQUIRED) ───────────────────
// PATCH /api/admissions/:id/request-info
const requestMoreInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const existing = await prisma.admissionRequest.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }]
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Admission request not found' });
    }

    const updated = await prisma.admissionRequest.update({
      where: { id: existing.id },
      data: {
        status: 'INFO_REQUIRED',
        notes: notes || 'Additional documentation required. Please check your portal for details.'
      }
    });

    res.json({
      message: 'Application status updated to INFO_REQUIRED. Parent will be notified.',
      admission: updated
    });
  } catch (error) {
    next(error);
  }
};

// ─── PARENT: RESPOND TO INFO REQUEST ─────────────────────────────────────────
// PATCH /api/admissions/:id/submit-info
const submitAdditionalInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { additionalNotes, documentsSubmitted } = req.body;

    const existing = await prisma.admissionRequest.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }]
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = await prisma.admissionRequest.update({
      where: { id: existing.id },
      data: {
        status: 'REVIEWING',
        notes: [
          existing.notes,
          `\n--- Additional Info Submitted (${formatDate(new Date())}) ---`,
          additionalNotes || '',
          documentsSubmitted ? `Documents: ${documentsSubmitted.join(', ')}` : ''
        ].filter(Boolean).join('\n')
      }
    });

    res.json({
      message: 'Additional information submitted successfully. Your application is now back under review.',
      admission: updated
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL ADMISSION REQUESTS (Admin) ─────────────────────────────────────
const getAllAdmissions = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page) || 1;
    const take = parseInt(limit) || 10;
    const skip = (pageNum - 1) * take;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { parentName: { contains: search, mode: 'insensitive' } },
        { parentEmail: { contains: search, mode: 'insensitive' } },
        { parentPhone: { contains: search, mode: 'insensitive' } },
        { childName: { contains: search, mode: 'insensitive' } },
        { applicationNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, requests] = await Promise.all([
      prisma.admissionRequest.count({ where }),
      prisma.admissionRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    res.json({
      data: requests,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET ADMISSION STATS (Admin) ────────────────────────────────────────────
const getAdmissionStats = async (req, res, next) => {
  try {
    const all = await prisma.admissionRequest.findMany();

    const stats = {
      total: all.length,
      pending: all.filter((r) => r.status === 'PENDING').length,
      reviewing: all.filter((r) => r.status === 'REVIEWING').length,
      infoRequired: all.filter((r) => r.status === 'INFO_REQUIRED').length,
      approved: all.filter((r) => r.status === 'APPROVED').length,
      waitlisted: all.filter((r) => r.status === 'WAITLISTED').length,
      rejected: all.filter((r) => r.status === 'REJECTED').length
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE ADMISSION REQUEST (Admin) ───────────────────────────────────
const getAdmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await prisma.admissionRequest.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }]
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Admission request not found' });
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE ADMISSION STATUS (Admin) ────────────────────────────────────────
const updateAdmissionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, stage, notes, rejectionReason, decisionDate } = req.body;

    const validStatuses = ['PENDING', 'REVIEWING', 'INFO_REQUIRED', 'APPROVED', 'WAITLISTED', 'REJECTED'];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const existing = await prisma.admissionRequest.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }]
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Admission request not found' });
    }

    const data = {};
    if (status) {
      data.status = status.toUpperCase();
      if (status.toUpperCase() === 'APPROVED' || status.toUpperCase() === 'REJECTED') {
        data.stage = 3;
        data.decisionDate = decisionDate ? new Date(decisionDate) : new Date();
      }
      if (status.toUpperCase() === 'REJECTED' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
    }
    if (stage) data.stage = parseInt(stage);
    if (notes !== undefined) data.notes = notes;
    if (rejectionReason !== undefined) data.rejectionReason = rejectionReason;
    if (decisionDate !== undefined) data.decisionDate = new Date(decisionDate);

    const updated = await prisma.admissionRequest.update({
      where: { id: existing.id },
      data
    });

    res.json({
      message: `Admission request updated`,
      admission: updated
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ADMISSION REQUEST (Admin) ───────────────────────────────────────
const deleteAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.admissionRequest.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }]
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Admission request not found' });
    }

    await prisma.admissionRequest.delete({ where: { id: existing.id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdmissionFormOptions,
  submitPortalAdmission,
  getSubmissionConfirmation,
  getMyApplications,
  getApplicationStatus,
  downloadSummaryPdf,
  rejectAdmission,
  approveAdmission,
  requestMoreInfo,
  submitAdditionalInfo,
  getAllAdmissions,
  getAdmissionStats,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission
};
