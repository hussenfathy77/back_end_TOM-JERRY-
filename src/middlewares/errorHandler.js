const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma unique constraint error (P2002) or PostgreSQL unique_violation (23505)
  if (err.code === 'P2002' || err.code === '23505') {
    const field = err.meta?.target?.[0] || (err.detail?.match(/\((.*?)\)/)?.[1]) || 'field';
    if (field === 'email') {
      return res.status(409).json({
        error: 'This email is already registered',
        code: 'EMAIL_ALREADY_REGISTERED',
        scenario: 'Email Already Registered',
        alert: {
          title: 'This email is already registered',
          message: 'An account with this email already exists. Please log in or reset your password.',
          action: {
            label: 'Log In here',
            link: '/login'
          }
        },
        errors: {
          emailAddress: 'This email address is already registered. Please log in.'
        }
      });
    }
    return res.status(409).json({
      error: `A record with this ${field} already exists`,
      code: 'DUPLICATE_RECORD'
    });
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      code: 'NOT_FOUND'
    });
  }

  // Prisma foreign key constraint (P2003)
  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'Invalid reference to related record',
      code: 'FOREIGN_KEY_ERROR'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Default error (500) - Matches "Registration Failed" state
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Unable to create your account right now. Please try again.';

  res.status(statusCode).json({
    error: message,
    code: 'REGISTRATION_FAILED',
    scenario: 'Registration Failed',
    alert: {
      title: 'Unable to create your account right now. Please try again.',
      message: 'If the issue persists, please check your network connection or contact our admissions support team.'
    }
  });
};

module.exports = errorHandler;
