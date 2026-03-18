// backend/src/config/constants.js
module.exports = {
  USER_ROLES: {
    ADMIN: 'admin',
    STUDENT: 'student',
    STAFF: 'staff'
  },
  
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },
  
  COMPLAINT_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    REJECTED: 'rejected'
  },
  
  ROOM_STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
    RESERVED: 'reserved'
  },
  
  STUDENT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    VACATED: 'vacated'
  },
  
  MOVEMENT_TYPE: {
    CHECK_IN: 'check_in',
    CHECK_OUT: 'check_out',
    LEAVE: 'leave',
    EMERGENCY: 'emergency'
  },
  
  DEFAULT_PAGINATION: {
    LIMIT: 10,
    PAGE: 1
  },
  
  LATE_FEE_PERCENTAGE: 0.01, // 1% per day
  MAX_LATE_FEE_PERCENTAGE: 0.1, // 10% maximum
  
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: {
      IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
      DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
  }
};