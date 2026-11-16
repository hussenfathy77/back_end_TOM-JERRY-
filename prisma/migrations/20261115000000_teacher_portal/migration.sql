-- ============================================================
-- Migration: Teacher Portal Complete Models & Daily Activities V2
-- DailyActivity, NapLog, Milestone, TeacherNote, ClassRoutine, ChildCareNote, DailyTheme, ClassroomNotice, AttendanceAuditLog, ChildMoodLog, DevelopmentalObservation
-- ============================================================

-- AlterEnum: AttendanceStatus (Add LATE)
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'LATE';

-- CreateEnum: MealType
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'SNACK', 'DINNER');

-- CreateEnum: MealStatus
CREATE TYPE "MealStatus" AS ENUM ('ALL_EATEN', 'MOST_EATEN', 'SOME_EATEN', 'NOT_EATEN', 'REFUSED');

-- CreateEnum: NapStatus
CREATE TYPE "NapStatus" AS ENUM ('SLEEPING', 'WOKE_UP', 'REFUSED', 'COMPLETED');

-- CreateEnum: MilestoneCategory
CREATE TYPE "MilestoneCategory" AS ENUM ('PHYSICAL', 'COGNITIVE', 'SOCIAL_EMOTIONAL', 'LANGUAGE', 'SELF_CARE');

-- CreateEnum: TeacherNoteType
CREATE TYPE "TeacherNoteType" AS ENUM ('CLASSROOM_NOTE', 'MILESTONE_ALERT', 'PARENT_REMINDER', 'GENERAL');

-- CreateEnum: RoutineCategory
CREATE TYPE "RoutineCategory" AS ENUM ('MORNING_CIRCLE', 'MEAL_NAP', 'STORYTIME', 'OUTDOOR_CREATIVE', 'LEARNING_PLAY', 'FREE_PLAY', 'TRANSITION', 'OTHER');

-- CreateEnum: ChildMood
CREATE TYPE "ChildMood" AS ENUM ('HAPPY', 'CALM', 'TIRED', 'UPSET');

-- AlterTable: classrooms (Add badge, assistantTeacherName, imageUrl)
ALTER TABLE "classrooms"
    ADD COLUMN IF NOT EXISTS "badge" TEXT,
    ADD COLUMN IF NOT EXISTS "assistantTeacherName" TEXT,
    ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- AlterTable: children (Add studentId, avatar)
ALTER TABLE "children"
    ADD COLUMN IF NOT EXISTS "studentId" TEXT,
    ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- AlterTable: attendances (Add arrivalTime, guardian, pickup notes, revisionCount)
ALTER TABLE "attendances"
    ADD COLUMN IF NOT EXISTS "arrivalTime" TEXT,
    ADD COLUMN IF NOT EXISTS "guardianName" TEXT,
    ADD COLUMN IF NOT EXISTS "guardianRelation" TEXT,
    ADD COLUMN IF NOT EXISTS "pickupNote" TEXT,
    ADD COLUMN IF NOT EXISTS "specialCareNote" TEXT,
    ADD COLUMN IF NOT EXISTS "isExcused" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "session" TEXT DEFAULT 'Morning Session',
    ADD COLUMN IF NOT EXISTS "revisionCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: attendance_audit_logs
CREATE TABLE "attendance_audit_logs" (
    "id"           TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "changedById"  TEXT,
    "oldStatus"    "AttendanceStatus",
    "newStatus"    "AttendanceStatus" NOT NULL,
    "oldTime"      TEXT,
    "newTime"      TEXT,
    "reason"       TEXT DEFAULT 'Audited revision during attendance confirmation',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: daily_activities
CREATE TABLE "daily_activities" (
    "id"              TEXT NOT NULL,
    "childId"         TEXT NOT NULL,
    "date"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType"        "MealType" NOT NULL,
    "mealStatus"      "MealStatus" NOT NULL DEFAULT 'ALL_EATEN',
    "menuDescription" TEXT,
    "portion"         TEXT DEFAULT 'All',
    "time"            TEXT,
    "mealNotes"       TEXT,
    "waterCups"       INTEGER DEFAULT 4,
    "dietaryNotes"    TEXT,
    "dietaryStatus"   TEXT DEFAULT 'Normal',
    "loggedById"      TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable: nap_logs
CREATE TABLE "nap_logs" (
    "id"          TEXT NOT NULL,
    "childId"     TEXT NOT NULL,
    "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime"   TEXT NOT NULL,
    "endTime"     TEXT,
    "durationMin" INTEGER,
    "status"      "NapStatus" NOT NULL DEFAULT 'SLEEPING',
    "restQuality" TEXT DEFAULT 'Took Nap',
    "cotNumber"   TEXT DEFAULT 'Cot #12',
    "notes"       TEXT,
    "loggedById"  TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nap_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: child_mood_logs
CREATE TABLE "child_mood_logs" (
    "id"                   TEXT NOT NULL,
    "childId"              TEXT NOT NULL,
    "date"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mood"                 "ChildMood" NOT NULL DEFAULT 'HAPPY',
    "overallStatus"        TEXT DEFAULT 'Excellent',
    "behavioralHighlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes"                TEXT,
    "loggedById"           TEXT,
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_mood_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: developmental_observations
CREATE TABLE "developmental_observations" (
    "id"                 TEXT NOT NULL,
    "childId"            TEXT NOT NULL,
    "date"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "curriculumCategory" TEXT DEFAULT 'Montessori Sensory',
    "curriculumNotes"    TEXT,
    "outdoorCategory"    TEXT DEFAULT 'Art & Nature',
    "outdoorNotes"       TEXT,
    "teacherObservation" TEXT,
    "isSyncedToParent"   BOOLEAN NOT NULL DEFAULT true,
    "loggedById"         TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developmental_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: milestones
CREATE TABLE "milestones" (
    "id"          TEXT NOT NULL,
    "childId"     TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "category"    "MilestoneCategory" NOT NULL DEFAULT 'PHYSICAL',
    "achievedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loggedById"  TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teacher_notes
CREATE TABLE "teacher_notes" (
    "id"             TEXT NOT NULL,
    "teacherId"      TEXT NOT NULL,
    "classroomId"    TEXT,
    "childId"        TEXT,
    "type"           "TeacherNoteType" NOT NULL DEFAULT 'GENERAL',
    "title"          TEXT NOT NULL,
    "content"        TEXT NOT NULL,
    "isPinned"       BOOLEAN NOT NULL DEFAULT false,
    "isRead"         BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: class_routines
CREATE TABLE "class_routines" (
    "id"          TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "teacherId"   TEXT,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "category"    "RoutineCategory" NOT NULL DEFAULT 'OTHER',
    "location"    TEXT,
    "startTime"   TEXT NOT NULL,
    "endTime"     TEXT,
    "status"      TEXT DEFAULT 'Scheduled',
    "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "tags"        TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable: child_care_notes
CREATE TABLE "child_care_notes" (
    "id"          TEXT NOT NULL,
    "childId"     TEXT NOT NULL,
    "note"        TEXT NOT NULL,
    "isAllergy"   BOOLEAN NOT NULL DEFAULT false,
    "isMedical"   BOOLEAN NOT NULL DEFAULT false,
    "isUrgent"    BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_care_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: daily_themes
CREATE TABLE "daily_themes" (
    "id"             TEXT NOT NULL,
    "classroomId"    TEXT NOT NULL,
    "date"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "theme"          TEXT NOT NULL,
    "weeklyTheme"    TEXT DEFAULT 'Autumn Forest Friends & Harvest Wonder',
    "weeklyProgress" TEXT DEFAULT 'Day 3 of 4 Complete',
    "weather"        TEXT DEFAULT 'Sunny 21°C',
    "mood"           TEXT,
    "color"          TEXT,
    "emoji"          TEXT,
    "notes"          TEXT,
    "createdById"    TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: classroom_notices
CREATE TABLE "classroom_notices" (
    "id"          TEXT NOT NULL,
    "classroomId" TEXT,
    "title"       TEXT NOT NULL,
    "content"     TEXT,
    "icon"        TEXT DEFAULT 'tree',
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "broadcastAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classroom_notices_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys: attendance_audit_logs
ALTER TABLE "attendance_audit_logs"
    ADD CONSTRAINT "attendance_audit_logs_attendanceId_fkey"
    FOREIGN KEY ("attendanceId") REFERENCES "attendances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendance_audit_logs"
    ADD CONSTRAINT "attendance_audit_logs_changedById_fkey"
    FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: daily_activities
ALTER TABLE "daily_activities"
    ADD CONSTRAINT "daily_activities_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "daily_activities"
    ADD CONSTRAINT "daily_activities_loggedById_fkey"
    FOREIGN KEY ("loggedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: nap_logs
ALTER TABLE "nap_logs"
    ADD CONSTRAINT "nap_logs_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nap_logs"
    ADD CONSTRAINT "nap_logs_loggedById_fkey"
    FOREIGN KEY ("loggedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: child_mood_logs
ALTER TABLE "child_mood_logs"
    ADD CONSTRAINT "child_mood_logs_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "child_mood_logs"
    ADD CONSTRAINT "child_mood_logs_loggedById_fkey"
    FOREIGN KEY ("loggedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: developmental_observations
ALTER TABLE "developmental_observations"
    ADD CONSTRAINT "developmental_observations_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "developmental_observations"
    ADD CONSTRAINT "developmental_observations_loggedById_fkey"
    FOREIGN KEY ("loggedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: milestones
ALTER TABLE "milestones"
    ADD CONSTRAINT "milestones_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "milestones"
    ADD CONSTRAINT "milestones_loggedById_fkey"
    FOREIGN KEY ("loggedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: teacher_notes
ALTER TABLE "teacher_notes"
    ADD CONSTRAINT "teacher_notes_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_notes"
    ADD CONSTRAINT "teacher_notes_classroomId_fkey"
    FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "teacher_notes"
    ADD CONSTRAINT "teacher_notes_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: class_routines
ALTER TABLE "class_routines"
    ADD CONSTRAINT "class_routines_classroomId_fkey"
    FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_routines"
    ADD CONSTRAINT "class_routines_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: child_care_notes
ALTER TABLE "child_care_notes"
    ADD CONSTRAINT "child_care_notes_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "child_care_notes"
    ADD CONSTRAINT "child_care_notes_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: daily_themes
ALTER TABLE "daily_themes"
    ADD CONSTRAINT "daily_themes_classroomId_fkey"
    FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "daily_themes"
    ADD CONSTRAINT "daily_themes_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: classroom_notices
ALTER TABLE "classroom_notices"
    ADD CONSTRAINT "classroom_notices_classroomId_fkey"
    FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "classroom_notices"
    ADD CONSTRAINT "classroom_notices_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
