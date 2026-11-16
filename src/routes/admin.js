const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const {
  getAllUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
} = require('../controllers/userController');
const {
  getAllChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild
} = require('../controllers/childController');
const {
  getAllClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getClassroomChildren,
  getUnassignedChildren,
  bulkEnrollChildren,
  unenrollChild,
  enrollByAge
} = require('../controllers/classroomController');
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');

// All admin routes require authentication and admin role
router.use(authenticateToken, requireRole('ADMIN'));

// User Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Child Management
router.get('/children', getAllChildren);
router.get('/children/:id', getChildById);
router.post('/children', createChild);
router.put('/children/:id', updateChild);
router.delete('/children/:id', deleteChild);

// Classes Management (called by classesService.js)
router.get('/classes', getAllClassrooms);
router.get('/classes/unassigned-children', getUnassignedChildren);
router.get('/classes/:id', getClassroomById);
router.get('/classes/:id/children', getClassroomChildren);
router.post('/classes', createClassroom);
router.put('/classes/:id', updateClassroom);
router.delete('/classes/:id', deleteClassroom);
router.post('/classes/:id/enroll', bulkEnrollChildren);
router.post('/classes/:id/unenroll', unenrollChild);
router.post('/classes/:id/enroll-by-age', enrollByAge);

// Staff Management (called by staffService.js)
router.get('/staff', getAllStaff);
router.get('/staff/:id', getStaffById);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

module.exports = router;
